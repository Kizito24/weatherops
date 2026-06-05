# WeatherOps Operations Guide

Production operations, deployment, scaling, and troubleshooting for WeatherOps backend.

## Deployment

### Prerequisites

- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Python 3.12+

### Local Development Setup

```bash
cd backend

# Install dependencies
pip install -e .

# Set environment variables
cp .env.example .env

# Run migrations
alembic upgrade head

# Start services
docker-compose up postgres redis

# Terminal 1: Start FastAPI server
uvicorn app.main:app --reload --port 8000

# Terminal 2: Start Celery worker
celery -A app.workers.celery_app worker -l info --concurrency=4

# Terminal 3: Start Celery Beat
celery -A app.workers.celery_app beat -l info

# Terminal 4: Monitor with Flower (optional)
celery -A app.workers.celery_app flower --port 5555
```

### Docker Compose Production

```bash
docker-compose -f docker-compose.yml up -d
```

**Services**:
- `postgres` — PostgreSQL database
- `redis` — Redis broker for Celery
- `backend` — FastAPI application
- `celery_worker` — Background task processor
- `celery_beat` — Scheduled task scheduler
- `flower` — Task monitoring (optional)

### Kubernetes Deployment (Production)

See `k8s/` directory for sample manifests.

```bash
# Build image
docker build -t weatherops:latest .

# Push to registry
docker push your-registry/weatherops:latest

# Deploy
kubectl apply -f k8s/
```

**Key Resources**:
- `Deployment` — FastAPI backend (3+ replicas)
- `StatefulSet` — Celery worker (2+ replicas)
- `CronJob` — Celery beat scheduler (1 replica)
- `Service` — LoadBalancer for API
- `Ingress` — TLS termination
- `ConfigMap` — Configuration
- `Secret` — Credentials

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@postgres:5432/weatherops
DATABASE_POOL_SIZE=20
DATABASE_MAX_OVERFLOW=40

# Redis
REDIS_URL=redis://redis:6379

# Celery
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Weather Service
WEATHERAI_BASE_URL=https://api.weatherai.com
WEATHERAI_API_KEY=your-api-key
WEATHERAI_CACHE_TTL=300

# Security
SECRET_KEY=your-secret-key (min 32 chars)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Notifications
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-key

TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# API
API_TITLE=WeatherOps
API_VERSION=1.0.0
API_DOCS_URL=/docs
CORS_ORIGINS=["https://example.com"]
```

## Monitoring & Observability

### Metrics to Monitor

```
System Metrics:
  - CPU usage
  - Memory usage
  - Disk I/O
  - Network throughput

Database Metrics:
  - Active connections
  - Query latency (p50, p95, p99)
  - Slow queries
  - Connection pool utilization

Redis Metrics:
  - Used memory
  - Commands/sec
  - Evictions
  - Keyspace hits/misses

Celery Metrics:
  - Tasks/sec (processed)
  - Task latency (p50, p95, p99)
  - Task failure rate
  - Queue depth
  - Worker availability

Business Metrics:
  - Alerts created/sec
  - Notification delivery rate
  - Alert resolution time
  - Rules evaluated/sec
```

### Prometheus Setup

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['localhost:8000']

  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['localhost:9121']

  - job_name: 'celery'
    static_configs:
      - targets: ['localhost:5555']
```

### Grafana Dashboards

**Dashboard 1: System Health**
- CPU, Memory, Disk usage
- Database connections
- Redis memory

**Dashboard 2: API Performance**
- Request latency
- Error rate
- Status codes
- Endpoint breakdown

**Dashboard 3: Automation Engine**
- Weather monitor task duration
- Alerts created/sec
- Notification delivery rate
- Error rate by location

**Dashboard 4: Celery Workers**
- Active tasks
- Task queue depth
- Worker heartbeat
- Task failures

### Alerting Rules

```yaml
groups:
  - name: weatherops
    rules:
      - alert: HighCPUUsage
        expr: node_cpu > 80
        for: 5m

      - alert: DatabaseConnectionPoolExhausted
        expr: db_pool_utilization > 90
        for: 2m

      - alert: WeatherMonitorTaskFailed
        expr: celery_task_failures{task="weather_monitor"} > 0
        for: 5m

      - alert: AlertCreationStalled
        expr: increase(alerts_created[5m]) == 0 and active_rules > 0
        for: 10m

      - alert: NotificationDeliveryFailed
        expr: notification_failures > 5
        for: 5m

      - alert: HighCeleryQueueDepth
        expr: celery_queue_depth > 1000
        for: 5m
```

## Logging

### Log Levels

```
DEBUG   — Detailed diagnostic info
INFO    — General informational messages
WARNING — Warning messages (default)
ERROR   — Error messages
CRITICAL— Critical failures
```

