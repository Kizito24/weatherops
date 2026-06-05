# WeatherOps Deployment on Render

This guide provides step-by-step instructions for deploying the WeatherOps project on Render.

## Prerequisites

- GitHub account with the WeatherOps repository
- Render account (https://render.com)
- Environment variables and secrets prepared

## What Gets Deployed

1. **Backend API** - FastAPI application running on Python 3.12
2. **Frontend** - React/TypeScript static site
3. **PostgreSQL Database** - Managed PostgreSQL instance
4. **Redis Cache** - Managed Redis instance
5. **Celery Worker** - Background job processor

## Deployment Steps

### Step 1: Prepare Your Repository

Ensure these files are in your repository root:
- `render.yaml` - Deployment configuration
- `backend/Dockerfile` - Backend container definition
- `backend/build.sh` - Build script for migrations
- `.env.production.example` - Example environment variables

Commit all changes:
```bash
git add render.yaml backend/Dockerfile backend/build.sh .env.production.example
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create a Render Account and Connect GitHub

1. Go to https://render.com and sign up
2. Click "Dashboard" and then "New +"
3. Select "Blueprint" (Infrastructure as Code)
4. Connect your GitHub repository

### Step 3: Deploy Using Blueprint

1. In Render Dashboard, select "New Blueprint"
2. Choose your GitHub repository (weatherco)
3. Render will detect `render.yaml` automatically
4. Review the services to be created:
   - weatherops-backend (Web Service)
   - weatherops-celery (Worker)
   - weatherops-frontend (Static Site)
   - weatherops-db (PostgreSQL)
   - weatherops-redis (Redis)

5. Click "Deploy Blueprint"

### Step 4: Configure Environment Variables

After deployment starts, you need to set environment variables:

1. Go to the backend service settings
2. Add these environment variables from `.env.production.example`:

**Critical Variables:**
- `SECRET_KEY` - Generate a strong secret key: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `WEATHERAI_API_KEY` - Your WeatherAI API key
- `SENDGRID_API_KEY` - Your SendGrid API key (optional)
- `TWILIO_ACCOUNT_SID` - Your Twilio SID (optional)
- `TWILIO_AUTH_TOKEN` - Your Twilio token (optional)
- `SENDGRID_FROM_EMAIL` - Your notification email address

**Database Variables:**
- `DATABASE_POOL_SIZE=10`
- `DATABASE_MAX_OVERFLOW=5`

These will be auto-populated by Render:
- `DATABASE_URL` - From PostgreSQL service
- `REDIS_URL` - From Redis service

### Step 5: Monitor Deployment

1. Watch the deployment logs in Render Dashboard
2. Check each service's logs for errors:
   - Backend Web Service
   - Celery Worker
   - Frontend Static Site

3. Verify database migrations ran successfully in the logs

### Step 6: Test the Deployment

Once deployment completes:

1. **Test Backend API:**
   ```bash
   curl https://weatherops-backend.onrender.com/health
   ```

2. **Test Frontend:**
   Visit https://weatherops-frontend.onrender.com in your browser

3. **Check Database:**
   - Render Dashboard → PostgreSQL → Details
   - Use connection string to test with psql or similar tool

4. **Monitor Celery:**
   - Check Celery worker logs for job processing

## Service Details

### Backend Web Service

- **Runtime:** Python 3.12
- **Plan:** Standard (Recommended)
- **Port:** 8000
- **Command:** Gunicorn + Uvicorn workers
- **Health Check:** `/health` endpoint
- **Auto-deploy:** Enabled on git push to main

### Celery Worker

- **Runtime:** Python 3.12
- **Plan:** Standard
- **Command:** Celery worker
- **Purpose:** Background job processing
- **Note:** Scales independently from API

### Frontend Static Site

- **Runtime:** Static (pre-built HTML/CSS/JS)
- **Build Command:** `npm install && npm run build`
- **Source:** `frontend/dist` directory
- **Plan:** Free (sufficient for static assets)

### PostgreSQL Database

- **Plan:** Standard
- **Version:** Latest
- **Region:** Oregon (default)
- **Backups:** Automatic daily backups
- **Connection String:** Provided as `DATABASE_URL`

### Redis Cache

- **Plan:** Standard
- **Region:** Oregon (same as database)
- **Purpose:** 
  - Celery message broker
  - Celery result backend
  - Session caching
- **Connection String:** Provided as `REDIS_URL`

## Important Configuration Notes

### Database Migrations

Migrations run automatically during deployment via `build.sh`:
1. Dependencies are installed
2. `alembic upgrade head` runs
3. Database schema is created/updated
4. Application starts

If migrations fail:
1. Check Backend service logs
2. SSH into Render service and debug
3. Manual migration: `alembic upgrade head`

### Environment Variables

**Auto-injected by Render:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

**Must be set manually:**
- `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `WEATHERAI_API_KEY`
- `SENDGRID_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

### Production Security

1. **HTTPS:** Automatically enabled with Render's SSL certificate
2. **Environment Variables:** Never commit secrets to git
3. **Database:** Use strong passwords (auto-generated by Render)
4. **Redis:** Render provides secure connection
5. **CORS:** Configure in backend if frontend is on different domain

## Scaling

### Vertical Scaling
- Change plan size in service settings
- Applies to next deployment

### Horizontal Scaling
- Backend: Increase number of Gunicorn workers
- Celery: Deploy multiple worker instances
- Database: Use PostgreSQL replication plan

## Monitoring and Logs

### View Logs
1. Dashboard → Service → Logs
2. Real-time streaming logs
3. Search and filter capabilities

### Health Checks
- Backend automatically checked every 30 seconds
- Failed health checks trigger restarts
- Configure in Render service settings

### Metrics
- CPU usage
- Memory usage
- Network I/O
- Available in Render Dashboard

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```
Error: could not connect to server
```
- Wait 2-3 minutes for database to initialize
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL service is running

**2. Migrations Fail**
```
Error: alembic upgrade head
```
- Check backend logs for specific error
- Verify `DATABASE_URL` is set correctly
- Test locally: `alembic upgrade head`

**3. Celery Worker Won't Start**
```
Error: Connection refused
```
- Verify `REDIS_URL` is set correctly
- Wait for Redis service to initialize
- Check Redis service logs

**4. Frontend Build Fails**
```
Error: npm install failed
```
- Check `package.json` dependencies
- Verify Node.js version compatibility
- Check build logs for specific errors

**5. Out of Memory**
```
Killed (OOM)
```
- Upgrade service plan
- Optimize code
- Check for memory leaks in logs

### Debug Commands

SSH into service:
```bash
render run bash
```

Check environment:
```bash
env | grep -E "DATABASE|REDIS|SECRET"
```

Test database connection:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

Test Redis connection:
```bash
redis-cli -u $REDIS_URL PING
```

## Costs

**Estimated Monthly Costs:**

| Service | Plan | Cost |
|---------|------|------|
| Backend | Standard | ~$12/month |
| Celery Worker | Standard | ~$12/month |
| Frontend | Free | Free |
| PostgreSQL | Standard | ~$15/month |
| Redis | Standard | ~$5/month |
| **Total** | | ~**$44/month** |

*Note: Costs may vary. See https://render.com/pricing for current rates.*

## Updates and Maintenance

### Deploy Updates

Simply push to main branch:
```bash
git push origin main
```

Render automatically:
1. Detects changes
2. Builds new images
3. Runs migrations
4. Deploys new version
5. Keeps old version as rollback

### Rollback

If deployment fails:
1. Dashboard → Service → Deployments
2. Select previous successful deployment
3. Click "Rollback"

### Database Backups

Render automatically backs up PostgreSQL:
1. Daily automatic backups
2. Backups retained for 7 days
3. Manual backup/restore available

## Next Steps

1. **Monitor Logs** - Watch for any errors in first 24 hours
2. **Test Features** - Verify all API endpoints work
3. **Set Up Monitoring** - Configure alerts for errors
4. **Load Testing** - Test with expected traffic
5. **Document DNS** - If using custom domain

## Support

- Render Documentation: https://render.com/docs
- WeatherOps GitHub: Add issues/discussions
- Check logs for error details

## Rollback Plan

If critical issues occur:

1. **Immediate:** Render → Service → Deployments → Rollback to last working
2. **Database:** Check backups, restore if needed
3. **Investigation:** Review logs for root cause
4. **Fix:** Push new commit to main
5. **Redeploy:** Render auto-deploys on git push

---

**Last Updated:** June 2026
**Deployment Version:** 1.0
