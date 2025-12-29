#!/bin/bash

# ==========================================
# Env variables
# ==========================================
PROJECT_NAME="ecommerce-api-deploy"
REGION="eu-west-1" # Paris, France region
AMI_ID=""
INSTANCE_TYPE="t2.micro" # Free tier
KEY_NAME="${PROJECT_NAME}-key"
SG_NAME="${PROJECT_NAME}-sg"
STATE_FILE=".aws_deploy_state"

# ==========================================
# Utility functions
# ==========================================
function log() {
    echo -e "\033[1;32m[Deploy]\033[0m $1"
}

function error() {
    echo -e "\033[1;31m[Error]\033[0m $1"
}

# ==========================================
# 1. UP: Resource creation and deployment
# ==========================================
function up() {
    log "Deploying AWS EC2."

    if [ ! -f "${KEY_NAME}.pem" ]; then
        log "Creating key pair: $KEY_NAME"
        aws ec2 create-key-pair --key-name "$KEY_NAME" --query 'KeyMaterial' --output text > "${KEY_NAME}.pem"
        chmod 400 "${KEY_NAME}.pem"
    else
        log "Using existing key pair: ${KEY_NAME}.pem"
    fi

    log "Creating security group (firewall): $SG_NAME"
    SG_ID=$(aws ec2 create-security-group --group-name "$SG_NAME" --description "Security group for Ecommerce API" --output text)
    
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22 --cidr 0.0.0.0/0 > /dev/null
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 3000 --cidr 0.0.0.0/0 > /dev/null
    aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 8080 --cidr 0.0.0.0/0 > /dev/null

    if [ -z "$AMI_ID" ]; then
        log "Searching latest Ubuntu 22.04 AMI..."
        AMI_ID=$(aws ec2 describe-images --owners 099720109477 \
            --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" "Name=state,Values=available" \
            --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text)
    fi
    log "Using AMI ID: $AMI_ID"

    log "Creating EC2 instance (Type: $INSTANCE_TYPE)..."
    INSTANCE_ID=$(aws ec2 run-instances \
        --image-id "$AMI_ID" \
        --count 1 \
        --instance-type "$INSTANCE_TYPE" \
        --key-name "$KEY_NAME" \
        --security-group-ids "$SG_ID" \
        --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$PROJECT_NAME}]" \
        --query 'Instances[0].InstanceId' \
        --output text)

    log "Finished EC2: $INSTANCE_ID. Waiting for instance to start..."
    aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"

    PUBLIC_IP=$(aws ec2 describe-instances --instance-ids "$INSTANCE_ID" --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
    log "EC2 instance running! IP: $PUBLIC_IP"

    echo "INSTANCE_ID=$INSTANCE_ID" > "$STATE_FILE"
    echo "SG_ID=$SG_ID" >> "$STATE_FILE"
    echo "KEY_NAME=$KEY_NAME" >> "$STATE_FILE"
    echo "PUBLIC_IP=$PUBLIC_IP" >> "$STATE_FILE"

    log "Connecting to SSH (30 seconds)..."
    sleep 30 # EC2 instance booting up and SSH daemon starting

    log "Compressing project files..."
    tar --exclude='node_modules' --exclude='dist' --exclude='.git' --exclude='*.pem' -czf project.tar.gz .

    log "Send files to EC2..."
    scp -o StrictHostKeyChecking=no -i "${KEY_NAME}.pem" project.tar.gz ubuntu@$PUBLIC_IP:~

    log "Remote server Docker installation and app execution..."
    ssh -o StrictHostKeyChecking=no -i "${KEY_NAME}.pem" ubuntu@$PUBLIC_IP <<EOF
        # Docker installation
        sudo apt-get update
        sudo apt-get install -y docker.io docker-compose
        sudo usermod -aG docker ubuntu

        # Unzip project files
        mkdir -p app
        tar -xzf project.tar.gz -C app
        cd app

        # Run Docker Compose
        sudo docker-compose up -d --build
EOF

    
    rm project.tar.gz
    log "Deploy completed!"
    log "NestJS API: http://$PUBLIC_IP:3000"
    log "Go API: http://$PUBLIC_IP:8080"
    log "To delete, run './aws_deploy.sh down'"
}

# ==========================================
# 2. DOWN: Resource deletion
# ==========================================
function down() {
    if [ ! -f "$STATE_FILE" ]; then
        error "Missing state file($STATE_FILE). Already deleted or never deployed."
        exit 1
    fi

    source "$STATE_FILE"

    log "Starting down process..."

    # ------------------------------------------
    # 1. Volume and Instance deletion
    # ------------------------------------------
    if [ -n "$INSTANCE_ID" ]; then
        log "EC2 instance deletion: $INSTANCE_ID"
        VOLUME_IDS=$(aws ec2 describe-instances \
            --instance-ids "$INSTANCE_ID" \
            --query 'Reservations[0].Instances[0].BlockDeviceMappings[*].Ebs.VolumeId' \
            --output text)
        
        # 1-2. 인스턴스 종료
        log "EC2 instance termination: $INSTANCE_ID"
        aws ec2 terminate-instances --instance-ids "$INSTANCE_ID" > /dev/null
        
        log "Instance termination completed. Waiting for instance to be terminated..."
        aws ec2 wait instance-terminated --instance-ids "$INSTANCE_ID"
        log "Instance terminated successfully."

        # 1-3. 볼륨 잔존 확인 및 강제 삭제
        if [ -n "$VOLUME_IDS" ]; then
            log "Remain volume deletion: $VOLUME_IDS"
            for VOL_ID in $VOLUME_IDS; do
                # 볼륨 상태 확인
                VOL_STATE=$(aws ec2 describe-volumes --volume-ids "$VOL_ID" --query 'Volumes[0].State' --output text 2>/dev/null)
                
                if [ "$VOL_STATE" == "available" ] || [ "$VOL_STATE" == "in-use" ]; then
                    log "Remain volume deletion: $VOL_ID"
                    aws ec2 delete-volume --volume-id "$VOL_ID"
                else
                    log "Volume $VOL_ID is already deleted (auto deleted)."
                fi
            done
        fi
    fi

    # ------------------------------------------
    # 2. Deletion of Security Group
    # ------------------------------------------
    if [ -n "$SG_ID" ]; then
        log "Security group deletion: $SG_ID"
        # Instance deletion immediately after deletion may cause dependency errors, so wait or retry
        sleep 5
        aws ec2 delete-security-group --group-id "$SG_ID"
    fi

    # ------------------------------------------
    # 3. Delete key pair
    # ------------------------------------------
    if [ -n "$KEY_NAME" ]; then
        log "Delete AWS key pair: $KEY_NAME"
        aws ec2 delete-key-pair --key-name "$KEY_NAME"
    fi

    # ------------------------------------------
    # 4. Local file cleanup
    # ------------------------------------------
    rm -f "${KEY_NAME}.pem"
    rm -f "$STATE_FILE"

    log "All AWS resources (instance, volume, security group, key pair) have been deleted."
	
	echo -e "\n\033[1;33m[Warning] The following resources are NOT automatically deleted by this script. Please verify manually in the AWS Console:\033[0m"
    echo "1. Manually created EBS Snapshots"
    echo "2. Manually created AMIs (Images)"
    echo "3. Elastic IPs (EIPs) - *Charges apply if allocated but not attached"
    echo "4. Separately created RDS Instances (N/A if using Docker DB)"
    echo -e "👉 AWS Console: https://console.aws.amazon.com/"
}

function help() {
	echo -e "
	===============================================
	Usage: $0 {up|down}
	===============================================
	"
}

# ==========================================
# Main execution logic
# ==========================================
case "$1" in
    up)
        up
        ;;
    down)
        down
        ;;
    help)
        help
        ;;
    *)
        help
        ;;
esac