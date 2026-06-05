"""WeatherAI API client for weather data integration.

Integrates with https://weather-ai.co API endpoints.
"""

import logging
from typing import Any

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class WeatherAIError(Exception):
    """Base exception for WeatherAI API errors."""

    pass


class WeatherAIClient:
    """Async client for WeatherAI API integration.

    Uses real endpoints from weather-ai.co/docs:
    - GET /current - Current weather conditions
    - GET /forecast - Weather forecast
    - GET /alerts - Active weather alerts
    - GET /historical - Historical weather data
    """

    def __init__(self, base_url: str | None = None, api_key: str | None = None):
        """
        Initialize WeatherAI client.

        Args:
            base_url: Base URL for WeatherAI API (defaults to https://api.weather-ai.co)
            api_key: API key for authentication.
        """
        settings = get_settings()
        self.base_url = base_url or settings.WEATHERAI_BASE_URL or "https://api.weather-ai.co"
        self.api_key = api_key or settings.WEATHERAI_API_KEY
        self.client: httpx.AsyncClient | None = None
        self.timeout = 10.0

    async def __aenter__(self):
        """Async context manager entry."""
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
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
            method: HTTP method (GET, POST, etc.).
            endpoint: API endpoint path.
            **kwargs: Additional request parameters (params, json, etc.).

        Returns:
            JSON response from API.

        Raises:
            WeatherAIError: If request fails or API returns error.
        """
        if not self.client:
            self.client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
            )

        try:
            logger.debug(f"WeatherAI API request: {method} {endpoint}")
            response = await self.client.request(method, endpoint, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            error_msg = f"WeatherAI API error {e.response.status_code}: {e.response.text}"
            logger.error(error_msg)
            raise WeatherAIError(error_msg) from e
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

        Endpoint: GET /current
        Documentation: https://weather-ai.co/docs#/weather/get_current

        Args:
            latitude: Latitude coordinate (-90 to 90).
            longitude: Longitude coordinate (-180 to 180).

        Returns:
            Current weather data with temperature, humidity, wind_speed, rainfall, etc.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching current weather for ({latitude}, {longitude})")
        response = await self._request(
            "GET",
            "/current",
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

        Endpoint: GET /forecast
        Documentation: https://weather-ai.co/docs#/weather/get_forecast

        Args:
            latitude: Latitude coordinate (-90 to 90).
            longitude: Longitude coordinate (-180 to 180).
            days: Number of days to forecast (1-30, default 7).

        Returns:
            Forecast data with daily breakdown.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching forecast for ({latitude}, {longitude}) - {days} days")
        response = await self._request(
            "GET",
            "/forecast",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "days": max(1, min(days, 30)),  # Clamp to valid range
            },
        )
        return self._normalize_forecast(response)

    async def get_weather_summary(
        self,
        latitude: float,
        longitude: float,
    ) -> dict[str, Any]:
        """
        Get detailed weather summary for coordinates.

        Endpoint: GET /weather (with all details)
        Documentation: https://weather-ai.co/docs#/weather/get_weather

        Args:
            latitude: Latitude coordinate (-90 to 90).
            longitude: Longitude coordinate (-180 to 180).

        Returns:
            Comprehensive weather summary including current, hourly, and daily data.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching weather summary for ({latitude}, {longitude})")
        response = await self._request(
            "GET",
            "/current",  # Using /current for summary, can also try /weather
            params={"latitude": latitude, "longitude": longitude},
        )
        return self._normalize_summary(response)

    async def get_alerts(
        self,
        latitude: float,
        longitude: float,
    ) -> list[dict[str, Any]]:
        """
        Get active weather alerts for coordinates.

        Endpoint: GET /alerts
        Documentation: https://weather-ai.co/docs#/weather/get_alerts

        Args:
            latitude: Latitude coordinate (-90 to 90).
            longitude: Longitude coordinate (-180 to 180).

        Returns:
            List of active weather alerts.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching weather alerts for ({latitude}, {longitude})")
        response = await self._request(
            "GET",
            "/alerts",
            params={"latitude": latitude, "longitude": longitude},
        )
        # Response should be a list or dict with alerts key
        if isinstance(response, list):
            return response
        return response.get("alerts", [])

    async def get_historical(
        self,
        latitude: float,
        longitude: float,
        date: str,
    ) -> dict[str, Any]:
        """
        Get historical weather data for a specific date.

        Endpoint: GET /historical
        Documentation: https://weather-ai.co/docs#/weather/get_historical

        Args:
            latitude: Latitude coordinate (-90 to 90).
            longitude: Longitude coordinate (-180 to 180).
            date: Date in YYYY-MM-DD format.

        Returns:
            Historical weather data for the date.

        Raises:
            WeatherAIError: If request fails.
        """
        logger.info(f"Fetching historical weather for ({latitude}, {longitude}) on {date}")
        response = await self._request(
            "GET",
            "/historical",
            params={
                "latitude": latitude,
                "longitude": longitude,
                "date": date,
            },
        )
        return self._normalize_historical(response)

    @staticmethod
    def _normalize_current_weather(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize current weather response from WeatherAI API.

        Args:
            response: Raw API response.

        Returns:
            Standardized weather data dict.
        """
        # Handle different response structures
        current = response.get("current") or response

        return {
            "temperature": current.get("temperature"),
            "humidity": current.get("humidity"),
            "wind_speed": current.get("wind_speed") or current.get("wind"),
            "rainfall": current.get("rainfall") or current.get("precipitation", 0),
            "condition": current.get("condition") or current.get("weather_code"),
            "timestamp": current.get("time") or current.get("timestamp"),
            "pressure": current.get("pressure"),
            "visibility": current.get("visibility"),
            "uv_index": current.get("uv_index"),
        }

    @staticmethod
    def _normalize_forecast(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize forecast response from WeatherAI API.

        Args:
            response: Raw API response.

        Returns:
            Standardized forecast data dict.
        """
        # Handle different response structures
        daily = response.get("daily") or response.get("forecast_days", [])

        return {
            "forecast_days": [
                {
                    "date": day.get("date"),
                    "temperature_max": day.get("temperature_max") or day.get("temp_max"),
                    "temperature_min": day.get("temperature_min") or day.get("temp_min"),
                    "rainfall_sum": day.get("rainfall_sum") or day.get("precipitation", 0),
                    "wind_speed_max": day.get("wind_speed_max") or day.get("wind_max"),
                    "condition": day.get("condition") or day.get("weather_code"),
                }
                for day in (daily if isinstance(daily, list) else [])
            ],
        }

    @staticmethod
    def _normalize_summary(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize weather summary response from WeatherAI API.

        Args:
            response: Raw API response.

        Returns:
            Standardized summary data dict.
        """
        current = response.get("current") or response

        return {
            "location_name": response.get("location_name") or response.get("name"),
            "latitude": response.get("latitude"),
            "longitude": response.get("longitude"),
            "current": {
                "temperature": current.get("temperature"),
                "humidity": current.get("humidity"),
                "wind_speed": current.get("wind_speed"),
                "rainfall": current.get("rainfall", 0),
                "condition": current.get("condition"),
                "timestamp": current.get("time"),
            },
            "daily_summary": response.get("daily_summary", []),
        }

    @staticmethod
    def _normalize_historical(response: dict[str, Any]) -> dict[str, Any]:
        """
        Normalize historical weather response from WeatherAI API.

        Args:
            response: Raw API response.

        Returns:
            Standardized historical data dict.
        """
        return {
            "date": response.get("date"),
            "temperature_max": response.get("temperature_max"),
            "temperature_min": response.get("temperature_min"),
            "temperature_avg": response.get("temperature_avg"),
            "rainfall": response.get("rainfall", 0),
            "wind_speed_avg": response.get("wind_speed_avg"),
            "condition": response.get("condition"),
        }
