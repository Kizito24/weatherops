# WeatherOps API - Quick Reference

Quick lookup guide for common API endpoints and operations.

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All endpoints (except /health and /auth/register, /auth/login) require:
```
Authorization: Bearer {access_token}
```

## Essential Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create new user account |
| POST | /auth/login | Get access and refresh tokens |
| POST | /auth/refresh | Get new access token |
| POST | /auth/logout | Logout and invalidate token |

### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /locations | List all locations |
| POST | /locations | Create new location |
| GET | /locations/{id} | Get location details |
| PATCH | /locations/{id} | Update location |
| DELETE | /locations/{id} | Delete location |

### Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /rules | Create new rule |
| GET | /rules/location/{location_id} | Get location rules |
| GET | /rules/{id} | Get rule details |
| PATCH | /rules/{id} | Update rule |
| DELETE | /rules/{id} | Delete rule |
| POST | /rules/{id}/toggle | Enable/disable rule |

### Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /alerts | List all alerts (with filters) |
| GET | /alerts/location/{location_id} | Get location alerts |
| GET | /alerts/{id} | Get alert details |
| PATCH | /alerts/{id} | Update alert status |
| DELETE | /alerts/{id} | Delete alert |
| POST | /alerts/clear-all | Clear all resolved alerts |

### Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /preferences | Get user preferences |
| PATCH | /preferences | Update preferences |
| DELETE | /preferences | Reset preferences |

## Common cURL Commands

### Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePassword123!"}'
```

### Create Location
```bash
curl -X POST http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Lagos Office","latitude":6.5244,"longitude":3.3792}'
```

### List Locations
```bash
curl -X GET http://localhost:8000/api/v1/locations \
  -H "Authorization: Bearer $TOKEN"
```

### Create Rule
```bash
curl -X POST http://localhost:8000/api/v1/rules \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"location_id":"550e8400...","metric":"temperature","operator":">","threshold":35.0}'
```

### Get Alerts with Filtering
```bash
curl -X GET "http://localhost:8000/api/v1/alerts?location_id=550e8400...&severity=HIGH&status=active" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Alert Status
```bash
curl -X PATCH http://localhost:8000/api/v1/alerts/550e8400... \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"resolved"}'
```

## Query Parameters

### Alerts Filtering
- `location_id` (UUID): Filter by location
- `severity` (string): LOW, MEDIUM, HIGH
- `status` (string): active, resolved
- `limit` (integer): 1-1000 (default 100)
- `offset` (integer): Results to skip (default 0)

### Location Alerts
- `severity` (string): Optional severity filter
- `limit` (integer): 1-1000 (default 50)

## Metric Types
- `temperature` - Temperature in Celsius
- `rainfall` - Rainfall in millimeters
- `wind_speed` - Wind speed in m/s
- `humidity` - Humidity in percentage

## Operators
- `>` - Greater than
- `<` - Less than
- `>=` - Greater than or equal to
- `<=` - Less than or equal to
- `==` - Exactly equal

## Severity Levels
- `LOW` - Low severity alert
- `MEDIUM` - Medium severity alert
- `HIGH` - High severity alert

## Alert Status
- `active` - Alert is ongoing
- `resolved` - Alert has been resolved

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success - with response body |
| 201 | Created - resource created |
| 204 | No Content - success without body |
| 400 | Bad Request - invalid data |
| 401 | Unauthorized - missing/invalid token |
| 403 | Forbidden - access denied |
| 404 | Not Found - resource doesn't exist |
| 422 | Validation Error - invalid fields |
| 500 | Internal Error - server error |

## Request Headers

Required:
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

Optional:
```
User-Agent: MyApp/1.0
Accept: application/json
```

## Response Headers

Useful headers in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1617817200
Content-Type: application/json
```

## Pagination Example

Get first 10 alerts:
```bash
GET /alerts?limit=10&offset=0
```

Get next 10 alerts:
```bash
GET /alerts?limit=10&offset=10
```

## Filtering Examples

Get active high-severity alerts:
```bash
GET /alerts?status=active&severity=HIGH
```

Get alerts for specific location:
```bash
GET /alerts?location_id=550e8400...
```

Get resolved alerts in last page:
```bash
GET /alerts?status=resolved&limit=100&offset=0
```

## Error Responses

### Missing Authorization
```json
{
  "detail": "Not authenticated"
}
```

### Invalid Data
```json
{
  "detail": "Invalid latitude: must be between -90 and 90"
}
```

### Not Found
```json
{
  "detail": "Location not found"
}
```

### Validation Error
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

## Environment Variables

Development setup:
```bash
export API_BASE_URL=http://localhost:8000/api/v1
export API_TOKEN=your_access_token_here
```

## Testing with Postman

1. Create new Postman collection
2. Add Authorization tab → Type: Bearer Token
3. Add variable: `{{token}}` → Set from login response
4. Use `{{API_BASE_URL}}` in requests

## Testing with Insomnia

1. Create new Request Collection
2. Auth → Bearer Token → `{{ access_token }}`
3. Set environment variable from login response

## Common Workflows

### Complete Workflow
1. POST /auth/login → Get token
2. POST /locations → Create location
3. POST /rules → Create rule for location
4. GET /alerts → Check for alerts
5. PATCH /alerts/{id} → Resolve alert
6. POST /auth/logout → Logout

### Monitor Workflow
1. Login with token
2. GET /locations → See all locations
3. GET /alerts?status=active → See active alerts
4. PATCH /alerts/{id} → Resolve alerts

### Setup Workflow
1. POST /auth/register → Create account
2. POST /auth/login → Get token
3. POST /locations → Add monitoring location
4. POST /rules → Create alert rules
5. PATCH /preferences → Set notification preferences

## Rate Limits

- 60 requests per minute per user
- 3,600 requests per hour per user
- 10 requests per second (burst)

When limit exceeded:
```json
{
  "detail": "Rate limit exceeded. Try again later."
}
```

## Timestamps

All timestamps are in ISO 8601 format:
```
2024-06-05T10:30:00Z
```

## UUIDs

All IDs are UUID v4 format:
```
550e8400-e29b-41d4-a716-446655440000
```

## Useful Tools

- **OpenAPI UI**: http://localhost:8000/docs (Swagger)
- **Alternative UI**: http://localhost:8000/redoc (ReDoc)
- **OpenAPI Spec**: http://localhost:8000/openapi.json

## Resources

- Full API Documentation: See API_DOCUMENTATION.md
- OpenAPI Specification: See openapi.yaml
- Code Examples: See backend/tests/ for examples
- Support: support@weatherops.local
