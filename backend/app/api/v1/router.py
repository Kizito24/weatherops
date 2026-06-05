"""API v1 router that aggregates all endpoints."""

from fastapi import APIRouter

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.locations import router as locations_router
from app.api.v1.endpoints.rules import router as rules_router
from app.api.v1.endpoints.alerts import router as alerts_router
from app.api.v1.endpoints.preferences import router as preferences_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(locations_router)
api_v1_router.include_router(rules_router)
api_v1_router.include_router(alerts_router)
api_v1_router.include_router(preferences_router)
