FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements/ ./requirements/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements/base.txt && \
    pip install --no-cache-dir gunicorn uvicorn[standard]

# Copy application code
COPY backend/app/ ./app/
COPY backend/alembic/ ./alembic/
COPY backend/alembic.ini ./

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["/bin/bash", "-c", "alembic upgrade head && exec gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:${PORT:-8000}"]
