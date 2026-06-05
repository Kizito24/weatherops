# WeatherOps API Documentation

## Overview

WeatherOps is an event-driven weather intelligence platform that provides real-time monitoring, alert management, and automated weather-triggered actions. This API documentation covers all available endpoints, request/response schemas, authentication, and usage examples.

**API Version**: 1.1.0  
**Base URL**: `http://localhost:8000/api/v1`

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Data Models](#data-models)
4. [Endpoints](#endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)
8. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- API key (obtained by registering and logging in)
- Understanding of REST API concepts
- HTTP client (curl, Postman, etc.)

### Base URL

Development: `http://localhost:8000/api/v1`  
Production: `https://api.weatherops.local/api/v1`

### Making Your First Request

```bash
# Health check (no authentication required)
curl -X GET http://localhost:8000/api/v1/health

# Register a new user
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

## Authentication

### Overview

WeatherOps uses JWT (JSON Web Tokens) for API authentication. All authenticated endpoints require a Bearer token in the Authorization header.

### Getting a Token

#### 1. Register a User

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### 2. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### Using the Token

Include the access token in all authenticated requests:

```bash
Authorization: Bearer {access_token}
```

Example:
```bash
curl -X GET http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Refreshing Tokens

When the access token expires, use the refresh token to get a new one:

```bash
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### Token Details

- **Access Token**: Short-lived token (default 15 minutes) for API requests
- **Refresh Token**: Long-lived token for obtaining new access tokens
- **Token Type**: Always "bearer" for Bearer token authentication

## Data Models

### User

Represents a registered user account.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

### Location

Represents a geographic location to monitor weather.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos Office",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

**Fields**:
- `id`: UUID - Unique identifier
- `user_id`: UUID - Owner user ID
- `name`: String - Location name/description
- `latitude`: Number - Latitude (-90 to 90)
- `longitude`: Number - Longitude (-180 to 180)

### Rule

Defines weather thresholds and triggers alerts.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

**Fields**:
- `id`: UUID - Unique identifier
- `location_id`: UUID - Associated location
- `metric`: String - Weather metric (temperature, rainfall, wind_speed, humidity)
- `operator`: String - Comparison operator (>, <, >=, <=, ==)
- `threshold`: Number - Alert trigger threshold
- `is_active`: Boolean - Rule active status

### Alert

Triggered when a rule condition is met.

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "rule_id": "770e8400-e29b-41d4-a716-446655440000",
  "user_id": "880e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "actual_value": 38.5,
  "threshold": 35.0,
  "operator": ">",
  "severity": "HIGH",
  "status": "active",
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z",
  "resolved_at": null
}
```

**Fields**:
- `id`: UUID - Unique identifier
- `location_id`: UUID - Associated location
- `rule_id`: UUID - Triggering rule
- `user_id`: UUID - Owner user
- `metric`: String - Triggered metric
- `actual_value`: Number - Current measured value
- `threshold`: Number - Rule threshold
- `operator`: String - Comparison operator
- `severity`: String - Alert severity (LOW, MEDIUM, HIGH)
- `status`: String - Alert status (active, resolved)

### User Preference

User notification and alert settings.

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "notification_channels": ["email", "webhook"],
  "email_notifications_enabled": true,
  "sms_notifications_enabled": false,
  "webhook_notifications_enabled": true,
  "webhook_url": "https://example.com/webhooks/alerts",
  "alert_threshold": 35.0,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

## Endpoints

### Health Check

#### Check API Health

```
GET /health
```

No authentication required.

**Response** (200 OK):
```json
{
  "status": "healthy"
}
```

### Authentication

#### Register User

```
POST /auth/register
```

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Login

```
POST /auth/login
```

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

#### Refresh Token

```
POST /auth/refresh
```

**Request**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

#### Logout

```
POST /auth/logout
```

**Response** (204 No Content)

### Locations

#### List Locations

```
GET /locations
```

Returns all locations for the authenticated user.

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Lagos Office",
    "latitude": 6.5244,
    "longitude": 3.3792,
    "created_at": "2024-06-05T10:30:00Z",
    "updated_at": "2024-06-05T10:30:00Z"
  }
]
```

#### Create Location

```
POST /locations
```

**Request**:
```json
{
  "name": "Lagos Office",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos Office",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Get Location

```
GET /locations/{location_id}
```

**Path Parameters**:
- `location_id` (UUID) - Location ID

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos Office",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Update Location

```
PATCH /locations/{location_id}
```

**Path Parameters**:
- `location_id` (UUID) - Location ID

**Request**:
```json
{
  "name": "Lagos HQ",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Lagos HQ",
  "latitude": 6.5244,
  "longitude": 3.3792,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Delete Location

```
DELETE /locations/{location_id}
```

**Path Parameters**:
- `location_id` (UUID) - Location ID

**Response** (204 No Content)

### Rules

#### Create Rule

```
POST /rules
```

**Request**:
```json
{
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Get Location Rules

```
GET /rules/location/{location_id}
```

**Path Parameters**:
- `location_id` (UUID) - Location ID

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "location_id": "660e8400-e29b-41d4-a716-446655440000",
    "metric": "temperature",
    "operator": ">",
    "threshold": 35.0,
    "is_active": true,
    "created_at": "2024-06-05T10:30:00Z",
    "updated_at": "2024-06-05T10:30:00Z"
  }
]
```

#### Get Rule

```
GET /rules/{rule_id}
```

**Path Parameters**:
- `rule_id` (UUID) - Rule ID

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Update Rule

```
PATCH /rules/{rule_id}
```

**Path Parameters**:
- `rule_id` (UUID) - Rule ID

**Request**:
```json
{
  "metric": "temperature",
  "operator": ">=",
  "threshold": 38.0,
  "is_active": true
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "operator": ">=",
  "threshold": 38.0,
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Delete Rule

```
DELETE /rules/{rule_id}
```

**Path Parameters**:
- `rule_id` (UUID) - Rule ID

**Response** (204 No Content)

#### Toggle Rule Status

```
POST /rules/{rule_id}/toggle
```

**Path Parameters**:
- `rule_id` (UUID) - Rule ID

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "operator": ">",
  "threshold": 35.0,
  "is_active": false,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

### Alerts

#### Get Alerts

```
GET /alerts?location_id={location_id}&severity={severity}&status={status}&limit={limit}&offset={offset}
```

**Query Parameters**:
- `location_id` (UUID, optional) - Filter by location
- `severity` (string, optional) - Filter by severity (LOW, MEDIUM, HIGH)
- `status` (string, optional) - Filter by status (active, resolved)
- `limit` (integer, default 100) - Maximum results (1-1000)
- `offset` (integer, default 0) - Results to skip

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "location_id": "660e8400-e29b-41d4-a716-446655440000",
    "rule_id": "770e8400-e29b-41d4-a716-446655440000",
    "user_id": "880e8400-e29b-41d4-a716-446655440000",
    "metric": "temperature",
    "actual_value": 38.5,
    "threshold": 35.0,
    "operator": ">",
    "severity": "HIGH",
    "status": "active",
    "created_at": "2024-06-05T10:30:00Z",
    "updated_at": "2024-06-05T10:30:00Z",
    "resolved_at": null
  }
]
```

#### Get Location Alerts

```
GET /alerts/location/{location_id}?severity={severity}&limit={limit}
```

**Path Parameters**:
- `location_id` (UUID) - Location ID

**Query Parameters**:
- `severity` (string, optional) - Filter by severity
- `limit` (integer, default 50) - Maximum results

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "location_id": "660e8400-e29b-41d4-a716-446655440000",
    "rule_id": "770e8400-e29b-41d4-a716-446655440000",
    "user_id": "880e8400-e29b-41d4-a716-446655440000",
    "metric": "temperature",
    "actual_value": 38.5,
    "threshold": 35.0,
    "operator": ">",
    "severity": "HIGH",
    "status": "active",
    "created_at": "2024-06-05T10:30:00Z",
    "updated_at": "2024-06-05T10:30:00Z",
    "resolved_at": null
  }
]
```

