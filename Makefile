.PHONY: help install build start stop logs test lint format clean deploy

help: ## Show this help message
	@echo "Discord AI Bot - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

build: ## Build the project
	npm run build

start: ## Start the bot with Docker
	docker-compose up -d

stop: ## Stop the bot
	docker-compose down

logs: ## View bot logs
	docker-compose logs -f bot

test: ## Run tests
	npm test

lint: ## Lint code
	npm run lint

format: ## Format code
	npm run format

clean: ## Clean build artifacts
	rm -rf dist
	rm -rf node_modules
	docker-compose down -v

deploy: ## Deploy the bot (build and start)
	docker-compose up -d --build

dev: ## Start development mode
	npm run dev

restart: ## Restart the bot
	docker-compose restart bot

status: ## Check bot status
	docker-compose ps

health: ## Check health endpoint
	curl http://localhost:3000/health
