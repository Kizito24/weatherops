"""Weather service for data fetching and caching."""

import logging
from typing import Any

from app.core.cache.cache_service import CacheService
from app.core.integrations.weather_ai_client import WeatherAIClient, WeatherAIError

logger = logging.getLogger(__name__)


class WeatherServiceError(Exception):
    """Raised when weather service operation fails."""

    pass


class WeatherService:
    """Service for weather data operations."""

    # Cache TTLs (in seconds)
    CURRENT_WEATHER_TTL = 10 * 60  # 10 minutes
    FORECAST_TTL = 60 * 60  # 60 minutes

    def __init__(self):
        """Initialize service."""
        self.cache = CacheService()
        self.weather_client = WeatherAIClient()

    async def get_current_weather(
        self,
        latitude: float,
        longitude: float,
    ) -> dict[str, Any]:
        """
        Get current weather with caching.

        Args:
            latitude: Latitude coordinate.
            longitude: Longitude coordinate.

        Returns:
            Current weather data.

        Raises:
            WeatherServiceError: If fetch fails.
        """
        cache_key = CacheService.make_weather_key(latitude, longitude, "current")

        cached = await self.cache.get(cache_key)
        if cached:
            logger.debug(f"Weather cache hit: {cache_key}")
            return cached

        try:
            data = await self.weather_client.get_current_weather(latitude, longitude)
            await self.cache.set(cache_key, data, self.CURRENT_WEATHER_TTL)
            logger.info(f"Current weather fetched and cached: ({latitude}, {longitude})")
            return data
        except WeatherAIError as e:
            logger.error(f"Failed to fetch current weather: {e}")
            raise WeatherServiceError(f"Failed to fetch weather: {e}") from e

    async def get_forecast(
        self,
        latitude: float,
        longitude: float,
        days: int = 7,
    ) -> dict[str, Any]:
        """
        Get weather forecast with caching.

        Args:
            latitude: Latitude coordinate.
            longitude: Longitude coordinate.
            days: Number of days to forecast.

        Returns:
            Forecast data.

        Raises:
            WeatherServiceError: If fetch fails.
        """
        cache_key = CacheService.make_weather_key(latitude, longitude, f"forecast_{days}d")

        cached = await self.cache.get(cache_key)
        if cached:
            logger.debug(f"Forecast cache hit: {cache_key}")
            return cached

        try:
            data = await self.weather_client.get_forecast(latitude, longitude, days)
            await self.cache.set(cache_key, data, self.FORECAST_TTL)
            logger.info(f"Forecast fetched and cached: ({latitude}, {longitude}) - {days} days")
            return data
        except WeatherAIError as e:
            logger.error(f"Failed to fetch forecast: {e}")
            raise WeatherServiceError(f"Failed to fetch forecast: {e}") from e

    async def get_weather_summary(
        self,
        latitude: float,
        longitude: float,
    ) -> dict[str, Any]:
        """
        Get weather summary with caching.

        Args:
            latitude: Latitude coordinate.
            longitude: Longitude coordinate.

        Returns:
            Weather summary.

        Raises:
            WeatherServiceError: If fetch fails.
        """
        cache_key = CacheService.make_weather_key(latitude, longitude, "summary")

        cached = await self.cache.get(cache_key)
        if cached:
            logger.debug(f"Summary cache hit: {cache_key}")
            return cached

        try:
            data = await self.weather_client.get_weather_summary(latitude, longitude)
            await self.cache.set(cache_key, data, self.CURRENT_WEATHER_TTL)
            logger.info(f"Weather summary fetched and cached: ({latitude}, {longitude})")
            return data
        except WeatherAIError as e:
            logger.error(f"Failed to fetch weather summary: {e}")
            raise WeatherServiceError(f"Failed to fetch summary: {e}") from e

    def evaluate_rule(
        self,
        metric: str,
        operator: str,
        threshold: float,
        weather_data: dict[str, Any],
    ) -> bool:
        """
        Evaluate if weather data matches a rule condition.

        Args:
            metric: Metric name (temperature, rainfall, etc.).
            operator: Comparison operator.
            threshold: Threshold value.
            weather_data: Current weather data.

        Returns:
            True if rule condition is met.
        """
        current_value = weather_data.get(metric)

        if current_value is None:
            logger.warning(f"Metric '{metric}' not found in weather data")
            return False

        try:
            if operator == ">":
                return current_value > threshold
            elif operator == "<":
                return current_value < threshold
            elif operator == ">=":
                return current_value >= threshold
            elif operator == "<=":
                return current_value <= threshold
            elif operator == "==":
                return current_value == threshold
            else:
                logger.warning(f"Unknown operator: {operator}")
                return False
        except Exception as e:
            logger.error(f"Error evaluating rule: {e}")
            return False
