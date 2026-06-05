# WeatherOps API Documentation

Complete API reference for WeatherOps backend.

**Base URL**: `https://api.weatherops.com/api/v1`
**API Version**: 1.0.0

## Authentication

All endpoints require Bearer token authentication (except `/auth/*`).

### Get Access Token

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Refresh Access Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

**Response** (204): No content

## Locations

### Create Location

```http
POST /locations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

**Response** (201):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:30:00.000Z"
}
```

### List Locations

```http
GET /locations
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `skip` (integer): Pagination offset (default: 0)
- `limit` (integer): Results per page (default: 10, max: 100)

**Response** (200):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Lagos",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "created_at": "2024-06-05T10:30:00.000Z",
    "updated_at": "2024-06-05T10:30:00.000Z"
  }
]
```

### Get Location

```http
GET /locations/{location_id}
Authorization: Bearer <access_token>
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:30:00.000Z"
}
```

### Update Location

```http
PUT /locations/{location_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Lagos (Updated)",
  "latitude": 6.5245,
  "longitude": 3.3793
}
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos (Updated)",
  "latitude": 6.5245,
  "longitude": 3.3793,
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:35:00.000Z"
}
```

### Delete Location

```http
DELETE /locations/{location_id}
Authorization: Bearer <access_token>
```

**Response** (204): No content

## Rules

### Create Rule

```http
POST /locations/{location_id}/rules
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "High Temperature Alert",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0
}
```

**Valid Metrics**:
- `temperature` — Temperature in Celsius
- `rainfall` — Rainfall in mm
- `wind_speed` — Wind speed in km/h
- `humidity` — Humidity percentage

**Valid Operators**:
- `>` — Greater than
- `<` — Less than
- `>=` — Greater than or equal
- `<=` — Less than or equal
- `==` — Equal to

**Response** (201):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "High Temperature Alert",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "active": true,
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:30:00.000Z"
}
```

### List Rules

```http
GET /locations/{location_id}/rules
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `active` (boolean): Filter by active status
- `metric` (string): Filter by metric
- `skip` (integer): Pagination offset
- `limit` (integer): Results per page

**Response** (200):
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440111",
    "location_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "High Temperature Alert",
    "metric": "temperature",
    "operator": ">",
    "threshold": 35.0,
    "active": true,
    "created_at": "2024-06-05T10:30:00.000Z",
    "updated_at": "2024-06-05T10:30:00.000Z"
  }
]
```

### Get Rule

```http
GET /locations/{location_id}/rules/{rule_id}
Authorization: Bearer <access_token>
```

**Response** (200):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "High Temperature Alert",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "active": true,
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:30:00.000Z"
}
```

### Update Rule

```http
PUT /locations/{location_id}/rules/{rule_id}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Extreme Temperature Alert",
  "threshold": 40.0,
  "active": true
}
```

**Response** (200):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440111",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Extreme Temperature Alert",
  "metric": "temperature",
  "operator": ">",
  "threshold": 40.0,
  "active": true,
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:35:00.000Z"
}
```

### Delete Rule

```http
DELETE /locations/{location_id}/rules/{rule_id}
Authorization: Bearer <access_token>
```

**Response** (204): No content

## Alerts

### List Active Alerts

```http
GET /alerts
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `location_id` (string): Filter by location
- `status` (string): Filter by status (active/resolved)
- `skip` (integer): Pagination offset
- `limit` (integer): Results per page

**Response** (200):
```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440222",
    "location_id": "550e8400-e29b-41d4-a716-446655440000",
    "rule_id": "660e8400-e29b-41d4-a716-446655440111",
    "metric": "temperature",
    "actual_value": 38.5,
    "threshold": 35.0,
    "operator": ">",
    "status": "active",
    "weather_snapshot": {
      "temperature": 38.5,
      "rainfall": 0,
      "wind_speed": 15,
      "humidity": 65
    },
    "created_at": "2024-06-05T10:30:00.000Z",
    "updated_at": "2024-06-05T10:30:00.000Z",
    "resolved_at": null
  }
]
```

