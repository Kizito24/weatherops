# Alert and Notification System - Quick Start Guide

Get the alert and notification system up and running in 5 steps.

## Step 1: Run Database Migration

Create the alerts table and indexes:

```bash
cd backend
alembic upgrade head
```

This creates:
- `alerts` table with full schema (id, location_id, rule_id, user_id, metric, actual_value, threshold, operator, severity, status, weather_snapshot, created_at, updated_at, resolved_at)
- Indexes on location_id, rule_id, user_id, status, severity, created_at
- Foreign keys to locations, rules, users (CASCADE delete)

## Step 2: Configure Environment Variables

Create/update `.env` with notification credentials:

```bash
# Required for Email notifications (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=alerts@weatherops.com

# Required for SMS notifications (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Getting credentials:**
- SendGrid: https://app.sendgrid.com/settings/api_keys
- Twilio: https://www.twilio.com/console

See [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md) for detailed instructions.

## Step 3: Integrate with Rule Engine

When your rule engine detects a triggered rule, create an alert:

```python
from app.services.alert_service import AlertService
from app.services.notification_service import NotificationService

async def handle_triggered_rule(
    location_id: UUID,
    rule_evaluation_result: RuleEvaluationResult,
    weather_snapshot: dict,
    db: AsyncSession,
):
    """Called when a rule is triggered."""
    # Create alert (with automatic deduplication)
    alert_service = AlertService(db)
    alert = await alert_service.create_from_triggered_rule(
        location_id=location_id,
        result=rule_evaluation_result,
        weather_snapshot=weather_snapshot,
        user_id=rule_evaluation_result.rule.owner_id,
    )
    
    if alert is None:
        # Duplicate alert prevented (within 5-minute window)
        return
    
    # Send notifications
    notification_service = NotificationService()
    recipients = {
        "email": ["admin@example.com"],
        "sms": ["+1234567890"],
    }
    
    results = await notification_service.send_notification(alert, recipients)
    # results = {"email": True, "sms": True}
```

## Step 4: Query Alerts (Optional)

Retrieve and analyze alerts:

```python
from app.services.alert_service import AlertService

alert_service = AlertService(db)

# Get all active alerts
active = await alert_service.get_active_alerts()

# Get HIGH severity alerts
critical = await alert_service.get_active_alerts_by_severity("HIGH")

# Get alerts for a location
location_alerts = await alert_service.get_location_alerts(location_id)

# Count active alerts for a location
count = await alert_service.get_alert_count_for_location(location_id)

# Resolve an alert
resolved = await alert_service.resolve_alert(alert_id)
```

## Step 5: Test Configuration (Optional)

Verify channels are working before production:

```python
from app.services.notification_service import NotificationService

service = NotificationService()

# Test email
email_ok = await service.test_notification("email", "your@email.com")

# Test SMS
sms_ok = await service.test_notification("sms", "+1234567890")

# Test webhook
webhook_ok = await service.test_notification("webhook", "https://example.com/alerts")

print(f"Email: {email_ok}, SMS: {sms_ok}, Webhook: {webhook_ok}")
```

---

## Key Features

✅ **Automatic Deduplication**
- Prevents duplicate alerts within 5-minute window
- Same rule + location + metric = one alert
- Stops alert storms

✅ **Automatic Severity Calculation**
- Based on deviation magnitude
- Temperature: LOW <2°C, MEDIUM 2-5°C, HIGH >5°C
- Rainfall: LOW <5mm, MEDIUM 5-15mm, HIGH >15mm
- Customizable thresholds

✅ **Multi-Channel Notifications**
- Email: HTML-formatted with SendGrid
- SMS: Auto-chunked with Twilio
- Webhook: JSON POST to custom endpoints

✅ **Production-Grade Error Handling**
- Notification failures don't break alert creation
- Graceful degradation if credentials missing
- Structured JSON logging
- Async parallel processing

✅ **Easy Integration**
- Drop-in service classes
- No complex setup required
- Works with existing database

---

## Architecture

```
Rule Engine (triggered)
    ↓
