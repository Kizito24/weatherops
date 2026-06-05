"""WeatherAI API client for weather data integration."""

import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class WeatherAIError(Exception):
    """Base exception for WeatherAI API errors."""

    pass


class WeatherAIClient:
    """Async client for WeatherAI API integration."""

    def __init__(self, base_url: str | None = None, api_key: str | None = None):
        """
        Initialize WeatherAI client.

        Args:
            base_url: Base URL for WeatherAI API.
            api_key: API key for authentication.
        """
        settings = get_settings()
        self.base_url = base_url or settings.WEATHERAI_BASE_URL
        self.api_key = api_key or settings.WEATHERAI_API_KEY
        self.client: httpx.AsyncClient | None = None
        self.timeout = 10.0

    async def __aenter__(self):
        """Async context manager entry."""
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={"Authorization": f"Bearer {self.api_key}"},
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.client:
            await self.client.aclose()

    async def _request(
        self,
        method: str,
        endpoint: str,
        **kwargs,
    ) -> dict[str, Any]:
        """
        Make HTTP request to WeatherAI API.

        Args:
            method: HTTP method.
            endpoint: API endpoint.
            **kwargs: Additional request parameters.

        Returns:
            JSON response.

        Raises:
            WeatherAIError: If request fails.
        """
        if not self.client:
            self.client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers={"Authorization": f"Bearer {self.api_key}"},
            )

        try:
            response = await self.client.request(method, endpoint, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            logger.error(f"WeatherAI API error: {e}")
            raise WeatherAIError(f"WeatherAI API error: {e}") from e

    async def get_current_weather(
        self,
        latitude: float,
        longitude: float,
    ) -> dict[str, Any]:
        """
        Get current weather for coordinates.

        Args:
            latitude: Latitude coordinate.
            longitude: Longitude coordinate.

        Returns:
            Current weather data.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching current weather for ({latitude}, {longitude})")
        response = await self._request(
            "GET",
            "/v1/weather",
            params={"latitude": latitude, "longitude": longitude},
        )
        return self._normalize_current_weather(response)

    async def get_forecast(
        self,
        latitude: float,
        longitude: float,
        days: int = 7,
    ) -> dict[str, Any]:
        """
        Get weather forecast for coordinates.

        Args:
            latitude: Latitude coordinate.
            longitude: Longitude coordinate.
            days: Number of days to forecast.

        Returns:
            Forecast data.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(
            f"Fetching forecast for ({latitude}, {longitude}) - {days} days"
        )
        response = await self._request(
            "GET",
            "/v1/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "days": days,
            },
        )
        return self._normalize_forecast(response)

    async def get_weather_summary(
        self,
        latitude: float,
        longitude: float,
    ) -> dict[str, Any]:
        """
        Get weather summary for coordinates.

        Args:
            latitude: Latitude coordinate.
            longitude: Longitude coordinate.

        Returns:
            Weather summary data.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching weather summary for ({latitude}, {longitude})")
        response = await self._request(
            "GET",
            "/v1/weather-geo",
            params={"latitude": latitude, "longitude": longitude},
        )
        return self._normalize_summary(response)

    @staticmethod
    def _normalize_current_weather(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize current weather response.

        Args:
            response: Raw API response.

        Returns:
            Normalized weather data.
        """
        current = response.get("current", {})
        return {
            "temperature": current.get("temperature"),
            "humidity": current.get("humidity"),
            "wind_speed": current.get("wind_speed"),
            "rainfall": current.get("rainfall", 0),
            "condition": current.get("condition"),
            "timestamp": current.get("time"),
        }

    @staticmethod
    def _normalize_forecast(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize forecast response.

        Args:
            response: Raw API response.

        Returns:
            Normalized forecast data.
        """
        daily = response.get("daily", [])
        return {
            "forecast_days": [
                {
                    "date": day.get("date"),
                    "temperature_max": day.get("temperature_max"),
                    "temperature_min": day.get("temperature_min"),
                    "rainfall_sum": day.get("rainfall_sum", 0),
                    "wind_speed_max": day.get("wind_speed_max"),
                    "condition": day.get("condition"),
                }
                for day in daily
            ],
        }

    @staticmethod
    def _normalize_summary(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize summary response.

        Args:
            response: Raw API response.

        Returns:
            Normalized summary data.
        """
        return {
            "location_name": response.get("location_name"),
            "latitude": response.get("latitude"),
            "longitude": response.get("longitude"),
            "current": response.get("current", {}),
            "daily_summary": response.get("daily_summary", []),
        }
