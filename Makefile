.PHONY: up down

# Color codes for terminal output
GREEN := \033[0;32m
RED := \033[0;31m
NC := \033[0m

check-env:
	@./check_env.sh

up:
	@echo "Starting up the containers..."
	docker-compose up -d
down:
	@echo "Shutting down the containers..."
	docker-compose down
