# Notification Channels Setup Guide

Production setup for Email (SendGrid) and SMS (Twilio) notification channels.

## Email Channel (SendGrid)

### Prerequisites
- SendGrid account (https://sendgrid.com)
- SendGrid API key

### Setup Steps

#### 1. Create SendGrid Account
1. Sign up at https://sendgrid.com
2. Verify your sender email address
3. Create an API key:
   - Dashboard → Settings → API Keys → Create API Key
   - Name: `WeatherOps API Key`
   - Select "Full Access" or custom permissions
   - Copy the API key (you won't be able to see it again)

#### 2. Configure Environment Variables
```bash
# .env
SENDGRID_API_KEY=your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=alerts@yourdomain.com  # Must be verified in SendGrid
```

#### 3. Verify Sender Email
In SendGrid Dashboard:
1. Go to Settings → Sender Authentication
2. Verify your domain or single sender email
3. Use the verified email in `SENDGRID_FROM_EMAIL`

#### 4. Test Email Delivery
```python
from app.core.channels.email import EmailChannel

channel = EmailChannel()
success = await channel.send(
    recipient="test@example.com",
    subject="Test Alert",
    message="This is a test alert",
    alert_data={"metric": "temperature", "value": 35.5}
)
```

### Email Features
- ✅ HTML-formatted emails with styling
- ✅ Plain text fallback
- ✅ Alert data displayed in table format
- ✅ Links to dashboard and preferences
- ✅ Error handling and logging
- ✅ Automatic fallback to logging if API key not set

### SendGrid Limits
- Free tier: 100 emails/day
- Pro tier: Unlimited
- Bulk: 1 email per second rate limit

---

## SMS Channel (Twilio)

### Prerequisites
- Twilio account (https://www.twilio.com)
- Twilio phone number
- Account SID and Auth Token

### Setup Steps

#### 1. Create Twilio Account
1. Sign up at https://www.twilio.com
2. Get your Account SID and Auth Token from the Dashboard
3. Purchase a phone number:
   - Console → Phone Numbers → Buy a Number
   - Choose a number with SMS capabilities
   - Copy the phone number (e.g., +1234567890)

#### 2. Configure Environment Variables
```bash
# .env
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890  # Your purchased phone number
```

#### 3. Add Recipients to Account (Trial)
If using trial account (free $15 credit):
1. Go to Verified Caller IDs
2. Add each recipient phone number you want to test with
3. Verify the number by SMS code

Production accounts can send to any number.

#### 4. Test SMS Delivery
```python
from app.core.channels.sms import SMSChannel

channel = SMSChannel()
success = await channel.send(
    recipient="+1234567890",  # E.164 format required
    subject="Temperature Alert",
    message="Temperature exceeded 35°C"
)
```

### SMS Features
- ✅ E.164 format validation (+1234567890)
- ✅ Automatic message chunking (160 char limit)
- ✅ Multi-part message support
- ✅ Alert data in message prefix
- ✅ Error handling and logging
- ✅ Automatic fallback to logging if credentials not set

### Twilio Phone Numbers
- Cost: $1.00-$2.00/month per number
- SMS rates: ~$0.0075 per SMS in most countries
- Free trial: $15 credit

### Phone Number Format
All phone numbers must be in E.164 format:
```
+[country code][number]
Examples:
  +1234567890      (USA)
  +447911123456    (UK)
  +353123456789    (Ireland)
  +2348012345678   (Nigeria)
```

---

## Environment Configuration

### Complete .env Example
```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=alerts@weatherops.com

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890

# Other Services (existing)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/weatherops
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2
WEATHERAI_BASE_URL=https://api.weatherai.com
WEATHERAI_API_KEY=your-weatherai-key
SECRET_KEY=your-secret-key-min-32-chars
```

---

## Channel Behavior

### When Credentials Are Missing

**Email:**
- If `SENDGRID_API_KEY` is empty or missing:
  - Falls back to logging
  - Returns False (send failed)
  - No exceptions thrown

**SMS:**
- If Twilio credentials are empty or missing:
  - Falls back to logging
  - Returns False (send failed)
  - No exceptions thrown

This allows graceful degradation during development.

---

## Testing in Production

### Email Testing
```bash
# Check SendGrid Activity log
# Dashboard → Mail Send Activity

# Expected:
# - Status: Delivered
# - Event: Processed, Delivered
```

### SMS Testing
```bash
# Check Twilio Message Logs
# Console → Messaging → Messages

# Expected:
# - Status: Sent
# - Direction: Outbound
```

---

## Troubleshooting

### Email Not Sending

**Problem:** Email returns False
**Solutions:**
1. Verify `SENDGRID_API_KEY` is set and valid
2. Verify `SENDGRID_FROM_EMAIL` is verified in SendGrid dashboard
3. Check recipient email address is valid
4. Check SendGrid Activity log for bounce/suppress reasons
5. Verify API quota (free tier: 100/day)

**Debug:**
```python
from app.core.channels.email import EmailChannel
channel = EmailChannel()
print(f"Enabled: {channel.enabled}")
print(f"From: {channel.from_email}")
```

### SMS Not Sending

**Problem:** SMS returns False
**Solutions:**
1. Verify phone number is in E.164 format (+1234567890)
2. Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are valid
3. Verify `TWILIO_PHONE_NUMBER` is purchased and active
4. If trial account: verify recipient number is added to Verified Caller IDs
5. Check Twilio Message logs for error details

**Debug:**
```python
from app.core.channels.sms import SMSChannel
channel = SMSChannel()
print(f"Enabled: {channel.enabled}")
print(f"From: {channel.from_number}")
print(f"Valid: {channel._validate_phone_number('+1234567890')}")
```

### Rate Limiting

**SendGrid:**
- Free: 100 emails/day
- Pro: Unlimited
- Consider batching alerts for same user

**Twilio:**
- 1 SMS per second per account (limit can be increased)
- Cost: ~$0.0075 per SMS
- Consider consolidating alerts

---

## Cost Estimation

### Monthly Costs (Example)

**SendGrid:**
- Email notifications: $0 (free) to $30/month (Pro)
- 1000 emails/month: $30 (Pro plan)

**Twilio:**
- Phone number: $1.50/month
- SMS sent: 1000 × $0.0075 = $7.50/month
- Total: ~$9/month for 1000 alerts

**Total estimate:** $10-40/month for 1000 alerts

---

## Integration with Alert System

### Default Recipients
Currently alerts are sent to:
```python
recipients={
    "email": ["admin@weatherops.com"],
    "sms": ["+1234567890"],  # Configure in app/workers/tasks/weather_monitor.py
}
```

### Customizing Recipients
Update `app/workers/tasks/weather_monitor.py`:
```python
recipients={
    "email": ["user1@example.com", "user2@example.com"],
    "sms": ["+1234567890", "+1987654321"],
    "webhook": ["https://example.com/alerts"],
}
```

Or via user preferences (future feature):
```python
user = await user_repo.get_by_id(user_id)
recipients = user.notification_preferences  # From database
```

---

## Security Best Practices

### API Keys
1. Store in `.env` file (add to `.gitignore`)
2. Use environment variable management in production
3. Rotate keys periodically
4. Never commit keys to repository
5. Use different keys for development/staging/production

### Phone Numbers
1. Validate in E.164 format before sending
2. Don't expose numbers in logs
3. GDPR compliance: delete user data on request
4. Consider GDPR consent before SMS

### Email
1. Use verified sender domains in production
2. Monitor bounce/complaint rates
3. Remove bounced emails from recipient list
4. Set up authentication (SPF, DKIM, DMARC)

---

## Monitoring & Alerts

### What to Monitor

**Email:**
- Delivery rate (target: >95%)
- Bounce rate (target: <2%)
- Spam complaint rate (target: <0.1%)
- Unsubscribe rate

**SMS:**
- Delivery rate (target: >98%)
- API error rate
- Cost per alert
- Message queue depth

### Alert Rules
```yaml
- alert: EmailDeliveryFailed
  expr: email_failures_total > 5
  for: 5m
  
- alert: SMSDeliveryFailed
  expr: sms_failures_total > 5
  for: 5m

- alert: HighNotificationCost
  expr: monthly_sms_cost > budget
```

---

## FAQ

**Q: Can I test without SendGrid/Twilio?**  
A: Yes, leave credentials empty. Channels will log instead of sending.

**Q: Can I send to multiple recipients?**  
A: Yes, `send_alert_notification()` accepts list of recipients per channel.

**Q: What's the maximum message length?**  
A: Email: unlimited. SMS: 160 chars per message (automatically chunked).

**Q: Can I customize email template?**  
A: Yes, modify `_build_html_content()` method in `EmailChannel`.

**Q: How do I unsubscribe users?**  
A: Implement user preferences table and check before sending.

---

## Additional Resources

- SendGrid Docs: https://docs.sendgrid.com/
- Twilio Docs: https://www.twilio.com/docs/
- E.164 Format: https://en.wikipedia.org/wiki/E.164
- GDPR SMS Compliance: https://gdpr-info.eu/

---

**Last Updated:** June 5, 2024  
**Version:** 1.0.0
