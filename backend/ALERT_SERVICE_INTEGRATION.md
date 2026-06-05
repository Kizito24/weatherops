# Alert and Notification Service Integration Guide

Complete integration guide for the production-grade alerting and notification system.

## Architecture Overview

The alerting system consists of three main components:

### 1. Alert Service (`app/services/alert_service.py`)
- Creates alerts from triggered rules with automatic deduplication
- Calculates severity based on metric deviation
- Stores weather context snapshots
- Prevents alert storms with 5-minute deduplication window

### 2. Notification Service (`app/services/notification_service.py`)
- Multi-channel notification dispatch (Email, SMS, Webhook)
- Batch notification processing
- Graceful degradation on channel failures
- Channel-agnostic architecture for easy extensibility

### 3. Data Layer
- **Model**: `app/models/alert.py` - Alert ORM model with severity and user tracking
- **Repository**: `app/repositories/alert_repository.py` - Data access with deduplication queries
- **Channels**: `app/core/channels/` - Email (SendGrid), SMS (Twilio), Webhook

## Data Flow

```
Rule Engine (Triggered)
    ↓
Alert Service (create_from_triggered_rule)
    ├─ Validate rule triggered
    ├─ Check deduplication window
    ├─ Calculate severity
    └─ Persist to database
    ↓
Notification Service
    ├─ Format message per channel
    ├─ Send Email (SendGrid)
    ├─ Send SMS (Twilio)
    └─ Send Webhook (HTTP POST)
```

## Integration Points

### 1. Rule Engine Integration

When a rule is triggered, call AlertService to create an alert:

```python
from app.services.alert_service import AlertService
from app.services.notification_service import NotificationService

# In your rule evaluation code
async def on_rule_triggered(
    location_id: UUID,
    rule_evaluation_result: RuleEvaluationResult,
    weather_snapshot: dict,
    db: AsyncSession,
):
    """Handle triggered rule - create alert and notify."""
    alert_service = AlertService(db)
    notification_service = NotificationService()
    
    # Create alert with deduplication
    alert = await alert_service.create_from_triggered_rule(
        location_id=location_id,
        result=rule_evaluation_result,
        weather_snapshot=weather_snapshot,
        user_id=rule_evaluation_result.rule.owner_id,
    )
    
    if alert is None:
        # Duplicate alert prevented
        return
    
    # Send notifications (failures don't break alert creation)
    recipients = {
        "email": ["user@example.com"],
        "sms": ["+1234567890"],
        "webhook": ["https://example.com/alerts"],
    }
    
    results = await notification_service.send_notification(alert, recipients)
    # Log results but don't fail - alert is already persisted
```

### 2. Database Setup

Run migrations to create the alerts table:

```bash
cd backend
alembic upgrade head
```

Migration details:
- Creates `alerts` table with full schema
- Indexes on location_id, rule_id, user_id, status, severity, created_at
- Foreign keys to locations, rules, users (CASCADE delete)
- Composite index on (location_id, created_at) for efficiency

### 3. Environment Configuration

Configure SendGrid and Twilio in `.env`:

```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=alerts@weatherops.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Optional
WEBHOOK_TIMEOUT=10  # seconds for webhook requests
```

See [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md) for detailed setup instructions.

## API Design

### Alert Service

```python
class AlertService:
    # Core methods
    async def create_from_triggered_rule(
        location_id: UUID,
        result: RuleEvaluationResult,
        weather_snapshot: dict | None = None,
        user_id: UUID | None = None,
    ) -> Alert | None:
        """Create alert with automatic deduplication."""
    
    async def resolve_alert(alert_id: UUID) -> Alert | None:
        """Mark alert as resolved."""
    
    async def get_active_alerts() -> list[Alert]:
        """Get all active alerts system-wide."""
    
    async def get_active_alerts_by_severity(severity: str) -> list[Alert]:
        """Get active alerts filtered by severity (LOW/MEDIUM/HIGH)."""
    
    async def get_location_alerts(location_id: UUID) -> list[Alert]:
        """Get active alerts for a specific location."""
    
    async def get_alert_count_for_location(location_id: UUID) -> int:
        """Count active alerts for a location."""
    
    async def get_critical_alert_count() -> int:
        """Count HIGH severity active alerts."""
```

### Notification Service

