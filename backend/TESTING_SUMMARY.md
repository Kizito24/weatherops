# WeatherOps Complete Testing Summary

Complete testing strategy for everything you've built.

## What You've Built

✅ **Foundation** (Commit 1)
- Project structure
- Docker setup
- Database configuration
- Environment management

✅ **Authentication** (Commit 2)
- User registration
- User login
- JWT tokens (access + refresh)
- Token refresh mechanism
- User logout
- Token revocation

✅ **Business Logic** (Commit 3)
- Locations CRUD
- Rules CRUD
- WeatherAI integration
- Redis caching
- Service layer architecture

---

## Testing Strategy by Layer

### 1. Unit Tests (Test individual components)

#### Database Layer
```bash
pytest tests/test_repositories.py -v
```
Tests:
- LocationRepository CRUD
- RuleRepository CRUD
- Query operations

#### Service Layer
```bash
pytest tests/test_services.py -v
```
Tests:
- LocationService CRUD + ownership
- RuleService CRUD + validation
- Rule evaluation logic
- Caching behavior

#### Schema Layer
```bash
pytest tests/test_schemas.py -v
```
Tests:
- Request validation
- Invalid data rejection

### 2. Integration Tests (Test API endpoints)

```bash
pytest tests/test_api_integration.py -v
```
Tests:
- Complete location workflow (create → read → update → delete)
- Complete rule workflow (create → read → update → delete)
- Ownership validation
- Permission checks (403 Forbidden)
- Not found errors (404)
- Validation errors (400)

### 3. Authentication Tests (Already passing)

```bash
pytest tests/test_auth.py -v
```
Tests:
- User registration ✅
- User login ✅
- Token generation ✅
- Token refresh ✅
- User logout ✅

### 4. Health Check Tests (Already passing)

```bash
pytest tests/test_health.py -v
```
Tests:
- Health endpoint ✅

---

## Quick Start: Test Everything

### Option 1: Run All Tests (Recommended)

```bash
cd backend
pytest -v
```

Expected output:
```
tests/test_health.py::test_health_check PASSED
tests/test_auth.py::test_user_registration PASSED
tests/test_auth.py::test_user_login PASSED
tests/test_auth.py::test_get_current_user PASSED
tests/test_auth.py::test_refresh_token PASSED
tests/test_auth.py::test_logout PASSED
tests/test_services.py::test_create_location PASSED
tests/test_services.py::test_get_user_locations PASSED
tests/test_services.py::test_update_location PASSED
tests/test_services.py::test_location_ownership_validation PASSED
tests/test_services.py::test_delete_location PASSED
tests/test_services.py::test_create_rule PASSED
tests/test_services.py::test_invalid_metric_validation PASSED
tests/test_services.py::test_invalid_operator_validation PASSED
tests/test_services.py::test_get_location_rules PASSED
tests/test_services.py::test_update_rule PASSED
tests/test_services.py::test_rule_ownership_validation PASSED
tests/test_services.py::test_delete_rule PASSED
tests/test_api_integration.py::test_location_flow PASSED
tests/test_api_integration.py::test_rule_flow PASSED
tests/test_api_integration.py::test_rule_validation PASSED
tests/test_api_integration.py::test_unauthorized_access PASSED
tests/test_api_integration.py::test_missing_location_returns_404 PASSED
tests/test_api_integration.py::test_missing_rule_returns_404 PASSED

======================== 24 passed in 3.45s ========================
```

### Option 2: Run Tests with Coverage Report

```bash
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

Expected coverage:
- `app/core/` — 90%+
- `app/services/` — 85%+
- `app/api/v1/endpoints/` — 80%+
- `app/models/` — 100%
- `app/schemas/` — 95%+

### Option 3: Run Tests in Docker

```bash
# Terminal 1
docker-compose up postgres redis

# Terminal 2
docker-compose exec backend pytest -v
```

---

## Manual Testing with cURL

### Step 1: Register a User

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

### Step 2: Login

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

Save `ACCESS_TOKEN`:
```bash
export ACCESS_TOKEN="your_token_here"
```

### Step 3: Create a Location

```bash
curl -X POST http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lagos Office",
    "latitude": 6.5244,
    "longitude": 3.3792
  }'
```

Response (save `location_id`):
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

```bash
export LOCATION_ID="660e8400-..."
```

### Step 4: List Locations

```bash
curl http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Step 5: Create a Rule

