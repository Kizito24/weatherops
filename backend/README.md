# WeatherOps Backend

Event-Driven Weather Intelligence Platform - Production-Grade Backend

## Overview

WeatherOps is a scalable, event-driven SaaS platform that enables businesses to:

- Monitor weather conditions across multiple locations
- Define weather-based alert rules
- Trigger real-time notifications when conditions are met
- Track and analyze alert history

This backend provides a modern, enterprise-grade API built with FastAPI, featuring:

- **Async-First Architecture**: Full async/await support for high concurrency
- **Event-Driven Processing**: Redis-based pub/sub with Celery workers
- **Clean Architecture**: Separation of concerns with layered design
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Scalable**: Horizontal scaling support with stateless design

## Technology Stack

### Core
- **Python 3.12**: Modern Python with type hints
- **FastAPI 0.115**: High-performance async web framework
- **SQLAlchemy 2.0**: Async ORM with modern patterns
- **PostgreSQL 16**: Primary data store

### Background Processing
- **Celery 5.4**: Distributed task queue
- **Redis 7**: Message broker and cache

### Development
- **Pytest**: Testing framework with async support
- **Black**: Code formatting
- **Ruff**: Fast linting
- **Mypy**: Static type checking

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Local development orchestration

## Architecture

### Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/        # Route handlers
│   │       └── router.py         # Router aggregation
│   ├── core/
│   │   ├── config.py            # Configuration management
│   │   ├── security.py          # JWT and security utilities
│   │   ├── logging.py           # Structured logging
│   │   ├── redis.py             # Redis client
│   │   ├── exceptions.py        # Custom exceptions
│   │   └── responses.py         # API response schemas
│   ├── database/
│   │   ├── base.py              # SQLAlchemy base and mixins
│   │   └── session.py           # Database session factory
│   ├── models/                  # SQLAlchemy ORM models
│   ├── schemas/                 # Pydantic request/response schemas
│   ├── services/                # Business logic layer
│   ├── repositories/            # Data access layer
│   ├── workers/
│   │   ├── celery_app.py        # Celery configuration
│   │   └── tasks/               # Async task definitions
│   ├── utils/                   # Helper functions
│   └── main.py                  # FastAPI app factory
├── tests/                       # Test suite
├── alembic/                     # Database migrations
├── docker/                      # Docker configuration
├── requirements/                # Dependency management
├── docker-compose.yml           # Local development stack
├── .env.example                 # Environment variables template
├── pyproject.toml              # Project configuration (uv/pip)
└── README.md                    # This file
```

### Architectural Principles

1. **Separation of Concerns**
   - API layer handles HTTP
   - Service layer handles business logic
   - Repository layer handles data access
   - Workers handle async tasks

2. **Dependency Injection**
   - FastAPI's `Depends()` for request-scoped dependencies
   - Database sessions injected into handlers
   - Services injected into endpoints

3. **Async-First Design**
   - All I/O operations are non-blocking
   - Proper async context management
   - Connection pooling for efficiency

4. **Type Safety**
   - Full Python 3.12 type hints
   - Pydantic for runtime validation
   - Mypy for static analysis

## Local Setup

### Prerequisites

- Python 3.12+
- Docker and Docker Compose
- uv (recommended) or pip

### Installation with uv

```bash
# Clone repository
git clone <repository>
cd backend

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -e ".[dev]"
```

### Installation with pip

```bash
# Clone repository
git clone <repository>
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements/dev.txt
```

### Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env  # or your preferred editor
```

### Local Database Setup (without Docker)

```bash
# Start PostgreSQL and Redis manually or use Docker Compose services only:
docker-compose up postgres redis

# Run migrations
alembic upgrade head

# Create superuser/admin (when implemented)
python -m app.cli create-admin
```

## Docker Setup

### Quick Start

```bash
# Build and start all services
docker-compose up --build

# First run: create database
docker-compose exec backend alembic upgrade head
```

### Available Services

- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Docker Compose Commands

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Run commands in container
docker-compose exec backend python -m pytest

# Rebuild after dependency changes
docker-compose up --build
```

## Environment Variables

Key environment variables (see `.env.example` for all):

```bash
# Application
ENVIRONMENT=development|staging|production
DEBUG=True|False
SECRET_KEY=your-secret-key

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

## Database Migrations

### Create Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add users table"
```

### Run Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade ae1027a6acf

# Rollback last migration
alembic downgrade -1

# View migration history
alembic current
alembic history
```

### Migration Best Practices

- Always test migrations locally first
- Include both up and down migrations
- Keep migrations small and focused
- Add descriptive comments in complex migrations

## Running the Application

### Development Server

```bash
# Hot reload enabled
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# With environment file
python -m uvicorn app.main:app --reload
```

### Production Server

```bash
# Using gunicorn + uvicorn workers
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

## Celery Workers

### Run Worker

```bash
# Default worker
celery -A app.workers.celery_app worker -l info

# With concurrency
celery -A app.workers.celery_app worker -l info --concurrency=4

