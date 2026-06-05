# WeatherOps Backend - Deployment Guide

Production deployment procedures and best practices.

## Pre-Deployment Checklist

### Security
- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Update database credentials
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable database backups
- [ ] Set up log encryption

### Configuration
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=False`
- [ ] Configure CORS origins (not *)
- [ ] Set appropriate logging level
- [ ] Configure rate limiting
- [ ] Set request size limits

### Infrastructure
- [ ] PostgreSQL cluster with replication
- [ ] Redis cluster with replication
- [ ] Load balancer configured
- [ ] Health check endpoints verified
- [ ] Monitoring dashboards created
- [ ] Alert thresholds set

### Testing
- [ ] All tests passing
- [ ] Code review completed
- [ ] Security review completed
- [ ] Load testing performed
- [ ] Staging environment tested
- [ ] Rollback procedure documented

## Deployment Strategies

### Blue-Green Deployment

Deploy to separate environments and switch traffic:

```bash
# 1. Deploy to green environment
docker-compose -f docker-compose.green.yml up -d

# 2. Run health checks
curl https://green.weatherops.com/api/v1/health

# 3. Run integration tests
pytest integration_tests/ --base-url=https://green.weatherops.com

# 4. Switch traffic (via load balancer config)
# Update load balancer to route to green

# 5. Keep blue running for quick rollback
docker-compose -f docker-compose.blue.yml ps
```

### Rolling Deployment

Gradually replace instances:

```bash
# 1. Update 25% of instances
docker-compose up -d --scale backend=4

# 2. Monitor for 5 minutes
watch curl https://api.weatherops.com/api/v1/health

# 3. If stable, update next 25%
# Repeat until all instances updated
```

### Canary Deployment

Route small percentage of traffic to new version:

```bash
# 1. Deploy new version alongside old
docker run -d --name backend-v2 backend:v2

# 2. Configure load balancer (5% to v2, 95% to v1)
# 3. Monitor for errors

# 4. Gradually increase traffic to v2
# 5% -> 10% -> 25% -> 50% -> 100%
```

## Docker Deployment

### Build Docker Image

```bash
# Build for production
docker build \
  --build-arg ENVIRONMENT=production \
  -t weatherops-backend:latest \
  -t weatherops-backend:1.0.0 \
  -f docker/Dockerfile \
  .

# Push to registry
docker push weatherops-backend:latest
docker push weatherops-backend:1.0.0
```

### Production Docker Compose

```yaml
version: '3.9'

services:
  backend:
    image: weatherops-backend:1.0.0
    environment:
      ENVIRONMENT: production
      DEBUG: "False"
      DATABASE_URL: postgresql+asyncpg://user:pass@db.prod:5432/weatherops
      REDIS_URL: redis://redis.prod:6379/0
      SECRET_KEY: ${SECRET_KEY}  # From secrets manager
    ports:
      - "8000:8000"
    deploy:
      replicas: 4
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

## Database Migration Strategy

### Safe Migration Process

```bash
# 1. Backup database
pg_dump postgresql://user:pass@db.prod/weatherops > backup.sql

# 2. Test migration locally
ENVIRONMENT=staging alembic upgrade head

# 3. Create migration checkpoint
pg_dump postgresql://user:pass@db.prod/weatherops > checkpoint.sql

# 4. Run migration
ENVIRONMENT=production alembic upgrade head

# 5. Verify
psql postgresql://user:pass@db.prod/weatherops -c "SELECT version_num FROM alembic_version;"

# 6. Run application health checks
curl https://api.weatherops.com/api/v1/health
```

### Zero-Downtime Migrations

For large tables, use multiple steps:

```python
# Migration: add_column_without_default.py
# 1. Add column without default
def upgrade():
    op.add_column('weather_alerts', sa.Column('severity', sa.String(50)))

# Deployment step 1: Deploy code that writes to new column
# Deployment step 2: Backfill existing rows
def upgrade():
    op.execute("""
        UPDATE weather_alerts 
        SET severity = 'medium' 
        WHERE severity IS NULL
    """)

# Deployment step 3: Add NOT NULL constraint
def upgrade():
    op.alter_column('weather_alerts', 'severity', nullable=False)
```

## Scaling Guidelines

### Horizontal Scaling

Scale these independently:

| Component | Scaling Strategy | Trigger |
|-----------|------------------|---------|
| API Servers | Add/remove replicas | CPU > 70% or requests > 1000/s |
| Celery Workers | Add/remove workers | Queue depth > 10K tasks |
| PostgreSQL | Read replicas | Read queries > 80% capacity |
| Redis | Cluster | Memory > 80% capacity |

### Vertical Scaling

Increase resources:

```bash
# Increase API server resources
docker-compose up -d \
  --scale backend=1 \
  -e MEMORY_LIMIT=2G
```

## Monitoring Setup

### Metrics to Export

```python
# prometheus.py
from prometheus_client import Counter, Histogram, Gauge

request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration',
    ['method', 'endpoint']
)

celery_tasks = Gauge(
    'celery_tasks_active',
    'Active Celery tasks'
)
```

