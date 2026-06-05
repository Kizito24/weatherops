# WeatherOps Testing Guide

Complete testing strategy for the entire application.

## Table of Contents

1. [Setup](#setup)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [End-to-End Tests](#end-to-end-tests)
5. [Manual Testing](#manual-testing)
6. [Running All Tests](#running-all-tests)

---

## Setup

### Prerequisites

```bash
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"
```

### Environment

Tests use in-memory SQLite database (no PostgreSQL needed).

---

## Unit Tests

### Test Service Layer

Create `backend/tests/test_services.py`:

```bash
# Run service unit tests
pytest tests/test_services.py -v
```

Tests:
- LocationService CRUD operations
- RuleService CRUD operations
- RuleService validation
- WeatherService caching
- Rule evaluation logic

### Test Repository Layer

Create `backend/tests/test_repositories.py`:

```bash
pytest tests/test_repositories.py -v
```

Tests:
- LocationRepository CRUD
- RuleRepository CRUD
- Query filtering

### Test Schemas

Create `backend/tests/test_schemas.py`:

```bash
pytest tests/test_schemas.py -v
```

Tests:
- LocationCreate validation
- RuleCreate validation
- Invalid data rejection

---

## Integration Tests

### Test Full API Endpoints

Create `backend/tests/test_api.py`:

```bash
pytest tests/test_api.py -v
```

Tests complete workflows:

**Authentication Flow:**
```
Register → Login → Get Token → Access Protected Route
```

**Location Flow:**
```
Register → Login → Create Location → Update → List → Delete
```

**Rule Flow:**
```
Create Location → Create Rule → Update Rule → List Rules → Delete
```

**Rule Validation:**
```
Invalid metric → Error
Invalid operator → Error
Wrong owner → 403 Forbidden
```

---

## End-to-End Tests

### Test Real Application

```bash
# Terminal 1: Start database
docker-compose up postgres redis

# Terminal 2: Run migrations
alembic upgrade head

# Terminal 3: Start server
uvicorn app.main:app --reload

# Terminal 4: Run E2E tests
pytest tests/test_e2e.py -v
```

E2E tests cover:
- Complete user journey
- Multi-step workflows
- Database persistence
- Cache behavior

---

## Manual Testing

### Using cURL

#### 1. Register User

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "id": "550e8400-...",
  "email": "test@example.com",
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### 2. Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123!"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

Save `ACCESS_TOKEN` for next requests.

#### 3. Create Location

```bash
export ACCESS_TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lagos Office",
    "latitude": 6.5244,
    "longitude": 3.3792
  }'
```

Response:
```json
{
  "id": "660e8400-...",
  "user_id": "550e8400-...",
  "name": "Lagos Office",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

Save `location_id`.

#### 4. Create Rule

```bash
export LOCATION_ID="660e8400-..."

curl -X POST http://localhost:8000/api/v1/rules \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location_id": "'$LOCATION_ID'",
    "metric": "temperature",
    "operator": ">",
    "threshold": 35.0
  }'
```

#### 5. Get All Locations

```bash
curl -X GET http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 6. Get Location Rules

```bash
curl -X GET http://localhost:8000/api/v1/rules/location/$LOCATION_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 7. Update Rule

```bash
export RULE_ID="770e8400-..."

curl -X PUT http://localhost:8000/api/v1/rules/$RULE_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "threshold": 40.0,
    "is_active": false
  }'
```

#### 8. Delete Rule

```bash
curl -X DELETE http://localhost:8000/api/v1/rules/$RULE_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

#### 9. Test Health Check

```bash
curl http://localhost:8000/api/v1/health
```

Response:
```json
{
  "status": "healthy"
}
```

### Using Postman

1. **Import Collection**
   - Create new Collection: "WeatherOps"
   - Create folders: Auth, Locations, Rules, Health

2. **Auth Folder**
   - POST /auth/register
   - POST /auth/login
   - GET /auth/me
   - POST /auth/logout

3. **Set Bearer Token**
   - In Postman: Authorization tab
   - Type: Bearer Token
   - Token: Paste from login response

4. **Locations Folder**
   - POST /locations
   - GET /locations
   - GET /locations/{id}
   - PUT /locations/{id}
   - DELETE /locations/{id}

5. **Rules Folder**
   - POST /rules
   - GET /rules/location/{location_id}
   - GET /rules/{id}
   - PUT /rules/{id}
   - DELETE /rules/{id}

---

## Running All Tests

### Run Everything

```bash
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Verbose output
pytest -v

# Stop on first failure
pytest -x

# Show print statements
pytest -s

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test function
pytest tests/test_auth.py::test_user_registration -v
```

### View Coverage Report

```bash
# Generate report
pytest --cov=app --cov-report=html

# Open report
open htmlcov/index.html  # macOS
xdg-open htmlcov/index.html  # Linux
start htmlcov/index.html  # Windows
```

---

## Test Structure

### Current Tests

```
tests/
├── test_health.py          ✅ Health endpoint
├── test_auth.py            ✅ Authentication
└── conftest.py             ✅ Fixtures
```

### Tests to Create

```
tests/
├── test_services/
│   ├── test_location_service.py
│   ├── test_rule_service.py
│   └── test_weather_service.py
├── test_repositories/
│   ├── test_location_repository.py
│   └── test_rule_repository.py
├── test_api/
│   ├── test_locations_api.py
│   ├── test_rules_api.py
│   └── test_integration_flows.py
├── test_schemas.py
└── test_e2e.py
```

---

## Testing Checklist

### ✅ Authentication
- [x] User registration
- [x] User login
- [x] Token generation
- [x] Token refresh
- [x] Logout
- [ ] Protected route access
- [ ] Invalid token handling
- [ ] Expired token handling

### ✅ Locations
- [ ] Create location (valid)
- [ ] Create location (invalid coordinates)
- [ ] Get all user locations
- [ ] Get specific location
- [ ] Update location (valid)
- [ ] Update location (partial)
- [ ] Delete location
- [ ] Ownership validation
- [ ] 404 on missing location
- [ ] 403 on unauthorized access

### ✅ Rules
- [ ] Create rule (valid)
- [ ] Create rule (invalid metric)
- [ ] Create rule (invalid operator)
- [ ] Create rule (invalid threshold)
- [ ] Get rules by location
- [ ] Get specific rule
- [ ] Update rule (valid)
- [ ] Update rule (partial)
- [ ] Delete rule
- [ ] Ownership validation
- [ ] 404 on missing rule
- [ ] 403 on unauthorized access

### Weather Integration
- [ ] Cache hit (get cached data)
- [ ] Cache miss (fetch and cache)
- [ ] Rule evaluation (condition met)
- [ ] Rule evaluation (condition not met)
- [ ] WeatherAI API error handling

---

## Docker Testing

### Run with Docker Compose

```bash
# Start all services
docker-compose up --build

# Run tests in container
docker-compose exec backend pytest -v

# Run specific test
docker-compose exec backend pytest tests/test_auth.py -v

# Stop services
docker-compose down
```

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/tests.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.12'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements/dev.txt
      
      - name: Run tests
        run: pytest --cov=app
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

---

## Performance Testing

### Load Testing

```bash
# Install Apache Bench
apt-get install apache2-utils

# Test 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:8000/api/v1/health

# Test with authentication
ab -n 100 -c 5 -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/locations
```

### Stress Testing

```bash
# Install locust
pip install locust

# Create locustfile.py
# Run tests
locust -f locustfile.py --host=http://localhost:8000
```

---

## Debug Tips

### Enable SQL Echo

```python
# In conftest.py or when creating engine
DATABASE_ECHO = True
```

Shows all SQL queries.

### Print Statements

```bash
pytest -s  # Shows all prints
```

### Run Single Test

```bash
pytest tests/test_auth.py::test_user_login -v -s
```

### Pdb Debugging

```python
# In test code
import pdb; pdb.set_trace()

# Run
pytest tests/test_auth.py -v -s
```

---

## Quick Test Workflow

```bash
# 1. Setup
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# 2. Start services
docker-compose up postgres redis

# 3. Run migrations
alembic upgrade head

# 4. Run tests
pytest -v

# 5. View coverage
pytest --cov=app --cov-report=html
open htmlcov/index.html

# 6. Start server
uvicorn app.main:app --reload

# 7. Test manually (in another terminal)
curl http://localhost:8000/api/v1/health
```

---

## Expected Test Results

### Before Tests

```
tests collected 13 items

test_health.py::test_health_check PASSED
test_auth.py::test_user_registration PASSED
test_auth.py::test_user_login PASSED
test_auth.py::test_get_current_user PASSED
test_auth.py::test_refresh_token PASSED
test_auth.py::test_logout PASSED

======================== 6 passed in 1.23s ========================
```

### After Complete Implementation

```
tests collected 75 items

test_health.py PASSED
test_auth.py PASSED
test_services.py PASSED
test_repositories.py PASSED
test_api.py PASSED
test_schemas.py PASSED
test_e2e.py PASSED

======================== 75 passed in 15.42s ========================
Coverage: 92%
```

---

## Troubleshooting

### Tests Fail: "Database locked"
→ Kill any existing SQLite processes
→ Clear `/tmp/pytest-*` directories

### Tests Fail: "Port 5432 in use"
→ `docker-compose down`
→ Wait 5 seconds
→ `docker-compose up`

### Tests Fail: "No module named app"
→ Make sure you ran `uv pip install -e .`
→ Activate venv: `source .venv/bin/activate`

### Tests Slow
→ Use `-x` flag to stop on first failure
→ Run specific test instead of all
→ Use `pytest -k pattern` to filter

---

## Next Steps

1. ✅ Run existing tests: `pytest -v`
2. ✅ Create service unit tests
3. ✅ Create repository tests
4. ✅ Create API integration tests
5. ✅ Create E2E tests
6. ✅ Achieve 80%+ coverage
7. ✅ Set up CI/CD pipeline

---

**Happy Testing!** 🧪