### Log Format (JSON)

```json
{
  "timestamp": "2024-06-05T10:30:45.123Z",
  "level": "INFO",
  "logger": "app.services.rule_engine",
  "message": "Rule evaluation completed",
  "location_id": "550e8400-e29b-41d4-a716-446655440000",
  "rules_evaluated": 5,
  "rules_triggered": 2,
  "duration_ms": 125
}
```

### Log Aggregation (ELK Stack)

```bash
# Filebeat config
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/weatherops/*.log
    json.message_key: message
    json.keys_under_root: true

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
```

## Backup & Recovery

### Database Backups

```bash
# Daily backup
pg_dump --verbose --format=custom \
  --file=weatherops_$(date +%Y%m%d).dump \
  --user=postgres weatherops

# Restore from backup
pg_restore --verbose --clean \
  --if-exists --no-password \
  --username=postgres \
  --dbname=weatherops \
  weatherops_20240605.dump
```

### Redis Persistence

Redis is configured with AOF (Append-Only File) in production:

```
appendonly yes
appendfsync everysec
```

## Scaling

### Horizontal Scaling (Add More Workers)

```bash
# Scale Celery workers
docker-compose up -d --scale celery_worker=4

# Or with Kubernetes
kubectl scale deployment celery-worker --replicas=4
```

### Vertical Scaling (More Resources)

```yaml
# Docker Compose
services:
  celery_worker:
    environment:
      - CELERY_WORKER_CONCURRENCY=8
      - CELERY_WORKER_PREFETCH_MULTIPLIER=4

# Kubernetes
resources:
  requests:
    cpu: 500m
    memory: 512Mi
  limits:
    cpu: 2
    memory: 2Gi
```

### Database Connection Pooling

```python
# app/database/session.py
DATABASE_POOL_SIZE = 20          # Min connections
DATABASE_MAX_OVERFLOW = 40       # Max additional connections
DATABASE_POOL_RECYCLE = 3600     # Recycle after 1 hour
DATABASE_POOL_PRE_PING = True    # Test connections
```

### Redis Configuration

```
# High throughput
maxclients 10000
timeout 300
tcp-keepalive 60

# Memory management
maxmemory-policy allkeys-lru
maxmemory 2gb
```

## Troubleshooting

### Celery Workers Not Processing Tasks

**Symptoms**: Tasks queued but not executing

**Solutions**:
1. Check Redis connection: `redis-cli ping`
2. Verify workers are running: `celery -A app.workers.celery_app inspect active`
3. Check queue depth: `celery -A app.workers.celery_app inspect reserved`
4. Review worker logs for errors
5. Restart workers: `docker-compose restart celery_worker`

### Weather Monitor Task Stalling

**Symptoms**: Weather monitor task not running, alerts not created

**Solutions**:
1. Check Beat scheduler is running: `ps aux | grep celery.*beat`
2. Verify Celery beat task exists: `celery -A app.workers.celery_app inspect scheduled`
3. Check task execution in logs: `grep weather_monitor /var/log/celery/*.log`
4. Manually trigger task: `celery -A app.workers.celery_app send_task tasks.weather_monitor`
5. Review beat schedule configuration

### High Alert Creation Rate

**Symptoms**: Alert spam, too many duplicate alerts

**Solutions**:
1. Review rule thresholds (may be too sensitive)
2. Increase idempotency window (default: 5 minutes)
3. Check weather data for frequent fluctuations
4. Review alert queries for performance

### Database Connection Pool Exhausted

**Symptoms**: `sqlalchemy.exc.TimeoutError: QueuePool timeout`

**Solutions**:
1. Increase pool size in config
2. Identify long-running queries with `pg_stat_statements`
3. Kill idle connections: `SELECT pg_terminate_backend(pid) WHERE state = 'idle'`
4. Review connection usage per component

### Redis Memory Issues

**Symptoms**: Redis crashes, OOM errors

**Solutions**:
1. Monitor Redis memory: `redis-cli info memory`
2. Check large keys: `redis-cli --bigkeys`
3. Implement key expiration
4. Increase Redis memory limit
5. Review Celery result retention

### Notification Delivery Failures

**Symptoms**: Alerts not being delivered via email/SMS

**Solutions**:
1. Check provider credentials (SendGrid, Twilio)
2. Verify recipient list is not empty
3. Check provider rate limits
4. Review provider logs for errors
5. Test with `send_alert_notification()` directly

## Runbooks

### Incident: Weather Monitor Task Failing