```python
class NotificationService:
    # Core methods
    async def send_notification(
        alert: Alert,
        recipients: dict[str, list[str]],
    ) -> dict[str, bool]:
        """Send alert to multiple recipients across channels."""
    
    async def send_bulk_notifications(
        alerts: list[Alert],
        recipients: dict[str, list[str]],
    ) -> dict[str, list[bool]]:
        """Send notifications for multiple alerts in parallel."""
    
    async def test_notification(channel_name: str, recipient: str) -> bool:
        """Test a notification channel configuration."""
    
    def register_channel(name: str, channel: NotificationChannel) -> None:
        """Register a custom notification channel."""
    
    def get_available_channels() -> list[str]:
        """Get list of available notification channels."""
```

## Severity Calculation

Alert severity is automatically calculated based on metric deviation:

```python
SEVERITY_THRESHOLDS = {
    "temperature": {
        "HIGH": 5.0,    # >5°C deviation = HIGH
        "MEDIUM": 2.0,  # >2°C deviation = MEDIUM
    },
    "rainfall": {
        "HIGH": 15.0,   # >15mm deviation = HIGH
        "MEDIUM": 5.0,  # >5mm deviation = MEDIUM
    },
    "wind_speed": {
        "HIGH": 12.0,   # >12 km/h deviation = HIGH
        "MEDIUM": 4.0,  # >4 km/h deviation = MEDIUM
    },
    "humidity": {
        "HIGH": 20.0,   # >20% deviation = HIGH
        "MEDIUM": 10.0,  # >10% deviation = MEDIUM
    },
}
```

Example:
- Temperature actual=38°C, threshold=33°C → deviation=5°C → HIGH
- Temperature actual=35.5°C, threshold=33°C → deviation=2.5°C → MEDIUM
- Temperature actual=34°C, threshold=33°C → deviation=1°C → LOW

## Deduplication Logic

Prevents alert storms by checking for recent alerts:

```python
# 5-minute window (configurable via DUPLICATE_WINDOW_MINUTES)
# Checks for existing alert with same:
# - location_id
# - rule_id
# - metric
# - status = "active"
# - created_at >= (now - 5 minutes)

# If found: returns None (duplicate prevented)
# If not found: creates new alert
```

This prevents spamming notifications for the same condition repeatedly.

## Error Handling

The system is designed for graceful degradation:

### Alert Creation Failures
If alert creation fails:
```python
try:
    alert = await alert_service.create_from_triggered_rule(...)
except AlertServiceError as e:
    logger.error(f"Alert creation failed: {e}")
    # Application should handle appropriately
```

### Notification Failures
Notification failures do NOT break alert creation:
```python
# Alert is already persisted at this point
results = await notification_service.send_notification(alert, recipients)
# results = {"email": True, "sms": False, "webhook": True}
# Alert exists regardless of delivery success
```

### Missing Credentials
If notification credentials are missing:
- Falls back to logging the message
- Returns False for that channel
- Does not throw exception
- Allows development/testing without credentials

## Monitoring & Observability

### Structured Logging

All operations use structured JSON logging:

```python
logger.info(
    "alert_created_successfully",
    extra={
        "alert_id": str(alert.id),
        "rule_id": str(rule.id),
        "location_id": str(location_id),
        "metric": rule.metric,
        "actual_value": actual_value,
        "threshold": rule.threshold,
        "severity": severity,
    },
)
```

### Key Metrics to Track

1. **Alert Creation**
   - `alert_created_successfully` - Total alerts created
   - `alert_duplicate_prevented` - Duplicate alerts blocked
   - `alert_creation_failed` - Creation failures

2. **Notification Delivery**
   - `notification_channel_delivery` - Delivery results per channel
   - `notification_channel_error` - Channel-specific failures
   - Sent/failed/total per channel

3. **Performance**
   - Severity calculation time
   - Deduplication check latency
   - Notification send latency (per channel)

## Testing

### Unit Testing Alert Service

```python
async def test_alert_creation():
    db = AsyncSession()
    service = AlertService(db)
    
    result = RuleEvaluationResult(
        rule=Mock(id=uuid4(), metric="temperature", threshold=35),
        triggered=True,
        actual_value=38.5,
    )
    
    alert = await service.create_from_triggered_rule(
        location_id=uuid4(),
        result=result,
        weather_snapshot={"temp": 38.5, "humidity": 60},
    )
    
    assert alert is not None
    assert alert.severity == "HIGH"  # 3.5°C deviation
```

### Unit Testing Notification Service

