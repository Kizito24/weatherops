# WeatherOps API Documentation Index

Complete reference guide for all available API documentation and tools.

## 📚 Documentation Files

### 1. **API_DOCUMENTATION.md** (Comprehensive)
- Complete API reference guide
- Getting started instructions
- Authentication detailed explanation
- All data models documented
- Complete endpoint reference with examples
- Error handling guide
- Rate limiting information
- Python and JavaScript example code
- Best practices and security guidance

**Use for**: Deep understanding of the API, complete reference material, code examples

### 2. **API_QUICK_REFERENCE.md** (Quick Lookup)
- Quick reference table of all endpoints
- Common cURL commands
- Query parameters quick reference
- HTTP status codes
- Essential environment setup
- Testing tools recommendations
- Rate limits summary
- Common workflows

**Use for**: Quick lookups, copy-paste cURL commands, testing guides

### 3. **openapi.yaml** (OpenAPI Specification)
- Complete OpenAPI 3.0 specification
- All endpoints formally defined
- Complete schema definitions
- Security definitions
- Example requests and responses
- Status codes and error responses

**Use for**: Generating client libraries, API documentation sites, automated tooling

## 🛠️ Tools & Integrations

### Postman Collection
**File**: `WeatherOps_API.postman_collection.json`

Pre-built Postman collection with:
- All endpoints organized by category
- Pre-configured headers and authentication
- Example request bodies
- Environment variables for easy workflow
- Test scripts for automatic variable handling

