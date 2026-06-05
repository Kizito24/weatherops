"""SMS notification channel (mock implementation)."""

import logging
from app.core.channels.base import NotificationChannel

logger = logging.getLogger(__name__)


class SMSChannel(NotificationChannel):
    """SMS notification channel."""

    async def send(
        self,
        recipient: str,
        subject: str,
        message: str,
        alert_data: dict | None = None,
    ) -> bool:
        """
        Send SMS notification (mock).

        Args:
            recipient: Phone number
            subject: Message subject
            message: Message body
            alert_data: Alert context

        Returns:
            True
        """
        formatted_message = self._format_alert_message(subject, message, alert_data)

        logger.info(
            f"SMS Channel: Would send to {recipient}\n"
            f"Message: {formatted_message[:160]}"
        )

        return True
