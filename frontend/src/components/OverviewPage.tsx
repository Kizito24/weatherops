import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  AlertTriangle,
  Server,
  RefreshCw,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Activity,
  ZapOff,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import { Location, Rule, Alert } from '../types';
import { alertsApi } from '../lib/api/alerts';
import KPICard from './KPICard';
import Badge from './Badge';
import { KPISkeleton, TableSkeleton, WidgetSkeleton } from './Skeletons';
import EmptyState from './EmptyState';

interface OverviewPageProps {
  id?: string;
  locations: Location[];
  rules: Rule[];
  alerts: Alert[];
  onNavigateToPage: (page: string) => void;
  onRefreshAll: () => Promise<void>;
  isLoading: boolean;
}

export default function OverviewPage({
  id = 'weatherops-overview-dashboard',
  locations,
  rules,
  alerts,
  onNavigateToPage,
  onRefreshAll,
  isLoading,
}: OverviewPageProps) {
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [stats, setStats] = useState<any>({
    totalLocations: 0,
    activeRules: 0,
    triggeredAlerts24h: 0,
    triggeredAlertsHour: 0,
    activeAlerts: 0,
    resolvedAlerts24h: 0,
    systemStatus: 'Healthy',
    systemUptime: '99.98%',
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Default selection when locations load
  useEffect(() => {
    if (locations.length > 0 && !selectedLocId) {
      setSelectedLocId(locations[0].id);
    }
  }, [locations, selectedLocId]);

  // Handle stat recalculation
  useEffect(() => {
    async function loadStats() {
      setIsStatsLoading(true);

      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const alertsIn24h = alerts.filter(a => new Date(a.timestamp) > oneDayAgo).length;
      const alertsInHour = alerts.filter(a => new Date(a.timestamp) > oneHourAgo).length;
      const activeAlerts = alerts.filter(a => a.status === 'active').length;
      const resolvedAlerts24h = alerts.filter(
        a => a.status === 'resolved' && new Date(a.timestamp) > oneDayAgo
      ).length;

      const activeRulesCount = rules.filter(r => r.isActive).length;

      const res = await alertsApi.getOverviewStats();
      setStats({
        totalLocations: locations.length,
        activeRules: activeRulesCount,
        triggeredAlerts24h: alertsIn24h,
        triggeredAlertsHour: alertsInHour,
        activeAlerts: activeAlerts,
        resolvedAlerts24h: resolvedAlerts24h,
        systemStatus: res?.systemStatus || 'Healthy',
        systemUptime: res?.systemUptime || '99.98%',
      });
      setIsStatsLoading(false);
    }
    loadStats();
  }, [locations, rules, alerts]);

  // Selected location details
  const selectedLocation = locations.find(l => l.id === selectedLocId) || locations[0];

  // Helper simulated weather generator for current weather snapshot card
  const getSimulatedWeather = (locName: string) => {
    // Generate deterministic pseudo-random weather based on location name string length
    const hash = locName ? locName.length : 10;
    const temp = parseFloat((20 + (hash % 15) + (Math.sin(Date.now() / 100000) * 3)).toFixed(1));
    const rain = parseFloat(((hash % 8) * 4 + (Math.cos(Date.now() / 150000) * 5)).toFixed(1));
    const normalizedRain = rain < 0 ? 0 : rain;
    const wind = parseFloat((10 + (hash % 12) + (Math.sin(Date.now() / 80000) * 4)).toFixed(1));
    const humidity = 40 + (hash % 45);

    return { temp, rainfall: normalizedRain, windSpeed: wind, humidity };
  };

  const getMetricIcon = (metric: string, sizeClass = "h-4 w-4") => {
    switch (metric.toLowerCase()) {
      case 'temperature':
        return <Thermometer className={`${sizeClass} text-rose-500`} />;
      case 'rainfall':
        return <CloudRain className={`${sizeClass} text-blue-500`} />;
      case 'wind_speed':
        return <Wind className={`${sizeClass} text-teal-400`} />;
      case 'humidity':
        return <Droplets className={`${sizeClass} text-indigo-400`} />;
      default:
        return <AlertTriangle className={sizeClass} />;
    }
  };

  const currentLocalWeather = selectedLocation ? getSimulatedWeather(selectedLocation.name) : null;

  // Retrieve matching active rules for this selected location to highlight if any are violated
  const activeRulesForLocation = rules.filter(r => r.locationId === selectedLocId && r.isActive);
  const findViolatingRules = () => {
    if (!currentLocalWeather) return [];
    
    return activeRulesForLocation.filter(rule => {
      let val = 0;
      if (rule.metric === 'temperature') val = currentLocalWeather.temp;
      else if (rule.metric === 'rainfall') val = currentLocalWeather.rainfall;
      else if (rule.metric === 'wind_speed') val = currentLocalWeather.windSpeed;
      else if (rule.metric === 'humidity') val = currentLocalWeather.humidity;

      switch (rule.operator) {
        case '>': return val > rule.threshold;
        case '<': return val < rule.threshold;
        case '>=': return val >= rule.threshold;
        case '<=': return val <= rule.threshold;
        case '==': return val === rule.threshold;
        default: return false;
      }
    });
  };

  const violations = findViolatingRules();

  return (
    <div id={id} className="space-y-5">
      {/* Overview Head Actions */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-lg shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-900 dark:text-slate-100" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            System Synchronized: <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">Active Stream</span>
          </span>
        </div>
        <button
          id="refresh-dashboard-btn"
          onClick={onRefreshAll}
          disabled={isLoading}
          className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-850 dark:text-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-755 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs hover:shadow-xs transition"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isStatsLoading ? (
          <>
            <KPISkeleton id="kpi-1-skele" />
            <KPISkeleton id="kpi-2-skele" />
            <KPISkeleton id="kpi-3-skele" />
            <KPISkeleton id="kpi-4-skele" />
          </>
        ) : (
          <>
            <KPICard
              id="kpi-locations"
              title="Total Locations"
              value={stats.totalLocations}
              iconName="MapPin"
              subtitle="Provisioned stations"
              trend={{ value: 'Active', isNeutral: true }}
            />
            <KPICard
              id="kpi-rules"
              title="Active Rules"
              value={stats.activeRules}
              iconName="Sliders"
              subtitle={`Monitoring ${rules.length} total rules`}
              trend={{ value: 'Armed', isNeutral: true }}
            />
            <KPICard
              id="kpi-alerts-active"
              title="Active Alerts"
              value={stats.activeAlerts}
              iconName="AlertTriangle"
              subtitle={`${stats.triggeredAlertsHour} in last hour`}
              trend={{
                value: stats.activeAlerts > 0 ? 'Requires attention' : 'All clear',
                isNeutral: stats.activeAlerts === 0,
                isPositive: stats.activeAlerts === 0,
              }}
            />
            <KPICard
              id="kpi-status"
              title="System Status"
              value={stats.systemStatus}
              iconName="Server"
              subtitle={`Uptime: ${stats.systemUptime}`}
              subtitleBadge={stats.systemStatus}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Alerts Log */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 border-b border-slate-150 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-950 dark:text-white tracking-tight">
                  Recent Triggered Alerts
                </h3>
              </div>
              <button
                id="view-all-alerts-btn"
                onClick={() => onNavigateToPage('alerts')}
                className="cursor-pointer text-xs font-bold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-3">
                  <TableSkeleton id="recent-alerts-table-skele" rows={4} />
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    id="no-recent-alerts-state"
                    iconName="CheckCircle"
                    title="No weather violations"
                    description="Climatic boundaries are nominal at all designated monitoring positions."
                  />
                </div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-[#F9FAFB] dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 font-mono tracking-wider text-[10px] uppercase sticky top-0 border-b border-slate-100 dark:border-slate-803">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Location</th>
                      <th className="px-5 py-3 font-semibold">Metric</th>
                      <th className="px-5 py-3 font-semibold text-right">Value</th>
                      <th className="px-5 py-3 font-semibold">Severity</th>
                      <th className="px-5 py-3 font-semibold text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {alerts.slice(0, 5).map((alert) => {
                      const loc = locations.find(l => l.id === alert.locationId);
                      return (
                        <tr
                          key={alert.id}
                          id={`recent-alert-row-${alert.id}`}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors"
                        >
                          <td className="px-5 py-3 font-bold text-slate-900 dark:text-slate-100">
                            {loc ? loc.name : 'Unknown Station'}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              {getMetricIcon(alert.metric, "h-3.5 w-3.5")}
                              <span className="capitalize text-slate-600 dark:text-slate-350">
                                {alert.metric?.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                            {alert.value}
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">
                              {alert.metric === 'temperature' ? '°C' : alert.metric === 'rainfall' ? 'mm' : alert.metric === 'wind_speed' ? 'm/s' : '%'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <Badge variant={alert.severity} className="text-[10px] scale-90 origin-left" />
                          </td>
                          <td className="px-5 py-3 text-right text-slate-450 dark:text-slate-450 font-normal font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          {alerts.length > 5 && (
            <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-850 bg-slate-50/30 dark:bg-slate-900 text-center">
              <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                Displaying 5 of {alerts.length} historical occurrences
              </span>
            </div>
          )}
        </div>

        {/* Weather Summary Widget */}
        <div className="space-y-4">
          <div className="bg-[#111827] text-white rounded-xl shadow-lg p-5 flex flex-col justify-between h-full min-h-[340px]">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider font-mono">
                    Primary Observer Node
                  </h3>
                  <p className="text-lg font-extrabold mt-0.5 font-sans">
                    {selectedLocation ? selectedLocation.name : 'No Stations'}
                  </p>
                </div>
                <div className="bg-white/10 p-1.5 rounded-lg text-amber-400">
                  {selectedLocation ? getMetricIcon('temperature', "h-5 w-5 !text-[#FBBF24]") : <Server className="h-5 w-5 text-slate-400" />}
                </div>
              </div>

              {/* Location selection dropdown */}
              <div className="mb-4">
                <label htmlFor="microclimate-loc-select" className="sr-only">
                  Select Location
                </label>
                <select
                  id="microclimate-loc-select"
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                  className="w-full text-xs font-semibold px-2.5 py-1.5 bg-white/10 hover:bg-white/15 border border-white/10 focus:border-white/30 focus:outline-hidden rounded-md text-white cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="text-slate-900 bg-white">
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLocation && currentLocalWeather && (
                <div id="weather-snapshot-card" className="space-y-4">
                  {/* Climate Status Indicator Block */}
                  <div
                    className={`p-2.5 rounded-lg border text-xs flex gap-2.5 ${
                      violations.length > 0
                        ? 'bg-rose-500/15 text-rose-200 border-rose-500/30'
                        : 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20'
                    }`}
                  >
                    <AlertTriangle className={`h-4.5 w-4.5 shrink-0 ${violations.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`} />
                    <div className="min-w-0">
                      <p className="font-bold leading-tight">
                        {violations.length > 0 ? 'Excursion Limit Violated' : 'Station Environment Complying'}
                      </p>
                    </div>
                  </div>

                  {/* Main Metric Temperature Spotlight */}
                  <div className="flex items-baseline justify-between py-2">
                    <span className="text-4xl font-light tracking-tighter text-white">
                      {currentLocalWeather.temp}°
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Metric Status</p>
                      <p className="text-xs font-bold text-white">
                        {violations.length > 0 ? 'BREACHED' : 'NOMINAL'}
                      </p>
                    </div>
                  </div>

                  {/* Environment Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-white/10">
                    {/* Temperature */}
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-mono tracking-wider">Humidity</p>
                      <p className="text-xs font-semibold text-white">{currentLocalWeather.humidity}%</p>
                    </div>

                    {/* Rainfall */}
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-mono tracking-wider">Rainfall</p>
                      <p className="text-xs font-semibold text-white">{currentLocalWeather.rainfall}mm</p>
                    </div>

                    {/* Wind Speed */}
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-mono tracking-wider">Wind Speed</p>
                      <p className="text-xs font-semibold text-white">{currentLocalWeather.windSpeed}m/s</p>
                    </div>

                    {/* Coordinate */}
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] uppercase font-mono tracking-wider">Latitude</p>
                      <p className="text-xs font-semibold text-white font-mono">{selectedLocation?.latitude}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick guide on metrics */}
            <div className="pt-2 text-[10px] text-[#9CA3AF] flex items-center justify-between border-t border-white/5 mt-4">
              <span>Telemetry: Continuous</span>
              <span className="font-mono text-[9px] bg-white/5 text-[#9CA3AF] px-1 py-0.5 rounded-sm">
                LNG: {selectedLocation?.longitude}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Alerts (24h)
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.triggeredAlerts24h}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {stats.resolvedAlerts24h} resolved
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-lg p-4 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Rules Coverage
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {locations.length > 0 ? Math.round((stats.activeRules / locations.length) * 100) : 0}%
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {stats.activeRules} of {locations.length} locations
              </p>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-lg">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 shadow-xs ${
          stats.activeAlerts === 0
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                System Health
              </p>
              <p className={`text-2xl font-bold ${
                stats.activeAlerts === 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {stats.activeAlerts === 0 ? 'Healthy' : 'Degraded'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {stats.activeAlerts} active issues
              </p>
            </div>
            <div className={`p-2.5 rounded-lg ${
              stats.activeAlerts === 0
                ? 'bg-green-100 dark:bg-green-900/40'
                : 'bg-amber-100 dark:bg-amber-900/40'
            }`}>
              {stats.activeAlerts === 0 ? (
                <CheckCircle className={`h-5 w-5 ${
                  stats.activeAlerts === 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`} />
              ) : (
                <AlertTriangle className={`h-5 w-5 ${
                  stats.activeAlerts === 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
