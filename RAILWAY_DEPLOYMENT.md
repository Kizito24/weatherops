# WeatherOps Deployment on Railway

This guide provides step-by-step instructions for deploying the WeatherOps project on Railway.

## Prerequisites

- GitHub account with the WeatherOps repository
- Railway account (https://railway.app)
- Environment variables and secrets prepared

## What Gets Deployed

1. **Backend API** - FastAPI application (Python 3.12)
2. **Frontend** - React/TypeScript static site
3. **PostgreSQL Database** - Managed PostgreSQL instance
4. **Redis Cache** - Managed Redis instance
5. **Celery Worker** - Background job processor

## Deployment Architecture

```
GitHub Repo
    ↓
Railway (detects railway.json)
    ├── Backend Service (FastAPI)
    ├── Celery Worker
    ├── Frontend (Static)
    ├── PostgreSQL Database
    └── Redis Cache
```

## Quick Deployment Steps

### Step 1: Prepare Repository

Commit deployment files:
```bash
git push origin main
```

### Step 2: Create Railway Account

1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway to access repositories

### Step 3: Deploy Backend

1. **In Railway Dashboard:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select `weatherco` repository
   - Click "Deploy"

2. **Configure Build Settings:**
   - Railway auto-detects `railway.json`
   - Dockerfile is used automatically

3. **Set Environment Variables:**
   - Go to Variables tab
   - Add from `.env.railway.example`:
     ```
     SECRET_KEY=<generate-new>
     WEATHERAI_API_KEY=<your-key>
     SENDGRID_API_KEY=<your-key>
     SENDGRID_FROM_EMAIL=<your-email>
     TWILIO_ACCOUNT_SID=<optional>
     TWILIO_AUTH_TOKEN=<optional>
     TWILIO_PHONE_NUMBER=<optional>
     ```

### Step 4: Add PostgreSQL Plugin

1. In Railway Project:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway auto-injects `DATABASE_URL`

2. Verify connection:
   - Check logs for successful migration
   - Should see: "alembic upgrade head" completed

### Step 5: Add Redis Plugin

1. In Railway Project:
   - Click "+ New" → "Database" → "Redis"
   - Railway auto-injects `REDIS_URL`

2. Verify connection:
   - Backend should connect to Redis
   - Celery should use Redis as broker

### Step 6: Deploy Celery Worker

1. **Create new service:**
   - Click "+ New" → "GitHub Repo"
   - Select same `weatherco` repo
   - Name it `celery-worker`

2. **Configure Celery Service:**
   - Build command: `bash backend/build.sh`
   - Start command: `cd backend && celery -A app.tasks worker --loglevel=info`
   - Same environment variables as backend

3. **Link to same databases:**
   - Add PostgreSQL plugin (references backend's DB)
   - Add Redis plugin (references backend's Redis)

### Step 7: Deploy Frontend

1. **Create new service:**
   - Click "+ New" → "GitHub Repo"
   - Select same `weatherco` repo
   - Name it `frontend`

2. **Configure Frontend:**
   - Build command: `cd frontend && npm install && npm run build`
   - Start command: Leave empty (static site)
   - Set root directory: `frontend/dist`

3. **Or use Railway Static:**
   - Click "+ New" → "GitHub" (Static)
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`

## File Structure

```
weatherops/
├── railway.json              ← Main config (backend)
├── railway.toml              ← Alternative config format
├── backend/
│   ├── Dockerfile            ← Container image
│   └── build.sh              ← Build script
├── .env.railway.example      ← Environment template
├── RAILWAY_DEPLOYMENT.md     ← This file
└── RAILWAY_QUICK_START.md    ← Quick reference
```

## Configuration Details

### railway.json

Configures the backend service:
- Builder: Dockerfile
- Build command: Runs migrations
- Start command: Gunicorn + Uvicorn
- Restart policy: Auto-restart on failure

### railway.toml

Alternative TOML format with all environment variables defined.

### Environment Variables

**Auto-injected by Railway:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `PORT` - Server port (defaults to 8000)

**Must be set manually:**
- `SECRET_KEY` - Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `WEATHERAI_API_KEY` - Your WeatherAI API key
- `SENDGRID_API_KEY` - SendGrid API key (optional)
- `SENDGRID_FROM_EMAIL` - Sender email (optional)
- `TWILIO_*` - Twilio credentials (optional)

**Auto-configured:**
- `ENVIRONMENT=production`
- `DEBUG=false`
- `LOG_LEVEL=INFO`
- `CELERY_*` settings

## Service URLs

After deployment:

```
Backend API:  https://<project-name>-backend.railway.app
Frontend:     https://<project-name>-frontend.railway.app
Celery:       (internal, no URL)
```

## Accessing Services

### Backend API

```bash
# Health check
curl https://<project-name>-backend.railway.app/health

# Test endpoint
curl https://<project-name>-backend.railway.app/api/v1/health
```

### Frontend

Visit in browser:
```
https://<project-name>-frontend.railway.app
```

### Logs

In Railway Dashboard:
1. Select service
2. Click "Logs" tab
3. View real-time logs

## Database Operations

### Connect to PostgreSQL

Via Railway Dashboard:
1. Select PostgreSQL service
2. Click "Data" tab
3. Run SQL queries
4. Or get connection string for external tools

```bash
# Via psql
psql <DATABASE_URL>
```

### Backup & Restore

Railway provides:
- Automatic daily backups (retained 30 days)
- Manual backup available
- One-click restore

## Monitoring

### View Metrics

Railway Dashboard shows:
- CPU usage
- Memory usage
- Network I/O
- Deployment history
- Failed deployments

### Set Up Alerts

1. Go to Project Settings
2. Enable email notifications
3. Configure alert thresholds

### View Logs

```
Dashboard → Service → Logs tab
- Real-time streaming
- Search and filter
- Copy for debugging
```

## Troubleshooting

### Backend Won't Start

**Check logs:**
```
Dashboard → Backend → Logs
```

**Common issues:**
- Missing `SECRET_KEY` environment variable
- Database connection failed
- Redis not ready

**Fix:**
1. Add `SECRET_KEY` to Variables
2. Wait for PostgreSQL to initialize (2-3 min)
3. Check database connection string

### Database Connection Fails

```
Error: could not connect to server
```

**Solutions:**
1. Wait 2-3 minutes for PostgreSQL to initialize
2. Verify `DATABASE_URL` is set correctly
3. Check PostgreSQL service logs
4. Restart PostgreSQL service

### Migrations Not Running

```
Error: alembic upgrade head failed
```

**Check:**
1. Backend logs for specific error
2. DATABASE_URL is correctly injected
3. PostgreSQL is running and accessible

**Debug:**
```bash
# SSH into service (if available)
# Then run:
alembic upgrade head
```

### Celery Worker Won't Connect

```
Error: Cannot connect to redis://...
```

**Solutions:**
1. Wait for Redis to initialize (2-3 min)
2. Verify `REDIS_URL` environment variable
3. Check Redis service is running
4. Check Celery worker logs

### Frontend Build Fails

```
Error: npm install failed
```

**Solutions:**
1. Check `package.json` dependencies
2. Verify Node.js version compatibility
3. Check npm logs for specific errors
4. Clear npm cache: `npm cache clean --force`

### Out of Memory

```
Error: Process killed (OOM)
```

**Solutions:**
1. Upgrade service plan (more RAM)
2. Optimize code
3. Check for memory leaks
4. Monitor memory usage in dashboard

## Redeployment

### Automatic

Push to main branch:
```bash
git push origin main
```

Railway automatically:
1. Detects changes
2. Builds new images
3. Runs migrations
4. Deploys new version
5. Keeps previous version for rollback

### Manual Redeploy

In Railway Dashboard:
1. Select service
2. Click "Deployments" tab
3. Find deployment
4. Click "Redeploy" button

## Rollback

If deployment fails:

1. **In Railway Dashboard:**
   - Service → Deployments tab
   - Select previous successful deployment
   - Click "Rollback"

2. **Automatic:** Keeps last 5 deployments

## Custom Domain

### Add Custom Domain

1. In Railway Project Settings:
   - Click "Domains"
   - Add custom domain
   - Follow DNS setup instructions

2. **DNS Configuration:**
   - Add CNAME record pointing to Railway domain
   - Wait for DNS propagation (up to 24 hours)

3. **SSL Certificate:**
   - Automatic with Let's Encrypt
   - Free and auto-renews

## Scaling

### Vertical Scaling

1. Service → Settings
2. Change plan/instance type
3. More CPU/RAM available
4. Auto-restarts with new specs

### Horizontal Scaling

1. **Multiple Backend Instances:**
   - Add load balancer
   - Deploy multiple backend services
   - Route traffic between them

2. **Multiple Celery Workers:**
   - Deploy additional Celery services
   - Share same Redis broker
   - Jobs distributed automatically

## Cost Estimation

**Estimated Monthly Costs:**

| Service | Usage | Cost |
|---------|-------|------|
| Backend | Always on | ~$7/month |
| Celery Worker | Always on | ~$7/month |
| Frontend | Always on | ~$7/month |
| PostgreSQL | Always on | ~$12/month |
| Redis | Always on | ~$7/month |
| **Total** | | ~**$40/month** |

*Note: Pricing may vary. See https://railway.app/pricing for current rates.*

## Environment Variables Reference

### Required

```
SECRET_KEY              # Generate: python -c "import secrets; print(secrets.token_urlsafe(32))"
WEATHERAI_API_KEY       # Your WeatherAI API key
```

### Optional

```
SENDGRID_API_KEY        # SendGrid email API key
SENDGRID_FROM_EMAIL     # Sender email address
TWILIO_ACCOUNT_SID      # Twilio account ID
TWILIO_AUTH_TOKEN       # Twilio auth token
TWILIO_PHONE_NUMBER     # Twilio phone number
```

### Auto-Injected

```
DATABASE_URL            # PostgreSQL connection string
REDIS_URL               # Redis connection string
PORT                    # Server port (8000)
```

## Support & Resources

- Railway Docs: https://docs.railway.app
- Railway Community: https://railway.app/community
- GitHub Issues: Report bugs and request features
- Logs: First place to check for errors

## Checklist

- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] Backend service deployed
- [ ] PostgreSQL added and initialized
- [ ] Redis added and connected
- [ ] Environment variables set
- [ ] Celery worker deployed
- [ ] Frontend deployed
- [ ] Test backend API endpoint
- [ ] Test frontend application
- [ ] Verify database migrations ran
- [ ] Check logs for errors
- [ ] Set up monitoring/alerts

## Next Steps

1. Follow "Quick Deployment Steps" above
2. Monitor logs during deployment
3. Test all services are working
4. Set up custom domain (optional)
5. Configure monitoring/alerts
6. Plan for scaling if needed

---

**Last Updated:** June 2026
**Deployment Version:** 1.0
**Platform:** Railway.app
