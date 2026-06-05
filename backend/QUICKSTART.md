# WeatherOps Backend - Quick Start Guide

Get up and running in 5 minutes.

## Option 1: Docker Compose (Recommended)

The fastest way to get everything running:

```bash
# Navigate to backend directory
cd backend

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up --build

# In another terminal, run migrations
docker-compose exec backend alembic upgrade head
```

Done! Your API is at **http://localhost:8000**

### Verify It Works

```bash
# Check health endpoint
curl http://localhost:8000/api/v1/health

# Response
{"status":"healthy"}

# View API docs
# Visit http://localhost:8000/docs
```

### Stop Services

```bash
docker-compose down
```

---

## Option 2: Local Development (with uv)

For development without Docker:

### 1. Create Virtual Environment

```bash
# Create venv
uv venv

# Activate it
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
uv pip install -e ".[dev]"
```

### 2. Start PostgreSQL and Redis

Using Docker for just the databases:

```bash
docker-compose up postgres redis
```

Or use your system's package manager if installed locally.

### 3. Set up Environment

```bash
cp .env.example .env

# Edit .env if needed
nano .env
```

### 4. Initialize Database

```bash
alembic upgrade head
```

### 5. Run Application

In separate terminals:

```bash
# Terminal 1: API Server
uvicorn app.main:app --reload

# Terminal 2: Celery Worker
celery -A app.workers.celery_app worker -l info
```

API is at **http://localhost:8000**

---

## Option 3: Local Development (with pip)

Same as Option 2, but use pip instead:

```bash
# Create venv
python -m venv .venv
source .venv/bin/activate

# Install
pip install -r requirements/dev.txt

# Rest is the same
```

---

## Project Structure at a Glance

```
backend/
├── app/
│   ├── api/v1/endpoints/     ← Add new endpoints here
│   ├── core/                 ← Config, logging, security
│   ├── database/             ← Database session and models
│   ├── models/               ← ORM models (add yours)
│   ├── schemas/              ← Pydantic schemas
│   ├── services/             ← Business logic
│   ├── repositories/         ← Data access
│   ├── workers/tasks/        ← Celery tasks
│   └── main.py              ← FastAPI app factory
├── tests/                    ← Tests (mirrors app structure)
├── alembic/                  ← Database migrations
├── docker/                   ← Docker configuration
└── README.md                 ← Full documentation
```

---

## Common Tasks

### Run Tests

```bash
pytest -v
pytest --cov=app --cov-report=html  # With coverage
```

### Format Code

```bash
black app tests
ruff check --fix app tests
```

### Type Check

```bash
mypy app
```

### Create Database Migration

```bash
alembic revision --autogenerate -m "Describe your change"
alembic upgrade head
```

### View API Documentation

Open browser to: **http://localhost:8000/docs**

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI app factory |
| `app/core/config.py` | Configuration management |
| `app/database/session.py` | Database setup |
| `app/database/base.py` | ORM base model |
| `docker-compose.yml` | Local environment definition |
| `.env.example` | Configuration template |
| `README.md` | Full documentation |
| `ARCHITECTURE.md` | Design decisions |

---

## Next Steps

1. **Read** `README.md` for full documentation
2. **Review** `ARCHITECTURE.md` for design patterns
3. **Explore** `app/api/v1/endpoints/health.py` for endpoint example
4. **Add** your first models in `app/models/`
5. **Create** Pydantic schemas in `app/schemas/`
6. **Implement** services in `app/services/`
7. **Write** API endpoints in `app/api/v1/endpoints/`
8. **Test** everything in `tests/`

---

## Troubleshooting

### Can't connect to database?

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify connection
psql postgresql://weatherops:password@localhost:5432/weatherops
```

### Can't import app modules?

```bash
# Make sure you're in virtual environment
source .venv/bin/activate

# Reinstall in development mode
uv pip install -e .
```

### Tests failing?

```bash
# Run with verbose output
pytest -vv tests/

# Check specific test
pytest tests/test_health.py::test_health_check -vv
```

### Redis connection error?

```bash
# Check Redis is running
docker-compose ps redis

# Test connection
redis-cli ping
```

---

## Production Checklist

Before deploying to production:

- [ ] Change `SECRET_KEY` in `.env`
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=False`
- [ ] Update database credentials
- [ ] Configure CORS properly
- [ ] Set up logging aggregation
- [ ] Configure monitoring/alerts
- [ ] Run security review
- [ ] Load test the application
- [ ] Plan database backup strategy

---

## Getting Help

1. Check `README.md` for detailed documentation
2. Read `ARCHITECTURE.md` for design patterns
3. Look at examples in existing endpoints
4. Review tests for usage patterns
5. Check FastAPI docs: https://fastapi.tiangolo.com/

---

## Key Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **Celery**: https://docs.celeryproject.io/
- **PostgreSQL**: https://www.postgresql.org/docs/
- **Redis**: https://redis.io/documentation

---

Happy coding! 🚀