```python
async def test_notification_service():
    service = NotificationService()
    
    alert = Mock(
        id=uuid4(),
        metric="temperature",
        actual_value=38.5,
        severity="HIGH",
    )
    
    recipients = {
        "email": ["test@example.com"],
        "sms": ["+1234567890"],
    }
    
    results = await service.send_notification(alert, recipients)
    
    assert "email" in results
    assert "sms" in results
```

### Integration Testing

```python
async def test_full_alert_workflow():
    """Test full flow from rule trigger to notification."""
    db = AsyncSession()
    alert_service = AlertService(db)
    notification_service = NotificationService()
    
    # Simulate rule trigger
    result = create_mock_rule_result(triggered=True, actual_value=38.5)
    
    # Create alert
    alert = await alert_service.create_from_triggered_rule(
        location_id=uuid4(),
        result=result,
    )
    
    assert alert is not None
    
    # Send notifications
    recipients = {
        "email": ["admin@example.com"],
        "sms": ["+1234567890"],
    }
    
    results = await notification_service.send_notification(alert, recipients)
    
    # Verify results
    assert any(results.values())  # At least one channel succeeded
```

## Extending the System

### Adding a New Notification Channel

1. Create channel class inheriting from `NotificationChannel`:

```python
from app.core.channels.base import NotificationChannel

class SlackChannel(NotificationChannel):
    def __init__(self):
        self.enabled = bool(os.getenv("SLACK_WEBHOOK_URL"))
        self.webhook_url = os.getenv("SLACK_WEBHOOK_URL", "")
    
    async def send(
        self,
        recipient: str,
        subject: str,
        message: str,
        alert_data: dict[str, Any],
    ) -> bool:
        # Implementation
        pass
```

2. Register with NotificationService:

```python
notification_service = NotificationService()
notification_service.register_channel("slack", SlackChannel())
```

### Customizing Severity Thresholds

Edit `AlertService.SEVERITY_THRESHOLDS`:

```python
SEVERITY_THRESHOLDS = {
    "custom_metric": {
        "HIGH": 100.0,
        "MEDIUM": 50.0,
    },
}
```

## Troubleshooting

### Alerts Not Being Created

1. Check rule is actually triggered: `result.triggered == True`
2. Check actual_value is not None
3. Check database connection and permissions
4. Check logs for `alert_creation_failed` messages
5. Verify foreign keys exist (location_id, rule_id, user_id)

### Notifications Not Sending

1. Check credentials are set in environment variables
2. Run test notification: `await notification_service.test_notification("email", "test@example.com")`
3. Check logs for `notification_channel_error` messages
4. For Email: verify sender is verified in SendGrid
5. For SMS: verify phone number format (E.164)
6. Check rate limits (SendGrid: 100/day free, Twilio: 1 SMS/sec)

### Duplicate Alerts Being Created

1. Check `DUPLICATE_WINDOW_MINUTES` is set (default 5)
2. Verify database timestamps are in UTC timezone
3. Check deduplication query in logs: `alert_duplicate_prevented`

## Performance Considerations

1. **Deduplication Query**: Uses indexed fields (location_id, rule_id, created_at)
2. **Notification Parallelization**: Uses asyncio.gather() for concurrent sends
3. **Weather Snapshot**: Truncated to 2000 chars to prevent storage bloat
4. **Severity Calculation**: O(1) lookup with metric thresholds
5. **Bulk Operations**: Batch send_bulk_notifications for multiple alerts

## Future Enhancements

1. **User Preferences**: Store notification preferences per user
2. **Rate Limiting**: Limit alerts per user/location over time window
3. **Smart Consolidation**: Group related alerts into summary notifications
4. **Delivery Retry**: Implement retry logic for failed notifications
5. **Analytics Dashboard**: Track alert trends and notification effectiveness
6. **Custom Actions**: Support escalation rules (if HIGH and unresolved >1h, escalate)
7. **Webhook Validation**: HMAC signature validation for webhook security
8. **Template System**: Customizable message templates per channel

## References

- [SendGrid Integration](./NOTIFICATION_SETUP.md#email-channel-sendgrid)
- [Twilio Integration](./NOTIFICATION_SETUP.md#sms-channel-twilio)
- [Webhook Security](./NOTIFICATION_SETUP.md#security-best-practices)

---

**Version:** 1.0.0  
**Last Updated:** June 5, 2026  
**Status:** Production-Ready
