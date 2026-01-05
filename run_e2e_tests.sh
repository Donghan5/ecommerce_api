#!/bin/bash

# 에러 발생 시 즉시 종료
set -e

# 색상 정의
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Starting E2E Test Automation...${NC}"

# =========================================================
# Step 0: Cleanup (기존 프로세스 정리)
# =========================================================
echo -e "${GREEN}Step 0: Cleaning up...${NC}"

# 8080 포트 점유 프로세스 종료
if lsof -t -i:8080 >/dev/null; then
  echo -e "${YELLOW}Killing process on port 8080...${NC}"
  kill $(lsof -t -i:8080) || true
fi

# 기존 컨테이너 종료
if [ -n "$(docker-compose ps -q postgres 2>/dev/null)" ]; then
  docker-compose down -v --remove-orphans
fi

# =========================================================
# Step 1: Start Database Services
# =========================================================
echo -e "${GREEN}Step 1: Starting Postgres & Redis...${NC}"

if [ -f "docker-compose.yml" ]; then
  # [중요] go_app 제외하고 DB만 실행
  docker-compose up -d postgres redis
else
  echo -e "${RED}Error: docker-compose.yml not found!${NC}"
  exit 1
fi

# =========================================================
# Step 2: Wait for Postgres
# =========================================================
echo -e "${GREEN}Step 2: Waiting for Database...${NC}"

export POSTGRES_USER=nestjs_user
export POSTGRES_DB=nestjs_db

until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}; do
  echo "Waiting for Postgres..."
  sleep 2
done

echo -e "${GREEN}Database is ready!${NC}"
sleep 2

# =========================================================
# Step 2.5: Start Go Server
# =========================================================
echo -e "${GREEN}Step 2.5: Starting Go Server...${NC}"

export POSTGRES_HOST=localhost
export POSTGRES_PASSWORD=nestjs_password
export REDIS_ADDR=localhost:6379

# Go 서버 실행 (백그라운드)
GO_PORT=8080 go run src/main.go > go_server.log 2>&1 &
GO_SERVER_PID=$!

echo "Waiting for Go Server (Port 8080)..."

MAX_RETRIES=30
COUNT=0

# 포트가 열릴 때까지 대기
while true; do
  if command -v curl >/dev/null 2>&1; then
    if curl -s http://127.0.0.1:8080 >/dev/null; then
      break
    fi
  else
    if (echo > /dev/tcp/127.0.0.1/8080) >/dev/null 2>&1; then
      break
    fi
  fi

  sleep 1
  COUNT=$((COUNT+1))
  
  if [ $COUNT -ge $MAX_RETRIES ]; then
    echo -e "${RED}Go Server failed to start!${NC}"
    echo -e "${YELLOW}--- go_server.log ---${NC}"
    cat go_server.log
    kill $GO_SERVER_PID || true
    docker-compose down
    exit 1
  fi
  echo -n "."
done

echo -e "\n${GREEN}Go Server started!${NC}"

# =========================================================
# Step 3: Run Tests
# =========================================================
echo -e "${GREEN}Step 3: Running Tests...${NC}"

export ADMIN_EMAIL=admin@example.com

TEST_EXIT_CODE=0
CI=true npm run test:e2e --detectOpenHandles || TEST_EXIT_CODE=$?

# =========================================================
# Step 4: Final Cleanup
# =========================================================
echo -e "${GREEN}Step 4: Cleanup...${NC}"

if [ -n "$GO_SERVER_PID" ]; then
  kill $GO_SERVER_PID || true
fi

docker-compose down

if [ "$TEST_EXIT_CODE" -eq 0 ]; then
  echo -e "${GREEN}SUCCESS! Tests passed.${NC}"
  rm catch_e2e_tests.log
  rm go_server.log
  exit 0
else
  echo -e "${RED}FAILURE! Tests failed.${NC}"
  echo -e "${RED}Check catch_e2e_tests.log${NC}"
  exit $TEST_EXIT_CODE
fi