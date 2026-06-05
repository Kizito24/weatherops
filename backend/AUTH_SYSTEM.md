# WeatherOps Authentication System

Production-grade JWT-based authentication with refresh token management.

## Overview

The authentication system implements:
- User registration with email and password
- Secure login with JWT tokens
- Access token (short-lived, 15 minutes)
- Refresh token (long-lived, 7 days) with database revocation
- Token refresh mechanism
- User logout with token revocation
- FastAPI dependency injection for protected routes

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Routes                           │
│  POST /auth/register  POST /auth/login  POST /auth/refresh  │
│  GET /auth/me         POST /auth/logout                      │
└────────────────┬──────────────────────────────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────┐
│              Service Layer (AuthService)                   │
│  register_user()  authenticate_user()                      │
│  create_tokens()  refresh_access_token()                   │
│  verify_access_token()  get_current_user()                 │
└────────────────┬──────────────────────────────────────────┘
                 │
         ┌───────┴──────────┐
         │                  │
┌────────▼──────────┐  ┌───▼──────────────────┐
│ UserRepository    │  │ RefreshTokenRepo     │
│ - create_user()   │  │ - create_token()     │
│ - get_by_email()  │  │ - revoke_token()     │
│ - get_by_id()     │  │ - get_by_hash()      │
└────────┬──────────┘  └───┬──────────────────┘
         │                  │
└────────┴──────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │  Database Layer (SQLAlchemy + PostgreSQL)
    │  ┌──────────────┐  ┌──────────────────┐
    │  │ Users Table  │  │ RefreshTokens    │
    │  │ - id (UUID)  │  │ - id (UUID)      │
    │  │ - email      │  │ - user_id (FK)   │
    │  │ - hashed_pwd │  │ - token_hash     │
    │  │ - is_active  │  │ - expires_at     │
    │  │ - created_at │  │ - revoked        │
    │  │ - updated_at │  │ - revoked_at     │
    │  └──────────────┘  └──────────────────┘
    └──────────────────────────────────────────┘
```

### Security Layer

```
┌──────────────────────────────────────────┐
│         Password Hashing (Bcrypt)        │
│  hash_password()  verify_password()      │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│         JWT Token Management (HS256)     │
│  encode_token()  decode_token()          │
│  verify_token_type()  extract_user_id()  │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│      Token Refresh Hash (SHA256)         │
│  Store hash, not actual token in DB      │
└──────────────────────────────────────────┘
```

### Dependency Injection

```
FastAPI Route
     │
     ├─→ Depends(get_db_session)      → AsyncSession
     │
     ├─→ Depends(get_current_user)     → Extract token
                                         → Validate JWT
                                         → Load User
     │
     └─→ Depends(get_current_active_user) → Check is_active
```

## API Endpoints

### POST /api/v1/auth/register

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

**Errors:**
- `400 Bad Request`: Email already exists or password too short
- `500 Internal Server Error`: Server error

### POST /api/v1/auth/login

Authenticate and get tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Errors:**
- `401 Unauthorized`: Invalid email or password
- `500 Internal Server Error`: Server error

### GET /api/v1/auth/me

Get current authenticated user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "is_active": true,
  "created_at": "2024-06-05T10:30:00Z",
  "updated_at": "2024-06-05T10:30:00Z"
}
```

**Errors:**
- `401 Unauthorized`: Missing or invalid token

### POST /api/v1/auth/refresh

Get new access token using refresh token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Errors:**
- `401 Unauthorized`: Invalid, expired, or revoked refresh token

### POST /api/v1/auth/logout

Revoke all refresh tokens and logout.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (204 No Content)**

## Database Schema

### users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### refresh_tokens

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN DEFAULT FALSE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

## Security Considerations

### Password Security
- ✅ Passwords hashed with bcrypt (cost factor: 12)
- ✅ Never stored or logged in plaintext
- ✅ Verified against hash on login

### JWT Security
- ✅ Signed with HS256 algorithm
- ✅ Secret key from environment variables
- ✅ Access token: 15-minute expiration
- ✅ Refresh token: 7-day expiration
- ✅ Token claims include `sub` (user_id), `type`, `exp`, `iat`