```
1. Check alert status
   - SELECT COUNT(*) FROM alerts WHERE created_at > NOW() - INTERVAL '10 minutes'
   
2. Verify task status
   - celery -A app.workers.celery_app inspect active
   
3. Check logs
   - docker logs backend | grep weather_monitor
   
4. Identify root cause
   - Weather API down? Check WEATHERAI status
   - Database issue? Check connections/queries
   - Celery worker crashed? Check resources
   
5. Remediate
   - Restart worker: docker-compose restart celery_worker
   - Verify weather API: curl -H "Auth: $KEY" https://api.weatherai.com/health
   - Trigger manual task: celery -A app.workers.celery_app send_task tasks.weather_monitor
```

### Incident: Alert Storm (Too Many Alerts)

```
1. Identify affected location/rule
   - SELECT location_id, rule_id, COUNT(*) FROM alerts 
     WHERE created_at > NOW() - INTERVAL '1 hour' 
     GROUP BY location_id, rule_id 
     ORDER BY COUNT(*) DESC LIMIT 5
   
2. Disable problematic rule
   - UPDATE rules SET active = FALSE WHERE id = '<rule_id>'
   
3. Review threshold
   - SELECT * FROM rules WHERE id = '<rule_id>'
   - Adjust threshold based on weather data
   
4. Re-enable rule
   - UPDATE rules SET active = TRUE WHERE id = '<rule_id>'
   
5. Monitor for recurrence
   - Watch alert rate for that location
```

### Incident: Database Replication Lag

```
1. Check replication status
   - SELECT * FROM pg_stat_replication
   
2. Identify slow replica
   - SELECT slot_name, restart_lsn, confirmed_flush_lsn FROM pg_replication_slots
   
3. Kick slow replica
   - SELECT pg_terminate_backend(pid) FROM pg_stat_replication WHERE ...
   
4. Monitor catch-up
   - Watch WAL position on primary vs replicas
   
5. Verify application health
   - Check if read replicas back online
```

## Performance Tuning

### PostgreSQL Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_alerts_location_created ON alerts(location_id, created_at DESC);
CREATE INDEX idx_alerts_rule_created ON alerts(rule_id, created_at DESC);
CREATE INDEX idx_rules_location_active ON rules(location_id, active);
CREATE INDEX idx_locations_owner ON locations(owner_id);

-- Enable query statistics
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Analyze slow queries
SELECT query, mean_exec_time, calls FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

### Celery Task Optimization

```python
# Reduce task frequency for low-traffic locations
if location.is_low_traffic:
    schedule = crontab(minute="*/15")  # Every 15 minutes instead of 5
else:
    schedule = crontab(minute="*/5")

# Batch process multiple rules
for location in locations:
    rules = await rule_repo.get_by_location(location.id)
    results = await engine.evaluate_location_rules(
        location.id,
        weather_data,
        rules=rules,  # Pass pre-fetched rules
    )
```

### API Response Caching

```python
# Cache location weather data
@app.get("/locations/{location_id}/weather")
async def get_location_weather(location_id: str):
    return await redis.get_or_fetch(
        f"weather:{location_id}",
        lambda: weather_service.get_current_weather(...),
        ttl=300,  # 5 minutes
    )
```

## Security

### Secrets Management

```bash
# Use environment variables
export WEATHERAI_API_KEY=$(aws secretsmanager get-secret-value --secret-id weatherai-key)

# Or mount secrets files
docker run -v /run/secrets/api_key:/app/api_key ...

# Never commit secrets to git
echo "*.env" >> .gitignore
echo "secrets/" >> .gitignore
```

### Network Security

```
- Deploy behind VPN for admin endpoints
- Use TLS for all external communication
- Rate limit public API endpoints
- Implement IP whitelisting for webhooks
```

## Disaster Recovery

### Database Recovery RTO/RPO

```
RTO: < 1 hour (restore from backup + replay WAL)
RPO: < 5 minutes (hourly backups + WAL archiving)

Backup Strategy:
- Daily full backup
- Hourly WAL archiving
- Multi-region replication
- Monthly offline backup
```

### Redis Recovery

```
RTO: < 5 minutes (restart from dump file)
RPO: < 1 second (AOF persistence)

Backup Strategy:
- Daily snapshots
- Real-time AOF replication
- Cluster failover
```

## Maintenance

### Weekly Tasks

- [ ] Review error logs for anomalies
- [ ] Check database size growth
- [ ] Verify backup completion
- [ ] Review performance metrics

### Monthly Tasks

- [ ] Analyze slow queries
- [ ] Review and optimize indexes
- [ ] Test disaster recovery
- [ ] Update dependencies

### Quarterly Tasks

- [ ] Load test for scaling readiness
- [ ] Security audit
- [ ] Capacity planning review
- [ ] Disaster recovery drill

---

**Last Updated**: June 5, 2024
**Version**: 1.0.0