### Get Alert

```http
GET /alerts/{alert_id}
Authorization: Bearer <access_token>
```

**Response** (200):
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "rule_id": "660e8400-e29b-41d4-a716-446655440111",
  "metric": "temperature",
  "actual_value": 38.5,
  "threshold": 35.0,
  "operator": ">",
  "status": "active",
  "weather_snapshot": {
    "temperature": 38.5,
    "rainfall": 0,
    "wind_speed": 15,
    "humidity": 65
  },
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:30:00.000Z",
  "resolved_at": null
}
```

### Resolve Alert

```http
POST /alerts/{alert_id}/resolve
Authorization: Bearer <access_token>
```

**Response** (200):
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440222",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "rule_id": "660e8400-e29b-41d4-a716-446655440111",
  "metric": "temperature",
  "actual_value": 38.5,
  "threshold": 35.0,
  "operator": ">",
  "status": "resolved",
  "weather_snapshot": { ... },
  "created_at": "2024-06-05T10:30:00.000Z",
  "updated_at": "2024-06-05T10:40:00.000Z",
  "resolved_at": "2024-06-05T10:40:00.000Z"
}
```

### List Location Alerts

```http
GET /locations/{location_id}/alerts
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `status` (string): Filter by status
- `skip` (integer): Pagination offset
- `limit` (integer): Results per page

**Response** (200):
```json
[
  { ... alert object ... }
]
```

## Health & Status

### Health Check

```http
GET /health
```

**Response** (200):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "celery": "ok"
  }
}
```

### API Status

```http
GET /status
Authorization: Bearer <access_token>
```

**Response** (200):
```json
{
  "uptime_seconds": 86400,
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2024-06-05T10:30:00.000Z"
}
```

## Error Responses

### 400 Bad Request

```json
{
  "detail": "Invalid request parameter",
  "error_code": "INVALID_INPUT",
  "validation_errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "detail": "Invalid or missing authentication token",
  "error_code": "UNAUTHORIZED"
}
```

### 403 Forbidden

```json
{
  "detail": "You don't have permission to access this resource",
  "error_code": "FORBIDDEN"
}
```

### 404 Not Found

```json
{
  "detail": "Location not found",
  "error_code": "LOCATION_NOT_FOUND"
}
```

### 409 Conflict

```json
{
  "detail": "Location with this name already exists",
  "error_code": "LOCATION_ALREADY_EXISTS"
}
```

### 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "latitude"],
      "msg": "ensure this value is greater than or equal to -90",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

### 429 Too Many Requests

```json
{
  "detail": "Rate limit exceeded",
  "error_code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 60
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error",
  "error_code": "INTERNAL_ERROR",
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Rate Limiting

- **Default Limit**: 1000 requests per hour per user
- **Header**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response**: 429 when exceeded

## Pagination

Query parameters:
- `skip` — Number of items to skip (default: 0)
- `limit` — Number of items to return (default: 10, max: 100)

Example:
```http
GET /locations?skip=20&limit=10
```

## Timestamps

All timestamps are in ISO 8601 format (UTC):
```
2024-06-05T10:30:00.000Z
```

## Versioning

API version is specified in the URL path: `/api/v1/`

## Webhooks (Alert Notifications)

When a webhook is configured for a rule, alerts are sent as POST requests:

```http
POST https://your-webhook.com/alerts
Content-Type: application/json

{
  "alert_id": "770e8400-e29b-41d4-a716-446655440222",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "rule_id": "660e8400-e29b-41d4-a716-446655440111",
  "metric": "temperature",
  "value": 38.5,
  "threshold": 35.0,
  "operator": ">",
  "status": "active",
  "created_at": "2024-06-05T10:30:00.000Z"
}
```

**Expected Response**: 200-299 status code

**Retry Policy**: 3 retries with exponential backoff on 5xx errors

---

**Last Updated**: June 5, 2024
**Version**: 1.0.0