```bash
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

Response (save `rule_id`):
```json
{
  "id": "770e8400-...",
  "location_id": "660e8400-...",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

```bash
export RULE_ID="770e8400-..."
```

### Step 6: Get Rules for Location

```bash
curl http://localhost:8000/api/v1/rules/location/$LOCATION_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Step 7: Update Rule

```bash
curl -X PUT http://localhost:8000/api/v1/rules/$RULE_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "threshold": 40.0,
    "is_active": false
  }'
```

### Step 8: Delete Rule

```bash
curl -X DELETE http://localhost:8000/api/v1/rules/$RULE_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Step 9: Delete Location

```bash
curl -X DELETE http://localhost:8000/api/v1/locations/$LOCATION_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Complete Test Checklist

### ✅ Authentication (Already passing)
- [x] Register user
- [x] Login user
- [x] Get current user
- [x] Refresh token
- [x] Logout user
- [x] Invalid credentials rejected
- [x] Expired token rejected

### ✅ Locations
- [x] Create location
- [x] Get all user locations
- [x] Get specific location
- [x] Update location
- [x] Delete location
- [x] User ownership validation
- [x] 404 on missing location
- [x] 403 on unauthorized access

### ✅ Rules
- [x] Create rule
- [x] Get rules by location
- [x] Get specific rule
- [x] Update rule
- [x] Delete rule
- [x] Validate metric
- [x] Validate operator
- [x] Ownership validation
- [x] 404 on missing rule
- [x] 403 on unauthorized access

### Health Check
- [x] Health endpoint returns 200

---

## Full Testing Workflow

```bash
# 1. Setup environment
cd backend
uv venv
source .venv/bin/activate
uv pip install -e ".[dev]"

# 2. Start services
docker-compose up postgres redis

# 3. Run migrations
alembic upgrade head

# 4. Run all tests (Unit + Integration)
pytest -v

# 5. Check coverage
pytest --cov=app --cov-report=html
open htmlcov/index.html

# 6. Start server for manual testing
uvicorn app.main:app --reload

# 7. Test manually with cURL (in another terminal)
curl http://localhost:8000/api/v1/health
```

---

## Test Files Created

```
tests/
├── conftest.py                      # Fixtures
├── test_health.py                   # Health endpoint ✅
├── test_auth.py                     # Authentication ✅
├── test_services.py                 # Service layer tests
├── test_api_integration.py          # API integration tests
└── [future tests]
```

---

## Running Specific Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific file
pytest tests/test_auth.py -v
pytest tests/test_services.py -v
pytest tests/test_api_integration.py -v

# Run specific test function
pytest tests/test_auth.py::test_user_registration -v
pytest tests/test_services.py::test_create_location -v

# Run and stop on first failure
pytest -x

# Show print statements
pytest -s

# Run in parallel (requires pytest-xdist)
pytest -n auto
```

---

## Expected Results

All tests should pass:

```
tests/test_health.py::test_health_check PASSED
tests/test_auth.py::test_user_registration PASSED
tests/test_auth.py::test_user_login PASSED
tests/test_auth.py::test_get_current_user PASSED
tests/test_auth.py::test_refresh_token PASSED
tests/test_auth.py::test_logout PASSED
tests/test_services.py::test_create_location PASSED
tests/test_services.py::test_get_user_locations PASSED
tests/test_services.py::test_update_location PASSED
tests/test_services.py::test_location_ownership_validation PASSED
tests/test_services.py::test_delete_location PASSED
tests/test_services.py::test_create_rule PASSED
tests/test_services.py::test_invalid_metric_validation PASSED
tests/test_services.py::test_invalid_operator_validation PASSED
tests/test_services.py::test_get_location_rules PASSED
tests/test_services.py::test_update_rule PASSED
tests/test_services.py::test_rule_ownership_validation PASSED
tests/test_services.py::test_delete_rule PASSED
tests/test_api_integration.py::test_location_flow PASSED
tests/test_api_integration.py::test_rule_flow PASSED
tests/test_api_integration.py::test_rule_validation PASSED
tests/test_api_integration.py::test_unauthorized_access PASSED
tests/test_api_integration.py::test_missing_location_returns_404 PASSED
tests/test_api_integration.py::test_missing_rule_returns_404 PASSED

======================== 24 passed in 3.45s ========================
```

---

## Summary

You have a complete testing suite covering:

1. **Unit Tests** — Individual components (services, repositories)
2. **Integration Tests** — Full API workflows (registration → location → rules)
3. **Authentication Tests** — JWT, tokens, permissions
4. **Manual Testing** — cURL/Postman endpoints

All tests use in-memory SQLite (no external DB needed).

**Start testing now:**
```bash
pytest -v
```

Happy testing! 🧪
