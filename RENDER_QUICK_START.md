# Render Deployment Quick Start

## TL;DR - Deploy in 5 Steps

### 1. Push Code to GitHub
```bash
git push origin main
```

### 2. Create Render Account
- Go to https://render.com
- Sign up with GitHub
- Authorize access to your repository

### 3. Deploy Blueprint
1. Click "New +" → "Blueprint"
2. Select your `weatherco` repository
3. Render finds `render.yaml` automatically
4. Click "Deploy Blueprint"

### 4. Set Environment Variables
After deployment starts, configure:

**On Backend Service:**
```
SECRET_KEY = (generate: python -c "import secrets; print(secrets.token_urlsafe(32))")
WEATHERAI_API_KEY = your-api-key
SENDGRID_API_KEY = your-sendgrid-key
TWILIO_ACCOUNT_SID = your-twilio-sid
TWILIO_AUTH_TOKEN = your-twilio-token
SENDGRID_FROM_EMAIL = noreply@example.com
```

**Database & Redis (auto-configured):**
- `DATABASE_URL` → Auto-injected from PostgreSQL
- `REDIS_URL` → Auto-injected from Redis

### 5. Wait and Monitor
- Watch deployment logs
- Wait for all services to go green
- ~5-10 minutes total deployment time

---

## What Gets Deployed

| Service | Type | Purpose |
|---------|------|---------|
| weatherops-backend | Web Service | FastAPI API |
| weatherops-celery | Worker | Background jobs |
| weatherops-frontend | Static | React app |
| weatherops-db | PostgreSQL | Production database |
| weatherops-redis | Redis | Caching & queues |

## Access Your Deployment

Once deployed:
- **Backend API:** `https://weatherops-backend.onrender.com`
- **Frontend:** `https://weatherops-frontend.onrender.com`
- **Health Check:** `https://weatherops-backend.onrender.com/health`

## Redeploy After Changes

Simply push to main:
```bash
git push origin main
```

Render automatically:
1. Detects changes
2. Rebuilds services
3. Runs migrations
4. Deploys new version

## Important Notes

✅ **Automatic:**
- SSL/HTTPS certificates
- Database initialization
- Database migrations
- Environment variable injection
- Health checks and auto-restart

⚠️ **Manual Configuration:**
- Secrets (API keys, tokens)
- CORS settings (if frontend on different domain)
- Email/SMS provider credentials
- Custom domain (optional)

❌ **NOT Supported (Change Not Needed):**
- Localhost references
- SQLite (PostgreSQL used instead)
- Local file storage (use object storage)

## Troubleshooting

**Backend won't start?**
- Check logs: Dashboard → Service → Logs
- Common: Missing `SECRET_KEY` environment variable
- Solution: Add SECRET_KEY to environment

**Database connection fails?**
- Wait 2-3 minutes for PostgreSQL to initialize
- Check `DATABASE_URL` is set
- Verify migrations ran: Check logs for "alembic upgrade"

**Frontend not loading?**
- Check build logs: Dashboard → Frontend → Logs
- Verify `npm run build` completes successfully
- Check for dependency errors

**Celery worker not starting?**
- Redis must be ready first (wait 2-3 min)
- Check `REDIS_URL` environment variable
- Verify in logs: "Connected to Redis"

## Scale When Needed

**Add more API workers:**
- Change `--workers 4` to `--workers 8` in `render.yaml`
- Redeploy

**Add more Celery workers:**
- Deploy additional Celery service instance
- Or increase plan size

**Upgrade database:**
- Dashboard → PostgreSQL → Change Plan
- Automatic failover, minimal downtime

## Cost Estimate

```
Backend:        $12/month
Celery Worker:  $12/month
Frontend:       Free
PostgreSQL:     $15/month
Redis:          $5/month
─────────────────────────
TOTAL:          ~$44/month
```

(See RENDER_DEPLOYMENT.md for detailed costs)

## Full Documentation

For complete deployment guide, see: **RENDER_DEPLOYMENT.md**

Topics covered:
- Detailed setup instructions
- Service configuration
- Monitoring and logs
- Environment variables
- Troubleshooting
- Scaling strategies
- Backup and recovery
- Security best practices

## Files Provided

```
render.yaml                  ← Deployment blueprint
backend/Dockerfile          ← Container image
backend/build.sh            ← Build script
.env.production.example     ← Environment template
RENDER_DEPLOYMENT.md        ← Full guide
RENDER_QUICK_START.md       ← This file
```

## Next Steps

1. ✅ Review this quick start
2. 📖 Read RENDER_DEPLOYMENT.md for details
3. 🚀 Create Render account and connect GitHub
4. 🔑 Prepare environment variables
5. 📤 Deploy blueprint
6. ⚙️ Configure secrets
7. 🎯 Monitor deployment
8. ✨ Test your app

---

**Ready to deploy?** Start at step 1 of RENDER_DEPLOYMENT.md

Questions? Check troubleshooting section or Render docs at https://render.com/docs