### Alert Rules

Create alerts for:

```yaml
# prometheus_rules.yml
groups:
  - name: weatherops
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"

      - alert: SlowRequests
        expr: histogram_quantile(0.95, http_request_duration_seconds) > 1
        for: 10m
        annotations:
          summary: "Slow request latency"

      - alert: QueueBacklog
        expr: celery_task_queue_length > 10000
        for: 5m
        annotations:
          summary: "Celery queue backing up"
```

## Rollback Procedure

### Quick Rollback (< 5 minutes)

```bash
# 1. Switch load balancer to previous version
# (assuming blue-green deployment)
load_balancer_switch_to_blue()

# 2. Verify health
curl https://api.weatherops.com/api/v1/health

# 3. Monitor error rates
watch 'curl -s https://monitoring.prod/metrics | grep http_requests'
```

### Database Rollback

```bash
# If migration broke data:
# 1. Restore from backup
pg_restore backup.sql > /tmp/restore.log

# 2. Verify restoration
psql postgresql://user:pass@db.prod/weatherops -c "\dt"

# 3. Replay transactions if needed
pg_replay_log /tmp/transactions.log

# 4. Re-run application health checks
curl https://api.weatherops.com/api/v1/health
```

### Code Rollback

```bash
# Pull previous version
git checkout v1.0.0

# Rebuild and deploy
docker build -t weatherops-backend:rollback .
docker-compose -f docker-compose.prod.yml up -d
```

## Secrets Management

### Using AWS Secrets Manager

```python
# app/core/secrets.py
import boto3
from botocore.exceptions import ClientError

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    try:
        response = client.get_secret_value(SecretId=secret_name)
        return response['SecretString']
    except ClientError as e:
        logger.error(f"Failed to retrieve secret: {e}")
        raise

# In config.py
settings = Settings(
    SECRET_KEY=get_secret('weatherops/secret_key'),
    DATABASE_URL=get_secret('weatherops/db_url'),
)
```

### Using HashiCorp Vault

```python
# app/core/vault.py
import hvac

client = hvac.Client(url='https://vault.prod:8200')
client.auth.kubernetes.login(role='weatherops')

secret = client.secrets.kv.read_secret_version(path='weatherops/config')
database_url = secret['data']['data']['DATABASE_URL']
```

## Performance Optimization for Production

### Application Settings

```python
# In production, optimize settings:
DATABASE_POOL_SIZE=50  # Larger pool for production
DATABASE_MAX_OVERFLOW=10
CELERY_TASK_TIME_LIMIT=1800  # 30 minutes
CELERY_WORKER_PREFETCH_MULTIPLIER=4
```

### WSGI Server Configuration

```bash
# Using gunicorn with uvicorn workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile - \
  --log-level info \
  --graceful-timeout 60 \
  --timeout 120
```

### Nginx Configuration

```nginx
upstream weatherops {
    least_conn;
    server backend1:8000 max_fails=3 fail_timeout=10s;
    server backend2:8000 max_fails=3 fail_timeout=10s;
    server backend3:8000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl http2;
    server_name api.weatherops.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://weatherops;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Health check path
        location /health {
            access_log off;
        }
    }
}
```

## Disaster Recovery

### Regular Backups

```bash
#!/bin/bash
# backup.sh - Daily backup script

BACKUP_DIR="/backups/weatherops"
DB_HOST="db.prod"
DB_NAME="weatherops"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump postgresql://user:pass@$DB_HOST/$DB_NAME \
    | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Verify backup
pg_restore -l $BACKUP_DIR/db_$DATE.sql.gz > /dev/null

# Upload to S3
aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz \
    s3://weatherops-backups/db_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
```

### Backup Verification

```bash
# Test restore monthly
mkdir /tmp/restore_test
pg_restore /backups/weatherops/db_latest.sql.gz \
    -d postgresql://test_user:pass@localhost/weatherops_test

# Verify data
psql postgresql://test_user:pass@localhost/weatherops_test \
    -c "SELECT COUNT(*) FROM weather_alerts;"
```

## Incident Response

### On-Call Runbooks

Create runbooks for common incidents:

```markdown
# Incident: High API Error Rate

## Detection
- Alert: HighErrorRate triggered
- Impact: Users unable to access API

## Investigation
1. Check application logs
2. Check database connectivity
3. Check Celery queue status
4. Check Redis connectivity
5. Review recent deployments

## Resolution
1. If recent deployment: rollback
2. If database issue: failover to replica
3. If queue stuck: restart workers
4. If cache issue: clear and restart Redis

## Verification
- Error rate returns to normal
- Health checks passing
- No pending alerts
```

## Documentation Maintenance

- [ ] Update deployment runbook after each deploy
- [ ] Document new environment variables
- [ ] Update configuration examples
- [ ] Maintain scaling guidelines
- [ ] Review and test rollback procedures quarterly
- [ ] Update performance benchmarks

## Conclusion

Follow this guide for safe, reliable production deployments. Test all procedures in staging first. Always have a rollback plan.
