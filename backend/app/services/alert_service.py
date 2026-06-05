"""Alert creation and management service."""

import json
import logging
import uuid
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.repositories.alert_repository import AlertRepository
from app.services.rule_engine import RuleEvaluationResult

logger = logging.getLogger(__name__)


class AlertService:
    """Service for alert operations."""

    DUPLICATE_WINDOW_MINUTES = 5

    def __init__(self, db: AsyncSession):
        """Initialize alert service."""
        self.db = db
        self.repo = AlertRepository(db)

    async def create_from_triggered_rule(
        self,
        location_id: uuid.UUID,
        result: RuleEvaluationResult,
        weather_snapshot: dict | None = None,
    ) -> Alert | None:
        """
        Create alert from triggered rule evaluation.

        Implements idempotency to prevent duplicate alerts for same condition.

        Args:
            location_id: Location UUID
            result: Rule evaluation result
            weather_snapshot: Full weather data snapshot

        Returns:
            Created alert or None if duplicate detected
        """
        rule = result.rule
        actual_value = result.actual_value

        if not result.triggered or actual_value is None:
            return None

        existing = await self.repo.get_recent_alert(
            location_id=location_id,
            rule_id=rule.id,
            metric=rule.metric,
            actual_value=actual_value,
            minutes=self.DUPLICATE_WINDOW_MINUTES,
        )

        if existing:
            logger.debug(
                f"Duplicate alert prevented for rule {rule.id}: "
                f"{rule.metric} {actual_value} (alert {existing.id} exists)"
            )
            return None

        weather_json = None
        if weather_snapshot:
            try:
                weather_json = json.dumps(weather_snapshot)[:2000]
            except Exception as e:
                logger.warning(f"Failed to serialize weather snapshot: {e}")

        alert = await self.repo.create(
            location_id=location_id,
            rule_id=rule.id,
            metric=rule.metric,
            actual_value=actual_value,
            threshold=rule.threshold,
            operator=rule.operator,
            weather_snapshot=weather_json,
        )

        logger.info(
            f"Alert created for rule {rule.id}: {rule.metric} "
            f"{actual_value} {rule.operator} {rule.threshold}"
        )

        return alert

    async def resolve_alert(self, alert_id: uuid.UUID) -> Alert | None:
        """
        Resolve an alert.

        Args:
            alert_id: Alert UUID

        Returns:
            Resolved alert
        """
        alert = await self.repo.resolve_alert(alert_id)
        if alert:
            logger.info(f"Alert resolved: {alert_id}")
        return alert

    async def get_active_alerts(self) -> list[Alert]:
        """
        Get all active alerts.

        Returns:
            List of active alerts
        """
        return await self.repo.get_active_alerts()

    async def get_location_alerts(self, location_id: uuid.UUID) -> list[Alert]:
        """
        Get all active alerts for a location.

        Args:
            location_id: Location UUID

        Returns:
            List of active alerts for location
        """
        return await self.repo.get_active_by_location(location_id)

    async def get_alert_count_for_location(
        self,
        location_id: uuid.UUID,
    ) -> int:
        """
        Get count of active alerts for a location.

        Args:
            location_id: Location UUID

        Returns:
            Count of active alerts
        """
        return await self.repo.count_active_for_location(location_id)
