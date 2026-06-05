import { Alert, Rule, Location } from '../types';

export interface ExportOptions {
  dateRangeStart?: Date;
  dateRangeEnd?: Date;
  selectedColumns?: string[];
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportAlertsToCSV = (
  alerts: Alert[],
  locations: Map<string, string>,
  options?: ExportOptions
) => {
  const filtered = filterByDateRange(alerts, options);

  const headers = ['Location', 'Metric', 'Value', 'Threshold', 'Status', 'Severity', 'Created At', 'Resolved At'];
  const rows = filtered.map(alert => [
    locations.get(alert.locationId) || 'Unknown',
    alert.metric.replace('_', ' '),
    alert.value,
    alert.threshold,
    alert.status,
    alert.severity || 'medium',
    new Date(alert.timestamp).toISOString(),
    alert.resolved_at ? new Date(alert.resolved_at).toISOString() : 'N/A'
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const str = String(cell);
      return str.includes(',') ? `"${str}"` : str;
    }).join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `alerts-${timestamp}.csv`, 'text/csv');
};

export const exportAlertsToJSON = (
  alerts: Alert[],
  locations: Map<string, string>,
  options?: ExportOptions
) => {
  const filtered = filterByDateRange(alerts, options);

  const data = filtered.map(alert => ({
    id: alert.id,
    location: locations.get(alert.locationId) || 'Unknown',
    metric: alert.metric,
    value: alert.value,
    threshold: alert.threshold,
    status: alert.status,
    severity: alert.severity || 'medium',
    created_at: new Date(alert.timestamp).toISOString(),
    resolved_at: alert.resolved_at ? new Date(alert.resolved_at).toISOString() : null
  }));

  const json = JSON.stringify({
    exported_at: new Date().toISOString(),
    total_count: data.length,
    alerts: data
  }, null, 2);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `alerts-${timestamp}.json`, 'application/json');
};

export const exportRulesToCSV = (
  rules: Rule[],
  locations: Map<string, string>,
  options?: ExportOptions
) => {
  const headers = ['Location', 'Metric', 'Operator', 'Threshold', 'Status', 'Created At'];
  const rows = rules.map(rule => [
    locations.get(rule.locationId) || 'Unknown',
    rule.metric.replace('_', ' '),
    rule.operator,
    rule.threshold,
    rule.isActive ? 'Active' : 'Inactive',
    new Date(rule.createdAt || new Date()).toISOString()
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const str = String(cell);
      return str.includes(',') ? `"${str}"` : str;
    }).join(','))
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(csv, `rules-${timestamp}.csv`, 'text/csv');
};

export const exportRulesToJSON = (
  rules: Rule[],
  locations: Map<string, string>,
  options?: ExportOptions
) => {
  const data = rules.map(rule => ({
    id: rule.id,
    location: locations.get(rule.locationId) || 'Unknown',
    metric: rule.metric,
    operator: rule.operator,
    threshold: rule.threshold,
    is_active: rule.isActive,
    created_at: new Date(rule.createdAt || new Date()).toISOString()
  }));

  const json = JSON.stringify({
    exported_at: new Date().toISOString(),
    total_count: data.length,
    rules: data
  }, null, 2);

  const timestamp = new Date().toISOString().split('T')[0];
  downloadFile(json, `rules-${timestamp}.json`, 'application/json');
};

const filterByDateRange = (alerts: Alert[], options?: ExportOptions): Alert[] => {
  if (!options?.dateRangeStart && !options?.dateRangeEnd) {
    return alerts;
  }

  return alerts.filter(alert => {
    const alertDate = new Date(alert.timestamp);
    if (options.dateRangeStart && alertDate < options.dateRangeStart) {
      return false;
    }
    if (options.dateRangeEnd && alertDate > options.dateRangeEnd) {
      return false;
    }
    return true;
  });
};
