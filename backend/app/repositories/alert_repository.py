"""Alert data access repository."""

import uuid
import logging
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.models.alert import Alert

logger = logging.getLogger(__name__)


class AlertRepository:
    """Repository for alert data access."""

    def __init__(self, db: AsyncSession):
        """Initialize repository."""
        self.db = db

    async def create(
        self,
        location_id: uuid.UUID,
        rule_id: uuid.UUID,
        metric: str,
        actual_value: float,
        threshold: float,
        operator: str,
        weather_snapshot: str | None = None,
    ) -> Alert:
        """Create a new alert."""
        alert = Alert(
            location_id=location_id,
            rule_id=rule_id,
            metric=metric,
            actual_value=actual_value,
            threshold=threshold,
            operator=operator,
            weather_snapshot=weather_snapshot,
        )
        self.db.add(alert)
        await self.db.commit()
        await self.db.refresh(alert)
        logger.info(f"Alert created: {alert.id}")
        return alert

    async def get_by_id(self, alert_id: uuid.UUID) -> Alert | None:
        """Get alert by ID."""
        query = select(Alert).where(Alert.id == alert_id)
        result = await self.db.execute(query)
        return result.scalars().first()

    async def get_active_by_location(
        self,
        location_id: uuid.UUID,
    ) -> list[Alert]:
        """Get active alerts for a location."""
        query = select(Alert).where(
            and_(
                Alert.location_id == location_id,
                Alert.status == "active",
            )
        ).order_by(Alert.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def get_recent_alert(
        self,
        location_id: uuid.UUID,
        rule_id: uuid.UUID,
        metric: str,
        actual_value: float,
        minutes: int = 5,
    ) -> Alert | None:
        """
        Get recent alert for same condition to prevent duplicates.

        Args:
            location_id: Location ID
            rule_id: Rule ID
            metric: Metric name
            actual_value: Current value
            minutes: Time window in minutes

        Returns:
            Recent alert if found, None otherwise
        """
        cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=minutes)

        query = select(Alert).where(
            and_(
                Alert.location_id == location_id,
                Alert.rule_id == rule_id,
                Alert.metric == metric,
                Alert.status == "active",
                Alert.created_at >= cutoff_time,
            )
        ).order_by(Alert.created_at.desc()).limit(1)

        result = await self.db.execute(query)
        return result.scalars().first()

    async def resolve_alert(
        self,
        alert_id: uuid.UUID,
    ) -> Alert | None:
        """Resolve an alert."""
        alert = await self.get_by_id(alert_id)
        if alert:
            alert.status = "resolved"
            alert.resolved_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(alert)
            logger.info(f"Alert resolved: {alert_id}")
        return alert

    async def get_active_alerts(self) -> list[Alert]:
        """Get all active alerts."""
        query = select(Alert).where(
            Alert.status == "active"
        ).order_by(Alert.created_at.desc())
        result = await self.db.execute(query)
        return result.scalars().all()

    async def count_active_for_location(
        self,
        location_id: uuid.UUID,
    ) -> int:
        """Count active alerts for a location."""
        query = select(func.count(Alert.id)).where(
            and_(
                Alert.location_id == location_id,
                Alert.status == "active",
            )
        )
        result = await self.db.execute(query)
        return result.scalar() or 0