#### Get Alert

```
GET /alerts/{alert_id}
```

**Path Parameters**:
- `alert_id` (UUID) - Alert ID

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "rule_id": "770e8400-e29b-41d4-a716-446655440000",
  "user_id": "880e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "actual_value": 38.5,
  "threshold": 35.0,
  "operator": ">",
  "severity": "HIGH",
  "status": "active",
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z",
  "resolved_at": null
}
```

#### Update Alert

```
PATCH /alerts/{alert_id}
```

**Path Parameters**:
- `alert_id` (UUID) - Alert ID

**Request**:
```json
{
  "status": "resolved"
}
```

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "location_id": "660e8400-e29b-41d4-a716-446655440000",
  "rule_id": "770e8400-e29b-41d4-a716-446655440000",
  "user_id": "880e8400-e29b-41d4-a716-446655440000",
  "metric": "temperature",
  "actual_value": 38.5,
  "threshold": 35.0,
  "operator": ">",
  "severity": "HIGH",
  "status": "resolved",
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z",
  "resolved_at": "2024-06-05T11:00:00Z"
}
```

#### Delete Alert

```
DELETE /alerts/{alert_id}
```

**Path Parameters**:
- `alert_id` (UUID) - Alert ID

**Response** (204 No Content)

#### Clear All Alerts

