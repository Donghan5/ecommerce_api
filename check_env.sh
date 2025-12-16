# Check the existence of .env
#!/bin/sh

# Color codes
RED='\033[0;31m'
NC='\033[0m' # No Color

if [ ! -f .env ]; then
  echo "${RED}.env file not found! Please create one based on .env.example.${NC}"
  exit 1
fi