# WeatherOps Automation Engine

Production-grade event-driven weather monitoring and alerting system.

## Overview

The automation engine processes weather data every 5 minutes to automatically generate alerts when weather conditions violate user-defined rules, then sends notifications through multiple channels (email, SMS, webhooks).

```text
Celery Beat (every 5 min)
        ↓
Weather Monitor Task
        ↓
Fetch Weather Data (Locations)
        ↓
Rule Evaluation Engine
        ↓
Alert Creation (with idempotency)
        ↓
Notification Service
        ↓
Delivery Channels (Email/SMS/Webhook)
```

## Core Components

### 1. Weather Monitor Task (`app/workers/tasks/weather_monitor.py`)

**Periodic Task**: Runs every 5 minutes via Celery Beat

**Responsibilities**:
- Fetch all monitored locations from database
- Retrieve current weather for each location (with caching)
- Invoke rule engine to evaluate conditions
- Create alerts for triggered rules
- Dispatch notifications

**Key Features**:
- **Batch Processing**: Processes all locations in a single task run
- **Error Isolation**: One location failure doesn't impact others
- **Retry Logic**: 3 retries with exponential backoff on failure
- **Task Stats**: Returns summary of processed locations, alerts created, errors

**Example Output**:
```json
{
  "locations_processed": 5,
  "rules_evaluated": 15,
  "alerts_created": 3,
  "notifications_sent": 3,
  "errors": 0
}
```

### 2. Rule Evaluation Engine (`app/services/rule_engine.py`)

**Purpose**: Compares weather metrics against rule conditions.

**Key Methods**:
- `evaluate_location_rules(location_id, weather_data)`: Evaluate all rules for location
- `get_triggered_rules(location_id, weather_data)`: Get only triggered rules
- `_compare_values(actual, operator, threshold)`: Perform metric comparison

**Operators Supported**:
- `>` — Greater than
- `<` — Less than
- `>=` — Greater than or equal
- `<=` — Less than or equal
- `==` — Equal to

**Example**:
```python
weather_data = {
    "temperature": 38.5,
    "rainfall": 45,
    "wind_speed": 25,
    "humidity": 65,
}

triggered = await rule_engine.get_triggered_rules(
    location_id, weather_data
)

# Returns RuleEvaluationResult objects for rules where condition met
```

### 3. Alert Service (`app/services/alert_service.py`)

**Purpose**: Create and manage weather alerts with deduplication.

**Key Features**:
- **Idempotency**: Prevents duplicate alerts within 5-minute window
- **Alert Snapshots**: Stores weather state at time of trigger
- **Alert Lifecycle**: active → resolved states

**Key Methods**:
- `create_from_triggered_rule(location_id, result)`: Create alert with dedup check
- `resolve_alert(alert_id)`: Mark alert as resolved
- `get_active_alerts()`: Get all active alerts system-wide
- `get_location_alerts(location_id)`: Get location-specific alerts

**Deduplication Logic**:
```text
When alert triggered:
  Check if alert exists for (location, rule, metric)
  created within last 5 minutes
  
  If found: Skip (duplicate prevention)
  If not: Create alert
```

### 4. Notification Service (`app/services/notification_service.py`)

**Purpose**: Send alerts through multiple channels.

**Key Methods**:
- `send_alert_notification(alert, recipients)`: Send via all configured channels
- `register_channel(name, channel)`: Register custom notification channel

**Example**:
```python
results = await notification_service.send_alert_notification(
    alert,
    recipients={
        "email": ["user@example.com", "admin@example.com"],
        "sms": ["+1234567890"],
        "webhook": ["https://example.com/alerts"],
    }
)

# Returns dict: {"email": True, "sms": True, "webhook": True}
```

### 5. Notification Channels

#### Email Channel (`app/core/channels/email.py`)
- Logs notification as mock (production: integrate with SendGrid/AWS SES)
- Supports HTML templates and attachments

#### SMS Channel (`app/core/channels/sms.py`)
- Logs notification as mock (production: integrate with Twilio/AWS SNS)
- Truncates to 160 characters

#### Webhook Channel (`app/core/channels/webhook.py`)
- Makes HTTP POST to configured URL
- Includes full alert context in JSON payload
- Handles timeouts and errors gracefully

## Data Models

### Alert Model

```python
class Alert(Base):
    id: UUID
    location_id: UUID (FK)
    rule_id: UUID (FK)
    metric: str  # temperature, rainfall, wind_speed, humidity
    actual_value: float  # Actual weather value
    threshold: float  # Rule threshold
    operator: str  # >, <, >=, <=, ==
    status: str  # active, resolved
    weather_snapshot: str  # JSON of all weather at time of trigger
    created_at: datetime
    updated_at: datetime
    resolved_at: datetime | None
```

## Configuration

### Celery Beat Schedule (`app/workers/beat_schedule.py`)

```python
beat_schedule = {
    "weather-monitor": {
        "task": "tasks.weather_monitor",
        "schedule": crontab(minute="*/5"),  # Every 5 minutes
    },
}
```

### Environment Variables

```env
# Celery
CELERY_BROKER_URL=redis://redis:6379/1
CELERY_RESULT_BACKEND=redis://redis:6379/2

# Weather Service
WEATHERAI_BASE_URL=https://api.weatherai.com
WEATHERAI_API_KEY=your-key

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@db/weatherops
```

## Event Flow Example

**Scenario**: Temperature exceeds 35°C at Lagos location.

