# WeatherOps - Getting Started Guide

Complete instructions to set up, configure, and run the WeatherOps application locally.

**Last Updated**: June 5, 2026  
**Application Version**: 1.1.0

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

## Prerequisites

### System Requirements

- **OS**: Linux, macOS, or Windows (WSL2)
- **CPU**: 2+ cores
- **RAM**: 4GB minimum
- **Disk**: 5GB free space

### Required Software

- **Python**: 3.10 or higher
- **Node.js**: 18+ and npm 9+
- **Docker** (optional, but recommended): Latest version
- **Git**: For version control

### Check Installed Versions

```bash
# Python
python3 --version  # Should be 3.10+

# Node.js and npm
node --version     # Should be 18+
npm --version      # Should be 9+

# Docker (optional)
docker --version   # Latest recommended
```

### Install Missing Dependencies

#### macOS (using Homebrew)
```bash
brew install python@3.11 node
```

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install python3.11 python3-pip nodejs npm
```

#### Windows
Download installers from:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

## Project Structure

```
weatherops/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Core configurations
│   │   ├── database/          # Database setup
│   │   ├── models/            # Data models
│   │   ├── repositories/      # Data repositories
│   │   ├── schemas/           # Request/response schemas
│   │   ├── services/          # Business logic
│   │   ├── workers/           # Background workers
│   │   └── main.py            # FastAPI app
│   ├── tests/                 # Test suite
│   ├── requirements.txt        # Python dependencies
│   ├── .env.example           # Example environment variables
│   ├── docker-compose.yml     # Docker services
│   └── Dockerfile             # Backend container
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── lib/               # Utilities and API clients
│   │   ├── types.ts           # TypeScript types
│   │   ├── App.tsx            # Main App component
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── e2e/                   # E2E tests
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig.json          # TypeScript configuration
│   └── .env.example           # Example environment variables
│
├── API_DOCUMENTATION.md        # API reference
├── openapi.yaml               # OpenAPI specification
├── GETTING_STARTED.md         # This file
├── docker-compose.yml         # Full stack Docker setup
└── README.md                  # Project overview
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Create Python Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source .venv/bin/activate

# On Windows (Command Prompt):
venv\Scripts\activate

# On Windows (PowerShell):
venv\Scripts\Activate.ps1
```

### Step 3: Install Python Dependencies

```bash
pip install --upgrade pip setuptools wheel
pip install -r requirements/base.txt
pip install -r requirements/dev.txt 
```

**Dependencies Installed**:
- FastAPI (web framework)
- SQLAlchemy (ORM)
- Pydantic (data validation)
- Alembic (database migrations)
- Celery (task queue)
- Redis (caching)
- Pytest (testing)
- And more...

### Step 4: Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Essential Environment Variables**:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/weatherops

# JWT
SECRET_KEY=your-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Weather API
WEATHERAI_BASE_URL=https://api.weather-ai.co
WEATHERAI_API_KEY=your-weather-api-key

# Redis
REDIS_URL=redis://localhost:6379/0

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Environment
ENVIRONMENT=development
DEBUG=True
```

**Generate a Secret Key**:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 5: Set Up Database

```bash
# Run migrations
alembic upgrade head

# Or initialize database (if migrations not available)
python3 -c "from app.database.session import init_db; init_db()"
```

### Step 6: (Optional) Use Docker for Services

Instead of installing PostgreSQL and Redis locally, use Docker:

```bash
# Start PostgreSQL and Redis containers
docker-compose -f docker-compose.yml up -d

# Check running containers
docker-compose ps
```

**What's running**:
- PostgreSQL (port 5432)
- Redis (port 6379)
- PgAdmin (port 5050)

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd frontend
```

### Step 2: Install Node Dependencies

```bash
npm install
```

**Dependencies Installed**:
- React 19
- TypeScript
- Vite (build tool)
- Tailwind CSS
- Lucide React (icons)
- Axios (HTTP client)
- Playwright (E2E testing)

### Step 3: Set Up Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your settings
nano .env.local  # or use your preferred editor
```

**Environment Variables**:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Feature Flags
VITE_ENABLE_E2E_TESTS=true
VITE_DEBUG_MODE=true
```

### Step 4: Verify Setup

```bash
# Check Node version
node --version

