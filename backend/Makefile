.PHONY: help install dev-install format lint type-check test test-cov migrate run run-worker clean docker-build docker-up docker-down docker-logs

help:
	@echo "WeatherOps Backend - Development Commands"
	@echo ""
	@echo "Install:"
	@echo "  make install          Install dependencies"
	@echo "  make dev-install      Install dev dependencies"
	@echo ""
	@echo "Code Quality:"
	@echo "  make format           Format code with Black"
	@echo "  make lint             Lint code with Ruff"
	@echo "  make type-check       Type check with Mypy"
	@echo "  make quality          Format, lint, and type-check"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run tests"
	@echo "  make test-cov         Run tests with coverage"
	@echo ""
	@echo "Database:"
	@echo "  make migrate          Run database migrations"
	@echo "  make migrate-create   Create new migration"
	@echo ""
	@echo "Running:"
	@echo "  make run              Start development server"
	@echo "  make run-worker       Start Celery worker"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build     Build Docker images"
	@echo "  make docker-up        Start Docker Compose"
	@echo "  make docker-down      Stop Docker Compose"
	@echo "  make docker-logs      View Docker logs"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            Remove build artifacts"

install:
	uv pip install -e .

dev-install:
	uv pip install -e ".[dev]"

format:
	black app tests

lint:
	ruff check app tests

type-check:
	mypy app

quality: format lint type-check
	@echo "Code quality checks completed!"

test:
	pytest -v

test-cov:
	pytest --cov=app --cov-report=html --cov-report=term-missing

migrate:
	alembic upgrade head

migrate-create:
	@read -p "Enter migration name: " name; \
	alembic revision --autogenerate -m "$$name"

run:
	uvicorn app.main:app --reload

run-worker:
	celery -A app.workers.celery_app worker -l info

docker-build:
	docker-compose build

docker-up:
	docker-compose up

docker-up-detached:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type d -name .pytest_cache -exec rm -rf {} +
	find . -type d -name .mypy_cache -exec rm -rf {} +
	find . -type d -name htmlcov -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/ dist/

.DEFAULT_GOAL := help
