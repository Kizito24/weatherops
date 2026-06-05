"""Notification service for alert delivery."""

import logging
import asyncio
from typing import Any

from app.models.alert import Alert
from app.core.channels import SMSChannel, EmailChannel, WebhookChannel
from app.core.channels.base import NotificationChannel

logger = logging.getLogger(__name__)


class NotificationService:
    """Service for sending notifications via multiple channels."""

    def __init__(self):
        """Initialize notification service."""
        self.channels: dict[str, NotificationChannel] = {
            "sms": SMSChannel(),
            "email": EmailChannel(),
            "webhook": WebhookChannel(),
        }

    async def send_alert_notification(
        self,
        alert: Alert,
        recipients: dict[str, list[str]] | None = None,
    ) -> dict[str, bool]:
        """
        Send alert notification through configured channels.

        Args:
            alert: Alert to send
            recipients: Dict mapping channel names to recipient lists
                       e.g., {"email": ["user@example.com"], "sms": ["+1234567890"]}

        Returns:
            Dict mapping channel names to success status
        """
        if not recipients:
            logger.warning(f"No recipients configured for alert {alert.id}")
            return {}

        subject = f"Weather Alert: {alert.metric.upper()}"
        message = (
            f"Weather condition triggered: {alert.metric} "
            f"reached {alert.actual_value}°C "
            f"({alert.operator} {alert.threshold}°C threshold)"
        )

        alert_data = {
            "alert_id": str(alert.id),
            "location_id": str(alert.location_id),
            "rule_id": str(alert.rule_id),
            "metric": alert.metric,
            "value": alert.actual_value,
            "threshold": alert.threshold,
            "operator": alert.operator,
            "status": alert.status,
            "created_at": alert.created_at.isoformat() if alert.created_at else None,
        }

        results: dict[str, bool] = {}

        for channel_name, recipient_list in recipients.items():
            if channel_name not in self.channels:
                logger.warning(f"Unknown notification channel: {channel_name}")
                results[channel_name] = False
                continue

            if not recipient_list:
                logger.debug(f"No recipients for channel: {channel_name}")
                results[channel_name] = True
                continue

            channel = self.channels[channel_name]
            channel_results = await self._send_via_channel(
                channel,
                channel_name,
                recipient_list,
                subject,
                message,
                alert_data,
            )

            results[channel_name] = all(channel_results)

        return results

    async def _send_via_channel(
        self,
        channel: NotificationChannel,
        channel_name: str,
        recipients: list[str],
        subject: str,
        message: str,
        alert_data: dict[str, Any],
    ) -> list[bool]:
        """
        Send notification via a single channel to multiple recipients.

        Args:
            channel: Notification channel instance
            channel_name: Name of the channel
            recipients: List of recipients
            subject: Message subject
            message: Message body
            alert_data: Alert context

        Returns:
            List of success results per recipient
        """
        tasks = [
            channel.send(recipient, subject, message, alert_data)
            for recipient in recipients
        ]

        results = await asyncio.gather(*tasks, return_exceptions=False)

        successful = sum(1 for r in results if r)
        logger.info(
            f"Channel '{channel_name}': {successful}/{len(recipients)} "
            f"notifications sent"
        )

        return results

    def register_channel(
        self,
        name: str,
        channel: NotificationChannel,
    ) -> None:
        """
        Register a custom notification channel.

        Args:
            name: Channel name
            channel: Channel instance
        """
        self.channels[name] = channel
        logger.info(f"Registered notification channel: {name}")

    def get_available_channels(self) -> list[str]:
        """Get list of available notification channels."""
        return list(self.channels.keys())