# Check npm packages
npm list react react-dom

# Run type checking
npm run lint
```

## Running the Application

### Full Stack (Recommended)

#### Option 1: Using Docker Compose

```bash
# From project root directory
cd ..

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check services
docker-compose ps
```

**Services Running**:
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- PgAdmin: http://localhost:5050

#### Option 2: Manual Start (Two Terminals)

**Terminal 1: Start Backend**

```bash
cd backend

# Activate virtual environment (if not already)
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

# Start FastAPI server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Terminal 2: Start Frontend**

```bash
cd frontend

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Individual Services

#### Backend Only

```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

**Available at**:
- API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

#### Frontend Only

```bash
cd frontend
npm run dev
```

**Available at**: http://localhost:5173

#### Background Worker (Celery)

```bash
cd backend
source venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=info
```

#### Celery Beat (Scheduler)

```bash
cd backend
source venv/bin/activate
celery -A app.workers.celery_app beat --loglevel=info
```

## Verification

### Check Backend

```bash
# Test API endpoint
curl http://localhost:8000/api/v1/health

# Expected response
{"status": "healthy"}
```

### Check Frontend

Open browser and visit: http://localhost:5173

You should see the login page with WeatherOps branding.

### Test API with Postman

1. Import `WeatherOps_API.postman_collection.json`
2. Set base URL: http://localhost:8000/api/v1
3. Register and login
4. Test endpoints

### Run Tests

#### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_api_integration.py

# Run specific test
pytest tests/test_api_integration.py::test_health_check
```

#### Frontend Tests

```bash
cd frontend

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth.spec.ts
```

### Check Logs

```bash
# Backend logs
docker-compose logs backend

# Frontend logs (from terminal)
# See the terminal running: npm run dev

# Database logs
docker-compose logs db

# Redis logs
docker-compose logs redis
```

## Troubleshooting

### Backend Issues

#### Port 8000 Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn app.main:app --reload --port 8001
```

#### Database Connection Error

```bash
# Check if PostgreSQL is running
docker-compose ps db

# Restart database
docker-compose restart db

# Check environment variables
cat .env | grep DATABASE_URL

# Verify connection
psql postgresql://user:password@localhost:5432/weatherops
```

#### Missing Dependencies

```bash
# Reinstall all requirements
pip install --force-reinstall -r requirements.txt

# Or upgrade pip first
pip install --upgrade pip
pip install -r requirements.txt
```

#### Virtual Environment Issues

```bash
# Delete and recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend Issues

#### Port 5173 Already in Use

```bash
# Use different port
npm run dev -- --port 5174

# Or kill process
lsof -i :5173
kill -9 <PID>
```

#### Module Not Found Error

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
npm install
```

#### TypeScript Errors

```bash
# Check TypeScript compilation
npm run lint

# Fix automatically
npm run lint -- --fix
```

#### API Connection Error

```bash
# Verify backend is running
curl http://localhost:8000/api/v1/health

# Check environment variables
cat .env.local | grep VITE_API_BASE_URL

# Update API URL if needed
# Edit .env.local with correct backend URL
```

### Docker Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs backend

# Rebuild container
docker-compose up --build

# Force recreate
docker-compose up -d --force-recreate
```

#### Docker Not Running

```bash
# Start Docker daemon
# macOS
open -a Docker

# Linux
sudo systemctl start docker

# Windows
# Start Docker Desktop
```

#### Port Already in Use (Docker)

```bash
# List running containers
docker-compose ps

# Stop all containers
docker-compose down

# Remove stopped containers
docker-compose down -v
```

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: 
1. Check DATABASE_URL in .env
2. Verify PostgreSQL is running: `docker-compose logs db`
3. Restart database: `docker-compose restart db`

### Issue: "401 Unauthorized" in frontend
**Solution**:
1. Login again
2. Check access token in browser DevTools
3. Verify API_BASE_URL in .env.local

### Issue: "Webpack/Vite compilation error"
**Solution**:
1. Delete node_modules: `rm -rf node_modules`
2. Clear cache: `npm cache clean --force`
3. Reinstall: `npm install`

### Issue: "Python ModuleNotFoundError"
**Solution**:
1. Activate virtual environment
2. Check Python version: `python --version`
3. Reinstall requirements: `pip install -r requirements.txt`

### Issue: "Red screen with JavaScript errors"
**Solution**:
1. Open browser console (F12)
2. Check error messages
3. Verify backend is running at correct URL
4. Check network tab for failed requests

## Environment Variables Reference

### Backend (.env)

```env
# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DEBUG=True

