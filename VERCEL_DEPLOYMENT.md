# Vercel Deployment Guide

This guide covers deploying WeatherOps to Vercel.

## Frontend Deployment (Vercel)

The frontend is a Vite + React application that deploys directly to Vercel.

### Prerequisites
- Vercel account (vercel.com)
- GitHub repository with this code

### Setup Instructions

1. **Connect to GitHub**
   - Go to vercel.com and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_BASE_URL` pointing to your backend API
     - Example: `https://your-backend-api.com` or `https://weatherops-api.onrender.com`

3. **Deploy**
   - Vercel will automatically detect Vite and build the frontend
   - Your site will be live at `your-project.vercel.app`

## Backend Deployment

The backend (FastAPI) needs to be deployed separately. Options:

### Option 1: Render.com (Recommended)
- Free tier available
- Easy deployment from GitHub
- Works well with FastAPI

**Steps:**
1. Create a Render account (render.com)
2. New → Web Service
3. Connect GitHub repository
4. Set build command: `pip install -r backend/requirements/base.txt && pip install gunicorn uvicorn[standard]`
5. Set start command: `cd backend && alembic upgrade head && gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000`
6. Add environment variables (DB connection, Redis URL, etc.)
7. Deploy

### Option 2: PythonAnywhere
- Beginner-friendly
- Simple Flask/FastAPI deployment
- Free tier available with limitations

### Option 3: DigitalOcean App Platform
- More features than free tiers
- Good performance
- Pay-as-you-go pricing

## Environment Variables Required

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.com
```

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- Other environment variables as needed

## Database Setup

The backend requires:
1. PostgreSQL database
2. Redis for caching and Celery

Most hosting platforms offer managed databases. Alternatively:
- Supabase for PostgreSQL (free tier)
- Redis Cloud for Redis (free tier)

## Vercel Build Settings

The `vercel.json` file is configured to:
- Build from the `frontend` directory
- Use Vite as the framework
- Rewrite all routes to index.html (for React Router)
- Pass API URL as environment variable

## Troubleshooting

### API Connection Issues
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on the backend
- Ensure backend is running and accessible

### Build Failures
- Check Vercel build logs
- Ensure Node.js dependencies are installed
- Verify `vercel.json` is in the root directory

## Next Steps

1. Deploy frontend to Vercel
2. Deploy backend to Render (or alternative)
3. Configure environment variables on both platforms
4. Test the connection between frontend and backend
5. Set up monitoring and logging
