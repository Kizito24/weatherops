"""Alert model for weather-based alerts."""

import uuid
from datetime import datetime
from sqlalchemy import String, Float, ForeignKey, Index, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin, UUIDMixin


class Alert(Base, UUIDMixin, TimestampMixin):
    """Represents a weather alert triggered by a rule."""

    __tablename__ = "alerts"

    location_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("locations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rule_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("rules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    metric: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    actual_value: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    threshold: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )
    operator: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default="active",
        nullable=False,
        index=True,
    )
    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    weather_snapshot: Mapped[str] = mapped_column(
        String(2000),
        nullable=True,
    )

    __table_args__ = (
        Index("idx_alerts_location_id", "location_id"),
        Index("idx_alerts_rule_id", "rule_id"),
        Index("idx_alerts_status", "status"),
        Index("idx_alerts_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Alert(id={self.id}, metric={self.metric}, value={self.actual_value}, status={self.status})>"
