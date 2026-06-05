import React, { useState, useEffect } from 'react';
import {
  Cloud,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  Eye,
  Gauge,
  Zap,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Location, WeatherData, WeatherUsage } from '../types';
import { weatherApi } from '../lib/api/weather';
import { WidgetSkeleton } from './Skeletons';

interface WeatherPageProps {
  locations: Location[];
  onNavigateToPage?: (page: string) => void;
}

const getWeatherIcon = (condition?: string) => {
  if (!condition) return <Cloud className="w-8 h-8" />;
  const c = condition.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-8 h-8" />;
  if (c.includes('sun') || c.includes('clear') || c.includes('sunny')) return <Sun className="w-8 h-8" />;
  if (c.includes('cloud')) return <Cloud className="w-8 h-8" />;
  if (c.includes('wind')) return <Wind className="w-8 h-8" />;
  return <Cloud className="w-8 h-8" />;
};

export default function WeatherPage({ locations, onNavigateToPage }: WeatherPageProps) {
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || '');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [usage, setUsage] = useState<WeatherUsage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAISummary, setShowAISummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation = locations.find(l => l.id === selectedLocId);

  useEffect(() => {
    if (!selectedLocId && locations.length > 0) {
      setSelectedLocId(locations[0].id);
    }
  }, [locations, selectedLocId]);

  const loadWeatherData = async () => {
    if (!selectedLocation) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await weatherApi.get(
        selectedLocation.latitude,
        selectedLocation.longitude,
        7,
        true,
        'metric',
        'en'
      );
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather:', err);
      setError('Failed to load weather data. Please try again.');
    }

    try {
      const usageData = await weatherApi.getUsage();
      setUsage(usageData);
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadWeatherData();
  }, [selectedLocId, selectedLocation]);

  if (!selectedLocation) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Weather Dashboard</h1>
          <p className="text-gray-400">No locations available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Weather Dashboard</h1>

          {/* Location Selector */}
          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-400">Select Location:</label>
            <select
              value={selectedLocId}
              onChange={e => setSelectedLocId(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
            >
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)})
                </option>
              ))}
            </select>
            <button
              onClick={loadWeatherData}
              disabled={isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Usage Info */}
          {usage && (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-400">Plan: <span className="text-white font-medium">{usage.plan}</span></p>
                  <p className="text-gray-400 mt-1">Requests: <span className="text-white font-medium">{usage.requests_remaining} / {usage.requests_limit} remaining</span></p>
                </div>
                <div>
                  <p className="text-gray-400">AI Requests: <span className="text-white font-medium">{usage.ai_requests_remaining} / {usage.ai_requests_used + usage.ai_requests_remaining} remaining</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {isLoading ? (
          <WidgetSkeleton />
        ) : weatherData && weatherData.current ? (
          <>
            {/* Current Conditions Hero */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-8 mb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-5xl font-bold mb-2">
                    {weatherData.current.temperature}°C
                  </h2>
                  <p className="text-lg text-gray-300 capitalize">
                    {weatherData.current.condition || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {selectedLocation.name}
                  </p>
                </div>
                <div className="text-indigo-400">
                  {getWeatherIcon(weatherData.current.condition)}
                </div>
              </div>

              {/* Current Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-gray-400">Humidity</span>
                  </div>
                  <p className="text-2xl font-bold">{weatherData.current.humidity}%</p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-gray-400">Wind</span>
                  </div>
                  <p className="text-2xl font-bold">{weatherData.current.wind_speed} km/h</p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400">Rainfall</span>
                  </div>
                  <p className="text-2xl font-bold">{weatherData.current.rainfall || 0} mm</p>
                </div>

                <div className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Gauge className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-gray-400">Pressure</span>
                  </div>
                  <p className="text-2xl font-bold">{weatherData.current.pressure || '-'} mb</p>
                </div>
              </div>

              {/* Additional Metrics */}
              {(weatherData.current.visibility || weatherData.current.uv_index) && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {weatherData.current.visibility && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Eye className="w-4 h-4 text-green-400" />
                        <span className="text-xs text-gray-400">Visibility</span>
                      </div>
                      <p className="text-2xl font-bold">{weatherData.current.visibility} km</p>
                    </div>
                  )}
                  {weatherData.current.uv_index !== undefined && (
                    <div className="bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-gray-400">UV Index</span>
                      </div>
                      <p className="text-2xl font-bold">{weatherData.current.uv_index}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Summary */}
            {weatherData.ai_summary && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                <button
                  onClick={() => setShowAISummary(!showAISummary)}
                  className="flex items-center gap-2 w-full text-left font-semibold text-lg mb-4 hover:text-indigo-400 transition"
                >
                  <Zap className="w-5 h-5 text-yellow-400" />
                  AI Weather Summary
                  <ChevronDown className={`w-5 h-5 ml-auto transition ${showAISummary ? 'rotate-180' : ''}`} />
                </button>
                {showAISummary && (
                  <p className="text-gray-300 leading-relaxed">{weatherData.ai_summary}</p>
                )}
              </div>
            )}

            {/* 7-Day Forecast */}
            {weatherData.daily && weatherData.daily.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">7-Day Forecast</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weatherData.daily.slice(0, 7).map((day, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-indigo-500 transition"
                    >
                      <p className="text-sm text-gray-400 font-medium mb-2">
                        {day.date ? new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }) : `Day ${idx + 1}`}
                      </p>
                      <div className="flex justify-center mb-2 text-indigo-400">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <p className="text-xs text-gray-400 mb-3 capitalize">
                        {day.condition || 'Unknown'}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">
                          {day.temperature_max}°C
                        </p>
                        <p className="text-xs text-gray-400">
                          {day.temperature_min}°C
                        </p>
                        {day.rainfall_sum && (
                          <p className="text-xs text-blue-400 mt-2">
                            {day.rainfall_sum}mm
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hourly Forecast */}
            {weatherData.hourly && weatherData.hourly.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Hourly Forecast (Next 24 Hours)</h3>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 overflow-x-auto">
                  <div className="flex gap-3 min-w-max">
                    {weatherData.hourly.slice(0, 24).map((hour, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 bg-gray-700/50 rounded-lg p-3 text-center min-w-max"
                      >
                        <p className="text-xs text-gray-400 mb-2">
                          {hour.time ? new Date(hour.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : `H${idx}`}
                        </p>
                        <div className="flex justify-center mb-2 text-indigo-300">
                          {getWeatherIcon(hour.condition)}
                        </div>
                        <p className="text-sm font-semibold">{hour.temperature}°C</p>
                        <p className="text-xs text-blue-400">{hour.humidity}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Cloud className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No weather data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
