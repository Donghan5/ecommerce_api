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

# 'docker-compose ps -q postgres' returns the Container ID if it exists, or empty if not.
if [ -n "$(docker-compose ps -q postgres 2>/dev/null)" ]; then
  echo -e "${YELLOW}Existing all container found. Removing it...${NC}"
  # -s: stops the container if running
  # -f: force removal
  # -v: removes anonymous volumes attached to the container (optional, good for fresh DB)
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

# Loop until pg_isready returns 0 (success)
until docker-compose exec -T postgres pg_isready -U ${POSTGRES_USER:-nestjs_user} -d ${POSTGRES_DB:-nestjs_db}; do
  echo "Waiting for Postgres..."
  sleep 2
done

echo -e "${GREEN}Database is ready!${NC}"
sleep 2 # buffer time

# 3. Run the E2E tests
echo -e "${GREEN}Step 3: Running E2E tests...${NC}"
# Use || true to capture failure without exiting script immediately

TEST_EXIT_CODE=0

CI=true npm run test:e2e -- --forceExit --detectOpenHandles > catch_e2e_tests.log 2>&1 || TEST_EXIT_CODE=$?

# 4. Cleanup
echo -e "${GREEN}Step 4: Cleaning up...${NC}"
docker-compose down

# Exit with the test status code
if [ "$TEST_EXIT_CODE" -eq 0 ]; then
  echo -e "${GREEN}Tests passed successfully!${NC}"
   rm catch_e2e_tests.log
  exit 0
else
  echo -e "${RED}Tests failed! Check catch_e2e_tests.log for details.${NC}"
  exit $TEST_EXIT_CODE
fi