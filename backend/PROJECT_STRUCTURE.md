# WeatherOps Backend - Complete Project Structure

## File Listing and Purpose

### Root Configuration Files

```
backend/
├── pyproject.toml                    # Project configuration (uv/pip), dependencies, tool config
├── .env.example                      # Template for environment variables
├── alembic.ini                       # Alembic configuration for migrations
├── docker-compose.yml                # Local development orchestration
└── Makefile                          # Development commands shortcuts
```

### Core Application (`app/`)

#### Main Application
```
app/
├── __init__.py                       # Package marker
└── main.py                           # FastAPI app factory, middleware, exception handlers
```

**Purpose**: Creates the FastAPI application, sets up middleware, error handlers, and lifespan management.

#### Core Module (`app/core/`)
```
app/core/
├── __init__.py                       # Exports public API
├── config.py                         # Pydantic settings, environment variable loading
├── security.py                       # JWT token creation and verification
├── logging.py                        # Structured JSON logging configuration
├── redis.py                          # Redis client and connection management
├── exceptions.py                     # Custom exception hierarchy
├── responses.py                      # Standardized API response schemas
```

**Purpose**: Provides reusable infrastructure components for configuration, security, logging, caching, and error handling.

#### Database Module (`app/database/`)
```
app/database/
├── __init__.py                       # Exports public API
├── session.py                        # Async SQLAlchemy engine and session factory
└── base.py                           # SQLAlchemy Base class and TimestampMixin
```

**Purpose**: Manages database connections, session lifecycle, and base model definitions.

#### API Layer (`app/api/`)
```
app/api/
├── __init__.py                       # Package marker
└── v1/
    ├── __init__.py                   # Package marker
    ├── router.py                     # Aggregates all v1 endpoints
    └── endpoints/
        ├── __init__.py               # Package marker
        └── health.py                 # Health check endpoint (example)
```

**Purpose**: HTTP handlers and route definitions organized by API version.

**Adding New Endpoints**:
1. Create file in `app/api/v1/endpoints/` (e.g., `users.py`)
2. Define routes using FastAPI `APIRouter`
3. Import and include in `app/api/v1/router.py`

#### Models (`app/models/`)
```
app/models/
└── __init__.py                       # Package marker (add models here)
```

**Purpose**: SQLAlchemy ORM models for database tables.

**Example Model**:
```python
# app/models/user.py
from sqlalchemy import Column, String, Integer
from app.database import Base, TimestampMixin

class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: int = Column(Integer, primary_key=True)
    email: str = Column(String(255), unique=True)
```

#### Schemas (`app/schemas/`)
```
app/schemas/
└── __init__.py                       # Package marker (add schemas here)
```

**Purpose**: Pydantic models for request/response validation.

**Example Schema**:
```python
# app/schemas/user.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    name: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
```

#### Services (`app/services/`)
```
app/services/
└── __init__.py                       # Package marker (add services here)
```

**Purpose**: Business logic layer, handles domain rules and orchestration.

**Example Service**:
```python
# app/services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository

class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)
    
    async def create_user(self, user_data):
        # Business logic here
        return await self.repo.create(user_data)
```

#### Repositories (`app/repositories/`)
```
app/repositories/
└── __init__.py                       # Package marker (add repositories here)
```

**Purpose**: Data access layer, abstracts database operations.

**Example Repository**:
```python
# app/repositories/user_repository.py
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, user_data):
        user = User(**user_data)
        self.db.add(user)
        await self.db.commit()
        return user
```

#### Workers (`app/workers/`)
```
app/workers/
├── __init__.py                       # Package marker
├── celery_app.py                     # Celery configuration and initialization
└── tasks/
    ├── __init__.py                   # Package marker
    └── ping.py                       # Example task (returns "pong")
```

**Purpose**: Asynchronous task processing with Celery.

**Adding New Tasks**:
1. Create file in `app/workers/tasks/` (e.g., `alerts.py`)
2. Define task with `@celery_app.task` decorator
3. Task is automatically discovered by Celery

#### Utilities (`app/utils/`)
```
app/utils/
└── __init__.py                       # Package marker (add helpers here)
```

**Purpose**: Reusable helper functions and utilities.

### Tests (`tests/`)
```
tests/
├── __init__.py                       # Package marker
├── conftest.py                       # Pytest fixtures and configuration
└── test_health.py                    # Example test for health endpoint
```

**Purpose**: Automated tests for the application.

**Test Structure**:
- Mirror app structure: `tests/test_api/`, `tests/test_services/`, etc.
- Use fixtures from `conftest.py`
- Run with: `pytest -v`

### Database Migrations (`alembic/`)
```
alembic/
├── __init__.py                       # Package marker
├── env.py                            # Migration environment configuration
├── script.py.mako                    # Migration template
└── versions/
    ├── __init__.py                   # Package marker
    └── [migration files go here]
```

**Purpose**: Database schema version control.

**Working with Migrations**:
```bash
# Create migration from model changes
alembic revision --autogenerate -m "Add users table"

# Apply migrations
alembic upgrade head

# View history
alembic history
```

### Docker (`docker/`)
```
docker/
└── Dockerfile                        # Multi-stage Docker build configuration
```

**Purpose**: Container image definition.

