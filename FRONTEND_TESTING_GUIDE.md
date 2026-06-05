# WeatherOps Frontend Testing Guide

## Quick Start

### Prerequisites
- Backend running on `http://localhost:8001`
- Frontend running on `http://localhost:3000`
- PostgreSQL database with migrations applied

### Environment Configuration
**Frontend `.env.local`:**
```
VITE_API_BASE_URL=http://localhost:8001
VITE_DEBUG=false
```

---

## Test Accounts

### Account 1: Basic User
```
Email: test@weatherops.com
Password: TestPass123
```
Use this to test basic registration and login flow.

### Account 2: Existing User
```
Email: kizitochiazor@gmail.com
Password: (use your preferred password)
```
Pre-created for login testing.

### Account 3: Demo Account
```
Email: demo@weatherops.com
Password: DemoPass2024
```
Use for feature testing.

---

## Testing Scenarios

### 1. Authentication Flow

#### Register New User
1. Go to `http://localhost:3000`
2. Click "Create Account"
3. Fill in:
   - **Full Operational Name:** Your name
   - **Control Email Address:** `newemail@test.com`
   - **Encryption Password:** `MySecurePass123` (min 8 chars)
4. Click "Initialize Command Center"
5. **Expected Result:** 
   - No error message
   - Redirected to dashboard
   - User created in database

#### Login Existing User
1. Go to `http://localhost:3000`
2. Enter email: `test@weatherops.com`
3. Enter password: `TestPass123`
4. Click "Access Dashboard Console"
5. **Expected Result:**
   - Successful login
   - Access token stored in localStorage
   - Dashboard loads

#### Token Refresh Test
1. Login with any account
2. Wait 30 minutes (or manually expire token in dev tools)
3. Make any API call
4. **Expected Result:**
   - Background token refresh occurs
   - New tokens stored in localStorage
   - Request succeeds without user intervention

---

## API Testing

### Test Registration Endpoint
```bash
curl -X POST http://localhost:8001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (201):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

### Test Login Endpoint
```bash
curl -X POST http://localhost:8001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@weatherops.com",
    "password": "TestPass123"
  }'
```

### Test Token Refresh
```bash
REFRESH_TOKEN="eyJhbGc..." # Get from response above

curl -X POST http://localhost:8001/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$REFRESH_TOKEN\"}"
```

### Test Get Current User (Authenticated)
```bash
ACCESS_TOKEN="eyJhbGc..." # Get from login/register

curl -X GET http://localhost:8001/api/v1/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Browser Testing Checklist

### Authentication
- [ ] Registration form validation works
- [ ] Password minimum length enforced (8 chars)
- [ ] Duplicate email rejected
- [ ] Login form works with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Login fails with non-existent email
- [ ] "Forgot password" link visible (if implemented)
- [ ] Switch between login/register modes
- [ ] Tokens stored in localStorage after auth

### Token Management
- [ ] Access token stored in `weatherops_access_token`
- [ ] Refresh token stored in `weatherops_refresh_token`
- [ ] Tokens cleared on logout
- [ ] Token refresh happens automatically on 401

### UI/UX
- [ ] Loading spinner shows during auth
- [ ] Error messages display properly
- [ ] Form clears after successful submission
- [ ] Responsive design on mobile/tablet
- [ ] Dark mode toggle (if available)

---

## LocalStorage Inspection

### View Stored Tokens (in Browser DevTools)
1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Look for:
   - `weatherops_access_token` (JWT)
   - `weatherops_refresh_token` (JWT)

### Decode JWT
Use an online JWT decoder like https://jwt.io:
1. Copy `weatherops_access_token` from localStorage
2. Paste into jwt.io decoder
3. Verify claims:
   ```json
   {
     "sub": "user-id-uuid",
     "type": "access",
     "exp": 1234567890,
     "iat": 1234567890,
     "jti": "unique-id-uuid"
   }
   ```

---

## Database Testing

### Check Created Users
```sql
-- Connect to PostgreSQL
psql -h localhost -p 5433 -U weatherops -d weatherops

-- List all users
SELECT id, email, is_active, created_at FROM users;

-- Check refresh tokens
SELECT id, user_id, expires_at, revoked FROM refresh_tokens;
```

### Docker Database Access
```bash
# Connect to database container
docker exec -it weatherops-postgres psql -U weatherops -d weatherops

# View users
SELECT id, email, is_active FROM users;
```

---

## Common Testing Issues & Solutions

### Issue: "Registration failed" Error
**Solutions:**
1. Check backend is running: `make status`
2. Verify API URL in `.env.local` is `http://localhost:8001`
3. Check backend logs: `docker compose logs backend --tail=20`
4. Clear browser cache and localStorage
5. Ensure password is 8+ characters

### Issue: "Invalid email or password" on Login
**Solutions:**
1. Verify email exists in database
2. Check password is correct (case-sensitive)
3. Verify user `is_active = true` in database
4. Check backend logs for auth errors

### Issue: Token Refresh Fails
**Solutions:**
1. Verify refresh token not expired (expires_at in database)
2. Check token not revoked (`revoked = false`)
3. Verify `REFRESH_TOKEN_EXPIRE_DAYS` setting is correct
4. Check database connection

### Issue: CORS Errors
**Solutions:**
1. Verify backend is running on port 8001
2. Check `.env.local` has correct `VITE_API_BASE_URL`
3. Restart frontend dev server to pick up env changes
4. Clear browser cache

---

## Performance Testing

### Load Time Checklist
- [ ] Login page loads in < 2 seconds
- [ ] Register page loads in < 2 seconds
- [ ] Dashboard loads in < 3 seconds after auth
- [ ] Token refresh happens transparently (< 500ms)

### Network Inspection
1. Open DevTools → Network tab
2. Trigger login
3. Check requests:
   - `POST /api/v1/auth/login` - should be fast
   - `POST /api/v1/auth/refresh` - should be automatic
   - Verify Authorization headers present

---

## Security Testing

### Checklist
- [ ] Passwords not visible in form (masked with dots)
- [ ] Tokens not logged in console
- [ ] HTTPS ready (works with https://localhost:8001)
- [ ] No credentials in localStorage besides tokens
- [ ] XSS protection (try `<script>alert('xss')</script>` in forms)
- [ ] SQL injection protection (try `' OR '1'='1` in email)

### Token Security
- [ ] Tokens expire appropriately
- [ ] Old tokens revoked on refresh
- [ ] Logout clears all tokens
- [ ] Can't reuse revoked refresh tokens

---

## Debugging Tips

### Enable Debug Logging
Edit `.env.local`:
```
VITE_DEBUG=true
```

### Check API Requests
```bash
# Watch all requests in real-time
tail -f /path/to/api.log
```

### Backend Logs
```bash
# View backend logs with grep
docker compose logs backend | grep -E "ERROR|INFO|WARNING" | tail -50
```

### Frontend Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors/warnings
4. Check Network tab for failed requests

---

## Test Data Creation

### Bulk User Creation Script
```bash
#!/bin/bash
for i in {1..5}; do
  curl -X POST http://localhost:8001/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"user$i@test.com\", \"password\": \"TestPass$i\"}"
  echo "Created user$i@test.com"
done
```

---

## Success Criteria

Your testing is complete when:
- ✅ New users can register
- ✅ Registered users can login
- ✅ Tokens are properly stored and used
- ✅ Token refresh works automatically
- ✅ Logout clears credentials
- ✅ Error messages are helpful
- ✅ UI is responsive
- ✅ No console errors or warnings
- ✅ API calls complete in reasonable time