# Database
DATABASE_URL=postgresql://weatherops:password@localhost:5432/weatherops
DATABASE_ECHO=False

# JWT
SECRET_KEY=your-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Redis
REDIS_URL=redis://localhost:6379/0

# Weather API
WEATHERAI_BASE_URL=https://api.weather-ai.co
WEATHERAI_API_KEY=your-api-key-here
WEATHERAI_TIMEOUT=10

# Email (for notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
```

### Frontend (.env.local)

```env
# API
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Environment
VITE_ENVIRONMENT=development

# Features
VITE_ENABLE_E2E_TESTS=true
VITE_DEBUG_MODE=true

# Build
VITE_BUILD_TARGET=es2015
```

## Quick Start Commands

### Fast Setup (5 minutes)

```bash
# 1. Clone and setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# 2. Setup frontend (new terminal)
cd frontend
npm install

# 3. Start services (Terminal 1)
cd backend && source venv/bin/activate
python -m uvicorn app.main:app --reload

# 4. Start frontend (Terminal 2)
cd frontend
npm run dev

# 5. Open browser
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs
```

### Using Docker (3 minutes)

```bash
# 1. Start all services
docker-compose up -d

# 2. View logs
docker-compose logs -f

# 3. Access services
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

## Database Credentials (Default Docker Setup)

```
Host: localhost
Port: 5432
Database: weatherops
Username: weatherops
Password: weatherops123
```

## API Access

Once running, access API documentation:

- **Interactive Swagger UI**: http://localhost:8000/docs
- **Alternative ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Next Steps

1. **Register an Account**
   - Frontend: http://localhost:5173
   - Click "Create an account"
   - Fill in email and password

2. **Create a Location**
   - Navigate to Locations page
   - Click "Provision Location"
   - Add Lagos Office or similar

3. **Create a Rule**
   - Go to Rules page
   - Click "Define Rule"
   - Set temperature > 35°C threshold

4. **View Alerts**
   - Go to Alerts page
   - Simulate an event or wait for real data
   - See triggered alerts

5. **Test API**
   - Import Postman collection
   - Or use curl commands from documentation
   - Verify endpoints work

## Useful Development Commands

```bash
# Backend
python -m pytest              # Run tests
python -m pytest --cov       # With coverage
python -m black app/         # Format code
python -m flake8 app/        # Lint code
python -m mypy app/          # Type checking

# Frontend
npm run lint                 # Type checking
npm run build               # Production build
npm run preview             # Preview build locally
npm run test:e2e            # Run E2E tests
```

## Production Deployment

For production deployment, see:
- **Backend**: `backend/DEPLOYMENT.md`
- **Frontend**: `frontend/DEPLOYMENT.md`
- **Docker**: `docker-compose.prod.yml`

## Getting Help

### Documentation
- API Reference: `API_DOCUMENTATION.md`
- API Quick Reference: `API_QUICK_REFERENCE.md`
- OpenAPI Spec: `openapi.yaml`

### Debug Mode

```bash
# Backend debug logging
DEBUG=True python -m uvicorn app.main:app --reload

# Frontend debug mode
VITE_DEBUG_MODE=true npm run dev

# Check environment
python -c "import sys; print(sys.path)"
npm config list
```

## Stopping Services

```bash
# Stop all Docker services
docker-compose down

# Stop just remove containers (keep volumes)
docker-compose stop

# Full cleanup (remove volumes too)
docker-compose down -v

# Kill running processes
# Ctrl+C in terminal windows
```

## System Cleanup

```bash
# Remove Docker containers
docker-compose down -v

# Remove Python virtual environment
rm -rf backend/venv

# Remove Node modules
rm -rf frontend/node_modules

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete
```

---

**Questions?** Check the documentation files or create an issue.

**Ready to develop!** 🚀