### Refresh Token Security
- ✅ Stored in database, not sent in JWT
- ✅ Only hash stored in database (SHA256)
- ✅ Can be revoked immediately
- ✅ Validated against stored hash on refresh
- ✅ Automatic expiration after configured period

### Best Practices
- ✅ HTTPS required in production
- ✅ Secure cookies for token storage (frontend)
- ✅ CORS properly configured
- ✅ Dependency injection for auth checks
- ✅ Proper error messages (no information leakage)
- ✅ Rate limiting recommended for login/register

## Usage Examples

### Protecting Routes

```python
from app.dependencies.auth import CurrentUser

@router.get("/protected")
async def protected_route(current_user: CurrentUser):
    return {"message": f"Hello {current_user.email}"}
```

### Custom Auth Logic

```python
from app.services.auth_service import AuthService
from app.database.session import get_db_session

async def custom_auth(db = Depends(get_db_session)):
    service = AuthService(db)
    user = await service.get_current_user(token)
    return user
```

### Manual Token Verification

```python
from app.core.security.jwt import decode_token, verify_token_type

payload = decode_token(token)
verify_token_type(payload, "access")
user_id = payload.get("sub")
```

## Testing

Run auth tests:

```bash
pytest tests/test_auth.py -v
```

Test coverage:
- ✅ User registration
- ✅ Duplicate email prevention
- ✅ User login
- ✅ Invalid password handling
- ✅ Current user retrieval
- ✅ Invalid token handling
- ✅ Token refresh
- ✅ User logout

## Configuration

Set in `.env`:

```env
# Security
SECRET_KEY=<strong-random-string>
ALGORITHM=HS256

# Token Expiration
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
```

## Production Deployment

### Pre-Production Checklist

- [ ] Change SECRET_KEY to strong random value
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for specific origins
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring/logging
- [ ] Review token expiration times
- [ ] Set up audit logging
- [ ] Enable database encryption

### Recommended Enhancements

1. **Rate Limiting**: Prevent brute force attacks
2. **Account Lockout**: Lock after N failed attempts
3. **Email Verification**: Verify email on registration
4. **Two-Factor Authentication**: Add 2FA support
5. **Audit Logging**: Log all auth events
6. **Session Management**: Track active sessions
7. **IP Whitelisting**: Restrict access by IP
8. **Password Reset**: Secure password recovery

## Architecture Decisions

### Why JWT?

- Stateless authentication (no session storage)
- Scalable across multiple servers
- Self-contained claims
- Works well with APIs and SPAs

### Why Refresh Tokens?

- Limits damage of leaked access tokens
- Allows server-side revocation
- Enables token rotation
- Improves security posture

### Why Store Refresh Token Hash?

- Never exposes actual token in database
- Prevents database compromise from revealing tokens
- Matches password hashing security model

### Why Async?

- Handles concurrent authentication requests
- Non-blocking I/O for databases
- Better resource utilization
- Modern Python best practice

## File Structure

```
backend/
├── app/
│   ├── core/
│   │   └── security/
│   │       ├── jwt.py          # Token encoding/decoding
│   │       └── password.py      # Password hashing
│   ├── database/
│   │   ├── base.py             # Base models
│   │   └── session.py           # Session factory
│   ├── models/
│   │   ├── user.py             # User model
│   │   └── refresh_token.py     # Refresh token model
│   ├── repositories/
│   │   ├── user_repository.py   # User data access
│   │   └── refresh_token_repo.py # Token data access
│   ├── services/
│   │   └── auth_service.py      # Auth business logic
│   ├── dependencies/
│   │   └── auth.py             # FastAPI dependencies
│   └── api/v1/endpoints/
│       └── auth.py             # Auth routes
├── tests/
│   ├── conftest.py             # Test fixtures
│   └── test_auth.py            # Auth tests
└── AUTH_SYSTEM.md              # This file
```

## Next Steps

This authentication system is production-ready. Next phases:

1. **Implement Weather Models** - Location, Alert models
2. **Implement Weather Services** - Data fetching, processing
3. **Add Authorization** - Role-based access control
4. **Implement Notifications** - Email, SMS, push
5. **Add Audit Logging** - Track all user actions
6. **Implement Admin Panel** - User management, analytics

---

**Status**: Production-Ready ✅
**Last Updated**: June 5, 2024
**Version**: 1.0.0
