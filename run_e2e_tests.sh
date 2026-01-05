#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Define colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting E2E Test Automation...${NC}"

# 0. Check for existing database container and remove it
echo -e "${GREEN}Step 0: Checking for existing database container...${NC}"

if [ -n "$(docker-compose ps -q postgres 2>/dev/null)" ]; then
  echo -e "${YELLOW}Existing all container found. Removing it...${NC}"
  docker-compose down -v --remove-orphans
  echo -e "${GREEN}Existing all container removed.${NC}"
else
  echo "No existing postgres container found."
fi

# 1. Start Docker containers in detached mode
echo -e "${GREEN}Step 1: Starting Docker services...${NC}"
if [ -f "docker-compose.yml" ]; then
  docker-compose up -d
else
  echo -e "${RED}Error: docker-compose.yml not found!${NC}"
  exit 1
fi

# 2. Wait for Postgres to be ready
echo -e "${GREEN}Step 2: Waiting for Database to be ready...${NC}"

until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-nestjs_user} -d ${POSTGRES_DB:-nestjs_db}; do
  echo "Waiting for Postgres..."
  sleep 2
done

echo -e "${GREEN}Database is ready!${NC}"
sleep 2 # buffer time

# ==========================================
# [추가] Step 2.5: Go Server 실행
# ==========================================
echo -e "${GREEN}Step 2.5: Starting Go Inventory Server...${NC}"

# 주의: src/main.go 경로가 현재 스크립트 실행 위치 기준인지 확인하세요.
# 만약 Go 프로젝트가 다른 폴더에 있다면 'cd go-app && go run main.go' 처럼 경로를 맞춰야 합니다.
go run src/main.go > go_server.log 2>&1 &
GO_SERVER_PID=$! # 백그라운드 프로세스 ID 저장

echo "Waiting for Go Server to initialize..."
sleep 5 # Go 서버가 8080 포트를 열 때까지 대기
# ==========================================

# 3. Run the E2E tests
echo -e "${GREEN}Step 3: Running E2E tests...${NC}"

TEST_EXIT_CODE=0

# CI=true 환경변수는 Jest 등에서 대화형 모드를 끄는 데 유용합니다.
CI=true npm run test:e2e -- --forceExit --detectOpenHandles > catch_e2e_tests.log 2>&1 || TEST_EXIT_CODE=$?

# 4. Cleanup
echo -e "${GREEN}Step 4: Cleaning up...${NC}"
docker-compose down

# ==========================================
# [추가] Go Server 종료
# ==========================================
if [ -n "$GO_SERVER_PID" ]; then
  echo -e "${YELLOW}Stopping Go Server (PID: $GO_SERVER_PID)...${NC}"
  kill $GO_SERVER_PID || true # 혹시 이미 죽었더라도 에러 내지 않음
fi
# ==========================================

# Exit with the test status code
if [ "$TEST_EXIT_CODE" -eq 0 ]; then
  echo -e "${GREEN}Tests passed successfully!${NC}"
  rm catch_e2e_tests.log
  rm go_server.log # Go 서버 로그도 성공 시 삭제 (원하면 유지 가능)
  exit 0
else
  echo -e "${RED}Tests failed! Check catch_e2e_tests.log for details.${NC}"
  echo -e "${RED}You can also check go_server.log for server errors.${NC}"
  exit $TEST_EXIT_CODE
fi