### Requirements
```
requirements/
├── base.txt                          # Production dependencies
└── dev.txt                           # Development dependencies (includes base)
```

**Purpose**: Pip-compatible dependency specifications.

### Documentation
```
├── README.md                         # Full project documentation
├── QUICKSTART.md                     # Get running in 5 minutes
├── ARCHITECTURE.md                   # Design decisions and patterns
├── DEPLOYMENT.md                     # Production deployment guide
├── PROJECT_STRUCTURE.md              # This file
└── .gitignore                        # Git ignore rules
```

## Directory Tree (Complete)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── router.py
│   │       └── endpoints/
│   │           ├── __init__.py
│   │           └── health.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── logging.py
│   │   ├── redis.py
│   │   ├── exceptions.py
│   │   └── responses.py
│   ├── database/
│   │   ├── __init__.py
│   │   ├── session.py
│   │   └── base.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   ├── repositories/
│   │   └── __init__.py
│   ├── utils/
│   │   └── __init__.py
│   └── workers/
│       ├── __init__.py
│       ├── celery_app.py
│       └── tasks/
│           ├── __init__.py
│           └── ping.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_health.py
├── alembic/
│   ├── __init__.py
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── __init__.py
├── docker/
│   └── Dockerfile
├── requirements/
│   ├── base.txt
│   └── dev.txt
├── pyproject.toml
├── alembic.ini
├── docker-compose.yml
├── Makefile
├── .env.example
├── .gitignore
├── README.md
├── QUICKSTART.md
├── ARCHITECTURE.md
├── DEPLOYMENT.md
└── PROJECT_STRUCTURE.md
```

## Common Development Workflows

### Adding a New API Endpoint

1. **Create Model** (`app/models/alert.py`):
```python
class WeatherAlert(Base, TimestampMixin):
    __tablename__ = "weather_alerts"
    id: int = Column(Integer, primary_key=True)
    location: str = Column(String(255))
    condition: str = Column(String(50))
```

2. **Create Schema** (`app/schemas/alert.py`):
```python
class AlertCreate(BaseModel):
    location: str
    condition: str

class AlertResponse(BaseModel):
    id: int
    location: str
    condition: str
```

3. **Create Repository** (`app/repositories/alert_repository.py`):
```python
class AlertRepository:
    async def create(self, db: AsyncSession, alert_data):
        alert = WeatherAlert(**alert_data)
        db.add(alert)
        await db.commit()
        return alert
```

4. **Create Service** (`app/services/alert_service.py`):
```python
class AlertService:
    async def create_alert(self, db, alert_data):
        return await AlertRepository(db).create(alert_data)
```

5. **Create Endpoint** (`app/api/v1/endpoints/alerts.py`):
```python
router = APIRouter(prefix="/alerts")

@router.post("")
async def create_alert(
    alert: AlertCreate,
    service: AlertService = Depends(AlertService),
):
    return await service.create_alert(alert)
```

6. **Include in Router** (`app/api/v1/router.py`):
```python
from app.api.v1.endpoints.alerts import router as alerts_router
api_v1_router.include_router(alerts_router)
```

7. **Create Tests** (`tests/test_alerts.py`):
```python
@pytest.mark.asyncio
async def test_create_alert(client):
    response = await client.post(
        "/api/v1/alerts",
        json={"location": "NYC", "condition": "rain"}
    )
    assert response.status_code == 200
```

8. **Create Migration**:
```bash
alembic revision --autogenerate -m "Add weather_alerts table"
alembic upgrade head
```

### Adding a Background Task

1. **Create Task** (`app/workers/tasks/weather_check.py`):
```python
@celery_app.task(bind=True, name="tasks.check_weather")
def check_weather_task(self, location):
    # Task logic
    return f"Checked weather for {location}"
```

2. **Call from Service**:
```python
from app.workers.celery_app import celery_app

class WeatherService:
    def trigger_weather_check(self, location):
        celery_app.send_task('tasks.check_weather', args=[location])
```

3. **Test Task**:
```python
from app.workers.tasks.weather_check import check_weather_task

def test_check_weather():
    result = check_weather_task.apply_async(args=['NYC'])
    assert result.get() == "Checked weather for NYC"
```

## Key Principles

1. **Separation of Concerns**: Each layer has one responsibility
2. **Dependency Injection**: Inject dependencies, don't create them
3. **Type Safety**: Use type hints everywhere
4. **Async-First**: All I/O is non-blocking
5. **Testing**: Test every layer independently
6. **Error Handling**: Catch and format errors consistently
7. **Documentation**: Document why, not what

## File Size Guidelines

- **Models**: < 500 lines per file
- **Services**: < 300 lines per file
- **Endpoints**: < 200 lines per file
- **Tests**: Mirror the code being tested

## Import Organization

In all files, follow this import order:

```python
# 1. Standard library
import json
from datetime import datetime

# 2. Third-party libraries
import sqlalchemy
from fastapi import APIRouter

# 3. Local imports
from app.core.config import get_settings
from app.database import get_db_session
```

## Next Steps

1. Read `QUICKSTART.md` to get running
2. Read `ARCHITECTURE.md` to understand design decisions
3. Review `README.md` for detailed documentation
4. Check out `health.py` endpoint as an example
5. Start building your features!

---

**Last Updated**: June 5, 2024
**Version**: 0.1.0
