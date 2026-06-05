# Railway Deployment Quick Start

## TL;DR - Deploy in 5 Steps

### 1. Push Code to GitHub
```bash
git push origin main
```

### 2. Create Railway Account
- Go to https://railway.app
- Sign up with GitHub
- Authorize Railway

### 3. Deploy Backend Service
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `weatherco` repository
4. Click "Deploy"
5. Railway detects `railway.json` automatically

### 4. Add Databases & Set Secrets

**Add PostgreSQL:**
- In Railway Project → "+ New" → "Database" → "PostgreSQL"
- Auto-injects `DATABASE_URL`

**Add Redis:**
- In Railway Project → "+ New" → "Database" → "Redis"
- Auto-injects `REDIS_URL`

**Set Environment Variables:**
```
SECRET_KEY = (generate: python -c "import secrets; print(secrets.token_urlsafe(32))")
WEATHERAI_API_KEY = your-api-key
SENDGRID_API_KEY = your-sendgrid-key (optional)
SENDGRID_FROM_EMAIL = noreply@example.com (optional)
TWILIO_ACCOUNT_SID = your-twilio-sid (optional)
TWILIO_AUTH_TOKEN = your-twilio-token (optional)
```

### 5. Deploy Celery & Frontend

**Deploy Celery Worker:**
- "+ New" → "GitHub repo" (same repo)
- Build: `bash backend/build.sh`
- Start: `cd backend && celery -A app.tasks worker --loglevel=info`
- Link same PostgreSQL and Redis plugins

**Deploy Frontend:**
- "+ New" → "GitHub repo" (same repo)
- Build: `cd frontend && npm install && npm run build`
- Root directory: `frontend/dist`

---

## What Gets Deployed

| Service | Status | URL |
|---------|--------|-----|
| Backend API | ✅ | `https://<project>-backend.railway.app` |
| Frontend | ✅ | `https://<project>-frontend.railway.app` |
| PostgreSQL | ✅ | Internal (auto-injected) |
| Redis | ✅ | Internal (auto-injected) |
| Celery Worker | ✅ | Internal worker |

---

## Deployment Process

```
1. Push to GitHub
   ↓
2. Railway detects railway.json
   ↓
3. Builds Dockerfile
   ↓
4. Runs build.sh (migrations)
   ↓
5. Starts backend with Gunicorn
   ↓
6. Databases auto-connect
   ↓
7. ✅ Live!
```

---

## Access Your App

Once deployed:

```bash
# Backend health check
curl https://<project>-backend.railway.app/health

# Frontend (open in browser)
https://<project>-frontend.railway.app
```

---

## Redeploy After Changes

Simply push to main:
```bash
git push origin main
```

Railway automatically:
1. Detects changes
2. Rebuilds services
3. Runs migrations
4. Deploys new version

---

## Important Notes

✅ **Automatic:**
- SSL/HTTPS certificates
- Database initialization
- Database migrations (`alembic upgrade head`)
- Environment variable injection
- Health checks and auto-restart

⚠️ **Manual Setup:**
- Secrets (API keys, tokens)
- Custom domain (optional)
- Monitoring alerts (optional)

---

## Cost Estimate

```
Backend:        ~$7/month
Celery Worker:  ~$7/month
Frontend:       ~$7/month
PostgreSQL:     ~$12/month
Redis:          ~$7/month
─────────────────────────
TOTAL:          ~$40/month
```

(See RAILWAY_DEPLOYMENT.md for detailed costs)

---

## Troubleshooting

**Backend won't start?**
- Check logs: Dashboard → Backend → Logs
- Missing `SECRET_KEY` environment variable?
- Database not ready? Wait 2-3 minutes

**Database connection fails?**
- Wait for PostgreSQL to initialize
- Verify `DATABASE_URL` is auto-injected
- Check PostgreSQL service logs

**Frontend not building?**
- Check npm errors in logs
- Verify `package.json` is valid
- Check Node.js version compatibility

**Celery worker not starting?**
- Wait for Redis to initialize
- Verify `REDIS_URL` environment variable
- Check worker logs for errors

---

## Full Documentation

For complete details, see: **RAILWAY_DEPLOYMENT.md**

Topics covered:
- Detailed setup instructions
- Service configuration
- Monitoring and logs
- Environment variables
- Troubleshooting
- Scaling strategies
- Backup and recovery
- Custom domains
- Cost estimation

---

## Next Steps

1. ✅ Review this quick start
2. 📖 Read RAILWAY_DEPLOYMENT.md for details
3. 🚀 Create Railway account
4. 🔑 Prepare environment variables
5. 📤 Deploy services
6. ⚙️ Configure secrets
7. 🎯 Monitor deployment
8. ✨ Test your app

---

**Ready to deploy?** Start at step 1 of RAILWAY_DEPLOYMENT.md

Questions? Check troubleshooting or Railway docs at https://docs.railway.app