# With specific queues
celery -A app.workers.celery_app worker -Q alerts,notifications -l info
```

### Monitor Tasks

```bash
# Start Flower (task monitoring)
celery -A app.workers.celery_app flower
# Access at http://localhost:5555

# Check task status
celery -A app.workers.celery_app inspect active
```

## Testing

### Run Tests

```bash
# All tests
pytest

# Specific test file
pytest tests/test_health.py

# With verbose output
pytest -v

# With coverage
pytest --cov=app --cov-report=html

# Run async tests
pytest -v --asyncio-mode=auto
```

### Test Structure

```
tests/
├── conftest.py              # Pytest fixtures
├── test_health.py          # Health endpoint tests
├── api/                    # API endpoint tests
├── services/               # Business logic tests
└── repositories/           # Data access layer tests
```

### Test Database

- Uses in-memory SQLite by default
- Automatically created and cleaned up
- Database session scope per test function

## Code Quality

### Formatting

```bash
# Format code with Black
black app tests

# Check formatting
black --check app tests
```

### Linting

```bash
# Lint with Ruff
ruff check app tests

# Auto-fix issues
ruff check --fix app tests
```

### Type Checking

```bash
# Run mypy
mypy app

# Strict mode
mypy app --strict
```

### Pre-commit Hook

```bash
# Format and lint on commit
black app tests && ruff check --fix app tests && mypy app
```

## API Documentation

### Interactive Docs

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Versioning

Current version: **v1**

All endpoints prefixed with `/api/v1/`

### Health Endpoint

```bash
curl http://localhost:8000/api/v1/health

# Response
{
  "status": "healthy"
}
```

## Performance Considerations

### Database Optimization
- Connection pooling (size: 20, max overflow: 0)
- Pre-ping enabled for stale connections
- Async engine for non-blocking queries
- Index strategies in migration files

### Caching Strategy
- Redis for session/token caching
- Short TTL for frequently changing data
- Cache invalidation on updates

### Worker Optimization
- Prefetch multiplier: 4
- Max tasks per child: 1000
- Task time limit: 30 minutes
- Automatic task retries on failure

## Monitoring & Logging

### Logging

- **Format**: JSON structured logs
- **Level**: Configurable (INFO by default)
- **Output**: Stdout (compatible with Docker)

### Example Log

```json
{
  "timestamp": "2024-06-05T10:30:45.123456+00:00",
  "level": "INFO",
  "logger": "app.api.v1.endpoints.health",
  "message": "Health check request",
  "module": "health",
  "function": "health_check",
  "line": 12
}
```

### Metrics

- Request count and latency
- Database query performance
- Celery task execution time
- Cache hit/miss ratios

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify connection
psql postgresql://weatherops:password@localhost:5432/weatherops

# View logs
docker-compose logs postgres
```

### Redis Connection Issues

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping

# View logs
docker-compose logs redis
```

### Migration Issues

```bash
# View current schema version
alembic current

# Check migration history
alembic history

# Attempt repair
alembic stamp head
alembic upgrade head
```

### Celery Task Issues

```bash
# Check active tasks
celery -A app.workers.celery_app inspect active

# Purge queue
celery -A app.workers.celery_app purge

# Check worker status
celery -A app.workers.celery_app inspect ping
```

## Security Considerations

### Secrets Management
- Never commit `.env` files
- Use `.env.example` as template
- Rotate `SECRET_KEY` in production
- Use environment-specific configurations

### Database Security
- Use strong passwords in production
- Enable SSL for remote connections
- Run with minimal privileges
- Regularly backup data

### API Security
- CORS configured for specific origins in production
- Rate limiting (implement as needed)
- Request validation with Pydantic
- SQL injection prevention via ORM

## Contributing

### Code Style
- Follow PEP 8 conventions
- Use type hints everywhere
- Write docstrings for public functions
- Keep functions focused and testable

### Commit Guidelines
- Clear, descriptive commit messages
- One feature/fix per commit
- Reference issues in commit body

### Pull Request Process
1. Create feature branch
2. Write tests for changes
3. Run formatters and linters
4. Submit PR with description
5. Address review comments

## Deployment

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Code formatted and linted
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security review completed
- [ ] Performance testing done

### Deployment Steps
1. Build Docker images
2. Run database migrations
3. Update environment variables
4. Deploy backend service
5. Deploy Celery workers
6. Verify health endpoints

### Rollback Procedure
1. Restore previous image version
2. Downgrade database if needed
3. Verify service health
4. Check application logs

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy 2.0 Docs](https://docs.sqlalchemy.org/)
- [Celery Documentation](https://docs.celeryproject.io/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues and questions:
1. Check existing GitHub issues
2. Review documentation
3. Create detailed issue report
4. Contact team: team@weatherops.com

## License

MIT License - See LICENSE file for details

## Changelog

### Version 0.1.0 (Initial Release)
- Project foundation and architecture
- FastAPI application factory
- Database layer with SQLAlchemy 2.0
- Redis integration
- Celery worker setup
- Docker containerization
- Comprehensive test suite
- Production-ready logging