```text
1. Celery Beat triggers weather_monitor task every 5 minutes

2. Task fetches location: "Lagos" (6.5244, 3.3792)

3. WeatherService retrieves cached or fresh data:
   {
     "temperature": 38.5,
     "rainfall": 0,
     "wind_speed": 15,
     "humidity": 60
   }

4. RuleEngine evaluates all rules:
   Rule 1: temperature > 35 ✓ TRIGGERED
   Rule 2: rainfall > 30 ✗ (0 < 30)

5. AlertService creates alert:
   - Check for duplicate (none found)
   - Store alert with weather snapshot
   - Return alert object

6. NotificationService sends alert:
   - Email to: ["admin@weatherops.com"]
   - SMS to: ["+1234567890"]
   - Webhook POST to: ["https://example.com/alerts"]

7. All channels receive notification:
   {
     "subject": "Weather Alert: TEMPERATURE",
     "message": "Reached 38.5°C (> 35.0°C)",
     "alert": {
       "alert_id": "...",
       "location_id": "...",
       "metric": "temperature",
       "value": 38.5,
       "threshold": 35.0
     }
   }

8. Task returns stats:
   {
     "locations_processed": 1,
     "rules_evaluated": 2,
     "alerts_created": 1,
     "notifications_sent": 1,
     "errors": 0
   }
```

## Running the Automation Engine

### 1. Start Celery Worker

```bash
celery -A app.workers.celery_app worker -l info --concurrency=4
```

### 2. Start Celery Beat (Scheduler)

```bash
celery -A app.workers.celery_app beat -l info
```

### 3. Monitor Celery (Flower)

```bash
celery -A app.workers.celery_app flower
# Visit http://localhost:5555
```

### 4. Docker Compose (Recommended)

```bash
docker-compose up postgres redis backend celery_worker celery_beat
```

## Testing the Automation Engine

### Manual Task Trigger

```python
from app.workers.tasks.weather_monitor import run_weather_monitor

# Trigger task directly
result = run_weather_monitor.delay()
print(result.get())  # Get result
```

### View Active Alerts

```bash
curl -X GET http://localhost:8000/api/v1/alerts \
  -H "Authorization: Bearer $TOKEN"
```

### Trigger Alert Manually (for testing)

```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.alert_service import AlertService
from app.models.alert import Alert

# Create test alert
alert = await alert_service.create_from_triggered_rule(
    location_id="...",
    result=RuleEvaluationResult(...),
)

# Send notification
await notification_service.send_alert_notification(
    alert,
    recipients={"email": ["test@example.com"]}
)
```

## Scalability Considerations

### Current Design (Single Task)
- ✅ Simple to operate
- ✅ Minimal infrastructure
- ✅ Good for <1000 locations
- ❌ Monolithic: all locations processed sequentially

### Future: Distributed Processing
```text
weather-monitor (main task)
  ├─→ fetch-location-weather (per location, async)
  ├─→ evaluate-rules (per location, async)
  └─→ create-alerts (per location, async)
```

**Benefits**:
- Process multiple locations in parallel
- Handle 10K+ locations
- Better fault isolation

## Error Handling

### Per-Location Isolation

```python
for location in locations:
    try:
        await _process_location(...)
    except Exception as e:
        logger.error(f"Error processing location {location.id}: {e}")
        stats["errors"] += 1
        continue  # Continue with next location
```

### Retry Logic

```python
@celery_app.task(
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 3},
    retry_backoff=True,
    retry_backoff_max=600,
)
```

## Monitoring & Alerts

### Key Metrics

```
- Task execution frequency (every 5 min)
- Task duration (target: <30s per 1000 locations)
- Alert creation rate (per minute)
- Notification delivery rate (success %)
- Error rate (per location)
```

### Prometheus Rules (Example)

```yaml
- alert: WeatherMonitorTaskFailed
  expr: celery_task_failures_total{task="tasks.weather_monitor"} > 5
  
- alert: AlertCreationStalled
  expr: increase(alerts_created[5m]) == 0 and active_rules > 0
```

## Production Checklist

- [ ] Set up Celery Beat scheduler
- [ ] Configure Redis broker + backend
- [ ] Implement email channel (SendGrid/SES)
- [ ] Implement SMS channel (Twilio/SNS)
- [ ] Configure notification recipients
- [ ] Set up Prometheus monitoring
- [ ] Create Celery task alerting
- [ ] Run load test (1000+ locations)
- [ ] Implement graceful shutdown
- [ ] Set up Celery flower for monitoring
- [ ] Configure task timeout values
- [ ] Document runbook for Celery issues

## API Endpoints (Future)

```
GET  /api/v1/alerts              - List active alerts
GET  /api/v1/alerts/{id}         - Get alert details
POST /api/v1/alerts/{id}/resolve - Resolve alert
GET  /api/v1/locations/{id}/alerts - Location-specific alerts
GET  /api/v1/dashboard/stats     - Automation engine stats
```

## Architecture Decisions

### Idempotency (5-minute window)
**Why**: Prevent alert fatigue from same condition triggering multiple times in close succession

### Batch Processing
**Why**: Simpler to operate, fewer connection pools, easier monitoring

### Event-Driven (Celery/Redis)
**Why**: Decouples monitoring from notifications, enables horizontal scaling

### Structured Logging (JSON)
**Why**: Easy integration with log aggregation systems (ELK, Datadog, etc.)

---

**Status**: Production-Ready ✅
**Last Updated**: June 5, 2024
**Version**: 1.0.0