**How to use**:
1. Download Postman (https://www.postman.com/)
2. Import `WeatherOps_API.postman_collection.json`
3. Set environment variable: `base_url=http://localhost:8000/api/v1`
4. Start with Authentication → Login to get access token
5. Access token automatically saved to environment

### OpenAPI UI (Built-in)
Access interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 📖 Getting Started

### Step 1: Understand the Basics
Start with: **API_DOCUMENTATION.md** → Getting Started section

### Step 2: Quick Reference
Keep handy: **API_QUICK_REFERENCE.md**

### Step 3: Test with Tools
Choose your approach:
- **Option A (GUI)**: Import Postman collection → Easy visual testing
- **Option B (CLI)**: Use cURL commands from quick reference
- **Option C (Interactive)**: Open http://localhost:8000/docs in browser

### Step 4: Implement
Use appropriate examples:
- Python: See API_DOCUMENTATION.md → Python Example
- JavaScript: See API_DOCUMENTATION.md → JavaScript Example
- Other: Refer to OpenAPI spec for code generation

## 🔑 Key Sections by Use Case

### "I want to understand authentication"
→ API_DOCUMENTATION.md → Authentication section

### "I want to make a quick test request"
→ API_QUICK_REFERENCE.md → Common cURL Commands

### "I want to set up Postman"
→ Import WeatherOps_API.postman_collection.json

### "I want to build a client library"
→ openapi.yaml (use with code generators like OpenAPI Generator)

### "I want to integrate with my app"
→ API_DOCUMENTATION.md → Examples (Python/JavaScript)

### "I want endpoint details"
→ API_QUICK_REFERENCE.md → Essential Endpoints table

### "I got an error, what does it mean?"
→ API_DOCUMENTATION.md → Error Handling section

## 📋 API Endpoint Summary

### Authentication (4 endpoints)
```
POST   /auth/register       - Create new user
POST   /auth/login          - Get access token
POST   /auth/refresh        - Refresh access token
POST   /auth/logout         - Logout
```

### Locations (5 endpoints)
```
GET    /locations           - List all locations
POST   /locations           - Create location
GET    /locations/{id}      - Get location details
PATCH  /locations/{id}      - Update location
DELETE /locations/{id}      - Delete location
```

### Rules (7 endpoints)
```
POST   /rules               - Create rule
GET    /rules/location/{id} - Get location rules
GET    /rules/{id}          - Get rule details
PATCH  /rules/{id}          - Update rule
DELETE /rules/{id}          - Delete rule
POST   /rules/{id}/toggle   - Toggle rule status
```

### Alerts (7 endpoints)
```
GET    /alerts              - List alerts (with filters)
GET    /alerts/location/{id}- Get location alerts
GET    /alerts/{id}         - Get alert details
PATCH  /alerts/{id}         - Update alert status
DELETE /alerts/{id}         - Delete alert
POST   /alerts/clear-all    - Clear resolved alerts
```

### Preferences (3 endpoints)
```
GET    /preferences         - Get preferences
PATCH  /preferences         - Update preferences
DELETE /preferences         - Reset preferences
```

### Health (1 endpoint)
```
GET    /health              - Health check
```

**Total: 27 endpoints**

## 🔗 Documentation Relationships

```
Start Here
    ↓
API_QUICK_REFERENCE.md (overview of all endpoints)
    ↓
    ├→ Choose Testing Method
    │   ├→ GUI: Import to Postman
    │   ├→ CLI: Use cURL examples
    │   └→ Browser: Visit /docs endpoint
    │
    └→ Need Details?
        └→ API_DOCUMENTATION.md (complete reference)
            ├→ Getting Started
            ├→ Authentication
            ├→ Data Models
            ├→ Endpoints (detailed)
            ├→ Error Handling
            ├→ Examples (Python/JS)
            └→ Best Practices

Building Client?
    ↓
openapi.yaml (OpenAPI specification)
    ├→ Generate client with OpenAPI Generator
    ├→ Or manually implement from spec
    └→ Reference API_DOCUMENTATION.md for behavior
```

## 🚀 Quick Start Checklist

- [ ] Read "Getting Started" in API_DOCUMENTATION.md
- [ ] Register user via POST /auth/register
- [ ] Login via POST /auth/login
- [ ] Save access token to environment variable
- [ ] Create location via POST /locations
- [ ] Create rule via POST /rules
- [ ] Check for alerts via GET /alerts
- [ ] Review API_DOCUMENTATION.md error handling if you hit errors

## 📊 Environment Setup

### Development
```bash
export BASE_URL=http://localhost:8000/api/v1
export API_TOKEN=your_access_token_here
```

### Postman Environment Variables
```
base_url = http://localhost:8000/api/v1
access_token = (set after login)
refresh_token = (set after login)
user_id = (optional)
location_id = (optional)
rule_id = (optional)
alert_id = (optional)
```

## 🧪 Testing Approaches

### Approach 1: Postman (Recommended for GUI users)
1. Import WeatherOps_API.postman_collection.json
2. Set base_url variable
3. Click "Login" under Authentication folder
4. Access token auto-saved to environment
5. Test other endpoints

### Approach 2: cURL (Recommended for CLI users)
1. Get access token:
   ```bash
   curl -X POST http://localhost:8000/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"pass"}'
   ```
2. Save token:
   ```bash
   export TOKEN=<token_from_response>
   ```
3. Make API calls:
   ```bash
   curl -X GET http://localhost:8000/api/v1/locations \
     -H "Authorization: Bearer $TOKEN"
   ```

### Approach 3: Browser (Recommended for interactive)
1. Navigate to http://localhost:8000/docs
2. Click "Authorize" button
3. Paste access token
4. Try endpoints directly in Swagger UI

## 📝 Common Tasks

### Register and Login
See: API_QUICK_REFERENCE.md → Common cURL Commands

### Create Monitoring Setup
See: API_DOCUMENTATION.md → Examples → Complete Workflow Example

### Handle Errors
See: API_DOCUMENTATION.md → Error Handling

### Implement in Python
See: API_DOCUMENTATION.md → Python Example

### Implement in JavaScript
See: API_DOCUMENTATION.md → JavaScript Example

## 🔍 File Locations

```
weatherops/
├── API_DOCUMENTATION.md              (Comprehensive guide)
├── API_QUICK_REFERENCE.md            (Quick lookup)
├── API_DOCUMENTATION_INDEX.md         (This file)
├── openapi.yaml                      (OpenAPI spec)
└── WeatherOps_API.postman_collection.json (Postman collection)
```

## 🌐 Browser Access

With dev server running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## 📞 Support

- **Documentation**: See files in weatherops/ directory
- **Code Examples**: See API_DOCUMENTATION.md
- **Quick Commands**: See API_QUICK_REFERENCE.md
- **Visual Testing**: Import Postman collection
- **Interactive Testing**: Visit /docs endpoint
- **API Issues**: Check error handling section

## 📌 Important Links

### Local Development
- Base URL: `http://localhost:8000/api/v1`
- Swagger Docs: `http://localhost:8000/docs`
- ReDoc Docs: `http://localhost:8000/redoc`

### Files to Download
- OpenAPI Spec: `openapi.yaml` (for code generation)
- Postman Collection: `WeatherOps_API.postman_collection.json`

### Documentation
- Complete Reference: `API_DOCUMENTATION.md`
- Quick Reference: `API_QUICK_REFERENCE.md`
- OpenAPI Spec: `openapi.yaml`

## ✅ Documentation Quality Checklist

- ✅ All endpoints documented
- ✅ All request/response examples included
- ✅ Authentication explained in detail
- ✅ Error handling documented
- ✅ Code examples (Python & JavaScript)
- ✅ cURL command examples
- ✅ Postman collection provided
- ✅ OpenAPI specification included
- ✅ Best practices documented
- ✅ Getting started guide included
- ✅ Quick reference available
- ✅ Rate limiting documented
- ✅ Data models documented
- ✅ Common workflows explained

---

**Last Updated**: June 5, 2026  
**API Version**: 1.1.0  
**Documentation Version**: 1.0.0