```
POST /alerts/clear-all
```

Deletes all resolved alerts for the current user.

**Response** (204 No Content)

### User Preferences

#### Get Preferences

```
GET /preferences
```

**Response** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "notification_channels": ["email", "webhook"],
  "email_notifications_enabled": true,
  "sms_notifications_enabled": false,
  "webhook_notifications_enabled": true,
  "webhook_url": "https://example.com/webhooks/alerts",
  "alert_threshold": 35.0,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Update Preferences

```
PATCH /preferences
```

**Request**:
```json
{
  "notification_channels": ["email", "webhook"],
  "email_notifications_enabled": true,
  "sms_notifications_enabled": false,
  "webhook_url": "https://example.com/webhooks/alerts",
  "alert_threshold": 35.0
}
```

**Response** (200 OK):
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "notification_channels": ["email", "webhook"],
  "email_notifications_enabled": true,
  "sms_notifications_enabled": false,
  "webhook_notifications_enabled": true,
  "webhook_url": "https://example.com/webhooks/alerts",
  "alert_threshold": 35.0,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

#### Delete Preferences

```
DELETE /preferences
```

Resets preferences to defaults.

**Response** (204 No Content)

## Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET request |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Access denied to resource |
| 404 | Not Found | Resource does not exist |
| 422 | Validation Error | Invalid field values |
| 500 | Internal Server Error | Server error |

### Example Error Responses

**401 Unauthorized - Missing Token**:
```json
{
  "detail": "Not authenticated"
}
```

**404 Not Found**:
```json
{
  "detail": "Location not found"
}
```

**400 Bad Request**:
```json
{
  "detail": "Invalid latitude: must be between -90 and 90"
}
```

**422 Validation Error**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Invalid email format",
      "type": "value_error.email"
    }
  ]
}
```

## Rate Limiting

Rate limiting prevents API abuse. Current limits:

- **Requests per minute**: 60 per user
- **Requests per hour**: 3,600 per user
- **Burst limit**: 10 requests per second

Rate limit info is included in response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1617817200
```

When rate limit is exceeded:

```json
{
  "detail": "Rate limit exceeded. Try again later."
}
```

## Examples

### Complete Workflow Example

#### 1. Register and Login

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }' | jq '.access_token' -r > token.txt

export TOKEN=$(cat token.txt)
```

#### 2. Create a Location

```bash
curl -X POST http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lagos Office",
    "latitude": 6.5244,
    "longitude": 3.3792
  }' | jq '.id' -r > location_id.txt

export LOCATION_ID=$(cat location_id.txt)
```

#### 3. Create a Rule

```bash
curl -X POST http://localhost:8000/api/v1/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"location_id\": \"$LOCATION_ID\",
    \"metric\": \"temperature\",
    \"operator\": \">\",
    \"threshold\": 35.0
  }" | jq '.id' -r > rule_id.txt

export RULE_ID=$(cat rule_id.txt)
```

#### 4. List Alerts

```bash
curl -X GET "http://localhost:8000/api/v1/alerts?location_id=$LOCATION_ID&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

#### 5. Resolve an Alert

```bash
curl -X PATCH "http://localhost:8000/api/v1/alerts/$ALERT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved"
  }' | jq .
```

### Python Example

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