AlertService.create_from_triggered_rule()
    ├─ Validate triggered ✓
    ├─ Check dedup window ✓
    ├─ Calculate severity ✓
    └─ Persist to database ✓
    ↓
NotificationService.send_notification()
    ├─ Format message
    ├─ Send Email (SendGrid)
    ├─ Send SMS (Twilio)
    └─ Send Webhook (HTTP)
```

---

## File Structure

```
backend/
├── app/
│   ├── models/
│   │   └── alert.py                    # Alert ORM model
│   ├── repositories/
│   │   └── alert_repository.py         # Data access layer
│   ├── services/
│   │   ├── alert_service.py            # Alert creation & management
│   │   └── notification_service.py     # Multi-channel notification
│   └── core/channels/
│       ├── base.py                     # Channel interface
│       ├── email.py                    # SendGrid integration
│       ├── sms.py                      # Twilio integration
│       └── webhook.py                  # HTTP POST integration
├── alembic/
│   └── versions/
│       └── 001_initial_alert_tables.py # Migration
├── examples/
│   └── alert_system_demo.py            # Usage examples
├── ALERT_SERVICE_INTEGRATION.md        # Full integration guide
├── ALERT_SYSTEM_QUICKSTART.md          # This file
├── NOTIFICATION_SETUP.md               # Setup instructions
└── pyproject.toml                      # Updated with sendgrid, twilio
```

---

## Common Issues

### Alerts not being created
- Ensure rule.triggered == True
- Check database connection
- Verify foreign keys exist (location_id, rule_id, user_id)
- Check logs for "alert_creation_failed"

### Notifications not sending
- Run `service.test_notification()` to verify config
- Check environment variables are set
- For Email: verify sender in SendGrid dashboard
- For SMS: verify phone number is E.164 format (+1234567890)
- Check logs for "notification_channel_error"

### Too many duplicate alerts
- Increase DUPLICATE_WINDOW_MINUTES (default 5)
- Or implement user preferences to filter alerts

---

## Next Steps

1. **Setup Credentials**: Follow [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md)
2. **Run Migration**: `alembic upgrade head`
3. **Test Configuration**: Run test_notification() for each channel
4. **Integrate with Rule Engine**: Call AlertService.create_from_triggered_rule()
5. **Monitor**: Check logs for alert creation and notification delivery

---

## Configuration Reference

### AlertService Constants

```python
# Time window for deduplication (minutes)
DUPLICATE_WINDOW_MINUTES = 5

# Severity thresholds (customize as needed)
SEVERITY_THRESHOLDS = {
    "temperature": {"HIGH": 5.0, "MEDIUM": 2.0},
    "rainfall": {"HIGH": 15.0, "MEDIUM": 5.0},
    "wind_speed": {"HIGH": 12.0, "MEDIUM": 4.0},
    "humidity": {"HIGH": 20.0, "MEDIUM": 10.0},
}
```

### Notification Channels

```python
# Available channels
notification_service.get_available_channels()
# Returns: ["email", "sms", "webhook"]

# Register custom channel
notification_service.register_channel("slack", SlackChannel())
```

---

## Performance

- Deduplication query: O(1) with indexes
- Severity calculation: O(1) lookup
- Notification parallelization: asyncio.gather()
- Weather snapshot: Truncated to 2000 chars
- Batch notifications: Concurrent sends

---

## For Detailed Information

- **Full Integration Guide**: [ALERT_SERVICE_INTEGRATION.md](./ALERT_SERVICE_INTEGRATION.md)
- **Notification Setup**: [NOTIFICATION_SETUP.md](./NOTIFICATION_SETUP.md)
- **Code Examples**: [examples/alert_system_demo.py](./examples/alert_system_demo.py)

---

**Questions?** Check the integration guide or search logs for error messages.  
**Ready to deploy?** Make sure environment variables are set and migration is run.

---

**Version:** 1.0.0  
**Last Updated:** June 5, 2026  
**Status:** Production-Ready
