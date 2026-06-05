import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  Trash2,
  X,
  AlertTriangle,
  MapPin,
  Clock,
  Sliders,
  Maximize2,
  CheckCircle,
  TrendingDown,
  Info
} from 'lucide-react';
import { Alert, Location, SeverityLevel } from '../types';
import Badge from './Badge';
import EmptyState from './EmptyState';
import { TableSkeleton } from './Skeletons';

interface AlertsPageProps {
  id?: string;
  alerts: Alert[];
  locations: Location[];
  onDeleteAlert: (id: string) => Promise<any>;
  onClearAllAlerts: () => Promise<any>;
  isLoading: boolean;
}

export default function AlertsPage({
  id = 'weatherops-alerts-view',
  alerts,
  locations,
  onDeleteAlert,
  onClearAllAlerts,
  isLoading,
}: AlertsPageProps) {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | SeverityLevel>('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  
  // Alert Detail Modal state
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Apply API or memory client-side filtering
  const filteredAlerts = alerts.filter(a => {
    const matchesSeverity = severityFilter === 'ALL' || a.severity.toUpperCase() === severityFilter.toUpperCase();
    const matchesLocation = locationFilter === 'ALL' || a.locationId === locationFilter;
    return matchesSeverity && matchesLocation;
  });

  const getMetricUnits = (metric: string) => {
    switch (metric.toLowerCase()) {
      case 'temperature': return '°C';
      case 'rainfall': return 'mm';
      case 'wind_speed': return 'm/s';
      case 'humidity': return '%';
      default: return '';
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to permanently delete all weather alert logs? This action is irreversible.')) {
      await onClearAllAlerts();
      setSelectedAlert(null);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid opening detail drawer
    await onDeleteAlert(id);
    if (selectedAlert?.id === id) {
      setSelectedAlert(null);
    }
  };
  return (
    <div id={id} className="space-y-5">
      {/* Filtering Header panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-3 rounded-lg shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity selector */}
          <div className="flex items-center gap-1.5 bg-[#F9FAFB] dark:bg-slate-850 px-2 py-1 border border-slate-150 dark:border-slate-750 rounded-md">
            <Filter className="h-3 w-3 text-slate-450 shrink-0" />
            <select
              id="alert-severity-filter"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="text-[11px] font-bold bg-transparent text-slate-700 dark:text-slate-205 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Severity: All</option>
              <option value="HIGH">Severity: High</option>
              <option value="MEDIUM">Severity: Medium</option>
              <option value="LOW">Severity: Low</option>
            </select>
          </div>

          {/* Location selector */}
          <div className="flex items-center gap-1.5 bg-[#F9FAFB] dark:bg-slate-850 px-2 py-1 border border-slate-150 dark:border-slate-750 rounded-md">
            <MapPin className="h-3 w-3 text-slate-450 shrink-0" />
            <select
              id="alert-location-filter"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="text-[11px] font-bold bg-transparent text-slate-700 dark:text-slate-205 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">Location: All</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {alerts.length > 0 && (
          <button
            id="clear-all-alerts-btn"
            onClick={handleClearAll}
            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/15 dark:hover:bg-red-950/30 border border-red-200/40 dark:border-red-900/30 rounded-md shadow-2xs hover:shadow-xs transition uppercase tracking-wider text-[10px]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Purge Alarms</span>
          </button>
        )}
      </div>

      {/* Main Alerts Table log area */}
      {isLoading ? (
        <TableSkeleton id="alerts-loading-skele" rows={6} />
      ) : filteredAlerts.length === 0 ? (
        <EmptyState
          id="no-alerts-match-state"
          iconName="Bell"
          title={severityFilter !== 'ALL' || locationFilter !== 'ALL' ? "No filtered results" : "Clean alert registry"}
          description={
            severityFilter !== 'ALL' || locationFilter !== 'ALL'
              ? "We couldn't locate any climate incident logs matching these filter limits."
              : "No extreme weather incidents have breached armed thresholds. This deployment is stable."
          }
          actionText={severityFilter !== 'ALL' || locationFilter !== 'ALL' ? "Reset Filters" : undefined}
          onAction={
            severityFilter !== 'ALL' || locationFilter !== 'ALL'
              ? () => {
                  setSeverityFilter('ALL');
                  setLocationFilter('ALL');
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-[#F9FAFB] dark:bg-slate-850/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-100 dark:border-slate-803">
                <tr>
                  <th className="px-5 py-3 font-semibold">Triggered Registry</th>
                  <th className="px-5 py-3 font-semibold">Metric Breached</th>
                  <th className="px-5 py-3 font-semibold text-right">Recorded Value</th>
                  <th className="px-5 py-3 font-semibold">Armed Boundary</th>
                  <th className="px-5 py-3">Severity</th>
                  <th className="px-5 py-3">Timestamp</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-805">
                {filteredAlerts.map((alert) => {
                  const loc = locations.find(l => l.id === alert.locationId);
                  const locationName = loc ? loc.name : 'Unknown Registry';
                  const metricLabel = alert.metric.replace('_', ' ');

                  return (
                    <tr
                      key={alert.id}
                      id={`alert-excursion-row-${alert.id}`}
                      onClick={() => setSelectedAlert(alert)}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-855/30 cursor-pointer transition-all font-sans"
                    >
                      <td className="px-5 py-3 font-bold text-slate-950 dark:text-slate-100">
                        {locationName}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-500 dark:text-slate-400 capitalize">
                        {metricLabel}
                      </td>
                      <td className="px-5 py-3 font-mono text-right font-bold text-slate-950 dark:text-white">
                        {alert.value}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">
                          {getMetricUnits(alert.metric)}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-500 dark:text-slate-450">
                        {alert.operator} {alert.threshold}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-0.5">
                          {getMetricUnits(alert.metric)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={alert.severity} className="text-[10px] scale-90 origin-left" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(alert.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            id={`inspect-alert-${alert.id}`}
                            onClick={() => setSelectedAlert(alert)}
                            className="p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-805 text-slate-400 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                            title="Inspect excursion details"
                          >
                            <Maximize2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            id={`clear-alert-${alert.id}`}
                            onClick={(e) => handleDeleteItem(e, alert.id)}
                            className="p-1 rounded-md hover:bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-805 transition cursor-pointer"
                            title="Acknowledge & delete"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-855 bg-slate-50/20 text-[10px] font-mono tracking-wider font-bold text-slate-450 uppercase flex justify-between">
            <span>Currently showing {filteredAlerts.length} alarm points.</span>
            <span className="hidden sm:inline">Click any row or Inspect button to view detail summaries.</span>
          </div>
        </div>
      )}

      {/* --- ALERT VISUAL DETAIL DRAWER / MODAL --- */}
      {selectedAlert && (
        <div id="alert-detail-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div id="alert-detail-modal" className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-100">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${selectedAlert.severity === 'HIGH' ? 'text-red-500' : selectedAlert.severity === 'MEDIUM' ? 'text-amber-500' : 'text-emerald-500'}`} />
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white tracking-tight">Weather Excursion Detail</h3>
              </div>
              <button
                id="close-alert-detail"
                onClick={() => setSelectedAlert(null)}
                className="p-1 px-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-805 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details Content representation */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/60 text-sm">
                <span className="text-slate-450 dark:text-slate-400 font-medium">Monitoring Station:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {locations.find(l => l.id === selectedAlert.locationId)?.name || 'Unknown Location'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/60 text-sm">
                <span className="text-slate-450 dark:text-slate-400 font-medium">Metric Breached:</span>
                <span className="font-semibold text-slate-850 dark:text-slate-100 capitalize">
                  {selectedAlert.metric.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-805 text-sm">
                <span className="text-slate-450 dark:text-slate-400 font-semibold text-indigo-700 dark:text-indigo-400">Extreme Recorded:</span>
                <span className="font-mono text-base font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  {selectedAlert.value} {getMetricUnits(selectedAlert.metric)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-805 text-sm">
                <span className="text-slate-450 dark:text-slate-400 font-medium">Armed Threshold Rule:</span>
                <span className="font-mono text-sm text-slate-700 dark:text-slate-300">
                  {selectedAlert.operator} {selectedAlert.threshold} {getMetricUnits(selectedAlert.metric)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-805 text-sm">
                <span className="text-slate-450 dark:text-slate-400 font-medium font-sans">Calculated Risk Node:</span>
                <Badge variant={selectedAlert.severity} />
              </div>

              <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-805 text-sm">
                <span className="text-slate-450 dark:text-slate-400 font-medium">Alarm Logged Date:</span>
                <span className="text-xs text-slate-700 dark:text-slate-350 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(selectedAlert.timestamp).toLocaleString()}
                </span>
              </div>

              {/* Informative summary explanation */}
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 flex gap-2 leading-relaxed">
                <Info className="h-4.5 w-4.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  This alert was compiled server-side by the WeatherOps rule automation trigger. Action recommended: Review operational protocols at the indicated position immediately.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  id="cancel-alert-detail-btn"
                  type="button"
                  onClick={() => setSelectedAlert(null)}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:text-slate-250 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-150 dark:border-slate-700 rounded-lg"
                >
                  Close
                </button>
                <button
                  id="acknowledge-alert-detail-btn"
                  type="button"
                  onClick={async () => {
                    await onDeleteAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  className="cursor-pointer px-4 py-2 text-xs font-semibold text-white bg-indigo-650 hover:bg-indigo-750 rounded-lg"
                >
                  Dismiss Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
