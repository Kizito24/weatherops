"""Email notification channel (mock implementation)."""

import logging
from app.core.channels.base import NotificationChannel

logger = logging.getLogger(__name__)


class EmailChannel(NotificationChannel):
    """Email notification channel."""

    async def send(
        self,
        recipient: str,
        subject: str,
        message: str,
        alert_data: dict | None = None,
    ) -> bool:
        """
        Send email notification (mock).

        Args:
            recipient: Email address
            subject: Email subject
            message: Email body
            alert_data: Alert context

        Returns:
            True
        """
        formatted_message = self._format_alert_message(subject, message, alert_data)

        logger.info(
            f"Email Channel: Would send to {recipient}\n"
            f"Subject: {subject}\n"
            f"Body: {formatted_message}"
        )

        return True
