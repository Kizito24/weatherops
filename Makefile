.PHONY: help backend-start backend-stop frontend-start frontend-stop db-reset backend-build backend-logs frontend-logs stop-all start-all

help:
	@echo "WeatherOps - Available Commands"
	@echo "================================"
	@echo ""
	@echo "Backend Commands:"
	@echo "  make backend-start      Start the backend services (FastAPI, PostgreSQL, Redis, Celery)"
	@echo "  make backend-stop       Stop the backend services"
	@echo "  make backend-logs       View backend container logs"
	@echo "  make backend-build      Build backend (install deps, run migrations)"
	@echo ""
	@echo "Frontend Commands:"
	@echo "  make frontend-start     Start the frontend dev server (port 3000)"
	@echo "  make frontend-stop      Stop the frontend dev server"
	@echo "  make frontend-logs      View frontend logs"
	@echo "  make frontend-build     Build frontend for production"
	@echo ""
	@echo "Database Commands:"
	@echo "  make db-reset           Reset the database (destroy and recreate)"
	@echo "  make db-migrate         Run database migrations"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make start-all          Start both backend and frontend"
	@echo "  make stop-all           Stop both backend and frontend"
	@echo "  make status             Show status of docker containers"
	@echo "  make help               Show this help message"
	@echo ""

# Backend targets
backend-start:
	@echo "Starting backend services (FastAPI, PostgreSQL, Redis, Celery)..."
	cd backend && docker compose up -d
	@echo "[OK] Backend services started!"
	@echo "  FastAPI API: http://localhost:8001"
	@echo "  PostgreSQL: localhost:5433"
	@echo "  Redis: localhost:6379"

backend-stop:
	@echo "Stopping backend services..."
	cd backend && docker compose down
	@echo "[OK] Backend services stopped!"

backend-logs:
	@echo "Showing backend logs (Ctrl+C to exit)..."
	cd backend && docker compose logs -f

backend-build:
	@echo "Building backend..."
	@echo "Installing dependencies and running migrations in container..."
	cd backend && docker compose exec backend pip install --upgrade pip setuptools wheel
	cd backend && docker compose exec backend pip install -r requirements/base.txt
	cd backend && docker compose exec backend alembic upgrade head
	@echo "[OK] Backend build completed!"

# Frontend targets
frontend-start:
	@echo "Starting frontend dev server..."
	cd frontend && npm install && npm run dev
	@echo "[OK] Frontend started on http://localhost:3000"

frontend-stop:
	@echo "Stopping frontend..."
	pkill -f "vite" || true
	@echo "[OK] Frontend stopped!"

frontend-logs:
	@echo "Frontend logs (if running in background)"
	@echo "Run 'make frontend-start' to see live logs"

frontend-build:
	@echo "Building frontend for production..."
	cd frontend && npm install && npm run build
	@echo "[OK] Frontend build completed!"

# Database targets
db-reset:
	@echo "WARNING: This will delete all database data!"
	@printf "Are you sure? [y/N] "; \
	read response; \
	if [ "$$response" = "y" ] || [ "$$response" = "Y" ]; then \
		echo "Resetting database..."; \
		cd backend && docker compose down -v; \
		docker volume rm weatherops_postgres_data 2>/dev/null || true; \
		docker volume rm weatherops_redis_data 2>/dev/null || true; \
		echo "Starting fresh database..."; \
		cd backend && docker compose up -d postgres redis; \
		sleep 5; \
		echo "Running migrations..."; \
		cd backend && docker compose exec -T backend alembic upgrade head; \
		echo "[OK] Database reset completed!"; \
	else \
		echo "Database reset cancelled"; \
	fi

db-migrate:
	@echo "Running database migrations..."
	cd backend && docker compose exec backend alembic upgrade head
	@echo "[OK] Migrations completed!"

# Utility targets
start-all: backend-start frontend-start
	@echo "[OK] All services started!"

stop-all: backend-stop frontend-stop
	@echo "[OK] All services stopped!"

status:
	@echo "Backend container status:"
	@cd backend && docker compose ps
	@echo ""
	@echo "Frontend status:"
	@pgrep -f "vite" > /dev/null && echo "[RUNNING] Frontend dev server is running" || echo "[STOPPED] Frontend dev server is not running"

clean:
	@echo "Cleaning up..."
	cd backend && docker compose down
	cd frontend && rm -rf dist node_modules
	@echo "[OK] Cleanup completed!"