class WeatherOpsClient:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        self.token = None
        self.login()

    def login(self):
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": self.email, "password": self.password}
        )
        self.token = response.json()["access_token"]

    def _headers(self):
        return {"Authorization": f"Bearer {self.token}"}

    def create_location(self, name, lat, lon):
        response = requests.post(
            f"{BASE_URL}/locations",
            json={"name": name, "latitude": lat, "longitude": lon},
            headers=self._headers()
        )
        return response.json()

    def create_rule(self, location_id, metric, operator, threshold):
        response = requests.post(
            f"{BASE_URL}/rules",
            json={
                "location_id": location_id,
                "metric": metric,
                "operator": operator,
                "threshold": threshold
            },
            headers=self._headers()
        )
        return response.json()

    def get_alerts(self, location_id=None, severity=None, status=None):
        params = {}
        if location_id:
            params["location_id"] = location_id
        if severity:
            params["severity"] = severity
        if status:
            params["status"] = status

        response = requests.get(
            f"{BASE_URL}/alerts",
            params=params,
            headers=self._headers()
        )
        return response.json()

# Usage
client = WeatherOpsClient("user@example.com", "SecurePassword123!")

# Create location
location = client.create_location("Lagos Office", 6.5244, 3.3792)
location_id = location["id"]

# Create rule
rule = client.create_rule(location_id, "temperature", ">", 35.0)

# Get alerts
alerts = client.get_alerts(location_id=location_id, status="active")
print(json.dumps(alerts, indent=2))
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const BASE_URL = 'http://localhost:8000/api/v1';

class WeatherOpsClient {
    constructor(email, password) {
        this.email = email;
        this.password = password;
        this.token = null;
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async login() {
        const response = await this.client.post('/auth/login', {
            email: this.email,
            password: this.password
        });
        this.token = response.data.access_token;
        this.client.defaults.headers.Authorization = `Bearer ${this.token}`;
    }

    async createLocation(name, lat, lon) {
        const response = await this.client.post('/locations', {
            name, latitude: lat, longitude: lon
        });
        return response.data;
    }

    async createRule(locationId, metric, operator, threshold) {
        const response = await this.client.post('/rules', {
            location_id: locationId,
            metric,
            operator,
            threshold
        });
        return response.data;
    }

    async getAlerts(filters = {}) {
        const response = await this.client.get('/alerts', { params: filters });
        return response.data;
    }
}

// Usage
(async () => {
    const client = new WeatherOpsClient('user@example.com', 'SecurePassword123!');
    await client.login();

    const location = await client.createLocation('Lagos Office', 6.5244, 3.3792);
    const rule = await client.createRule(location.id, 'temperature', '>', 35.0);
    const alerts = await client.getAlerts({ location_id: location.id, status: 'active' });

    console.log(JSON.stringify(alerts, null, 2));
})();
```

## Best Practices

### Authentication

1. **Store tokens securely**: Never hardcode tokens in code
2. **Use environment variables**: Store credentials in .env files (not in git)
3. **Refresh proactively**: Refresh tokens before they expire
4. **Revoke on logout**: Call /auth/logout to invalidate tokens
5. **HTTPS only**: Always use HTTPS in production

### API Usage

1. **Handle rate limits**: Implement exponential backoff for retries
2. **Validate inputs**: Check data before sending
3. **Use pagination**: For large result sets, use limit and offset
4. **Filter efficiently**: Use query parameters to reduce data transfer
5. **Cache responses**: Cache stable data client-side
6. **Monitor errors**: Log and track API errors

### Performance

1. **Batch operations**: Make multiple requests in sequence efficiently
2. **Use appropriate limits**: Set reasonable pagination limits
3. **Index queries**: Filter by location_id for faster results
4. **Monitor rate limits**: Check remaining quota in headers
5. **Optimize requests**: Only request needed fields

### Security

1. **Validate email addresses**: Use format validation
2. **Strong passwords**: Enforce minimum 8 characters
3. **HTTPS only**: Use TLS in production
4. **Secrets management**: Use secure credential storage
5. **Input validation**: Validate all input data
6. **CORS handling**: Configure CORS appropriately

## Support

For issues or questions:

1. Check this documentation
2. Review the OpenAPI specification (openapi.yaml)
3. Check logs for error details
4. Contact support@weatherops.local

## Version History

- **v1.1.0** - Added user preferences, improved error handling
- **v1.0.0** - Initial release with core features
