import apiClient from './client';
import { Alert, WeatherMetric, RuleOperator } from '../../types';

interface AlertResponse {
  id: string;
  location_id: string;
  rule_id: string;
  metric: WeatherMetric;
  actual_value: number;
  threshold: number;
  operator: RuleOperator;
  status: 'active' | 'resolved';
  weather_snapshot: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

/**
 * Convert backend response to frontend Alert type
 */
const mapToAlert = (response: AlertResponse): Alert => ({
  id: response.id,
  locationId: response.location_id,
  ruleId: response.rule_id,
  metric: response.metric,
  value: response.actual_value,
  threshold: response.threshold,
  operator: response.operator,
  severity: determineSeverity(response.metric, response.actual_value, response.threshold, response.operator),
  timestamp: response.created_at,
});

/**
 * Determine severity based on metric and values
 */
const determineSeverity = (metric: WeatherMetric, actual: number, threshold: number, operator: RuleOperator): 'LOW' | 'MEDIUM' | 'HIGH' => {
  const margin = Math.abs(actual - threshold);

  if (metric === 'temperature') {
    if (margin > 8 || actual > 42 || actual < -5) return 'HIGH';
    if (margin > 3) return 'MEDIUM';
  } else if (metric === 'rainfall') {
    if (margin > 15 || actual > 45) return 'HIGH';
    if (margin > 5) return 'MEDIUM';
  } else if (metric === 'wind_speed') {
    if (margin > 12 || actual > 30) return 'HIGH';
    if (margin > 4) return 'MEDIUM';
  } else if (metric === 'humidity') {
    if (margin > 20) return 'HIGH';
    if (margin > 10) return 'MEDIUM';
  }

  return 'LOW';
};

export const alertsApi = {
  /**
   * Get all active alerts (with optional filtering)
   */
  list: async (filters?: { location_id?: string; status?: 'active' | 'resolved' }): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (filters?.location_id) {
      params.append('location_id', filters.location_id);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }

    const response = await apiClient.get<AlertResponse[]>('/alerts', { params });
    return response.data.map(mapToAlert);
  },

  /**
   * Get a single alert
   */
  get: async (id: string): Promise<Alert> => {
    const response = await apiClient.get<AlertResponse>(`/alerts/${id}`);
    return mapToAlert(response.data);
  },

  /**
   * Resolve an alert
   */
  resolve: async (id: string): Promise<Alert> => {
    const response = await apiClient.post<AlertResponse>(`/alerts/${id}/resolve`);
    return mapToAlert(response.data);
  },

  /**
   * Get alerts for a specific location
   */
  getLocationAlerts: async (locationId: string): Promise<Alert[]> => {
    const response = await apiClient.get<AlertResponse[]>(`/locations/${locationId}/alerts`);
    return response.data.map(mapToAlert);
  },

  /**
   * Get overview statistics
   */
  getOverviewStats: async (): Promise<{
    totalLocations: number;
    activeRules: number;
    triggeredAlerts24h: number;
    systemStatus: 'Degraded' | 'Healthy' | 'Critical' | 'Maintenance';
    systemUptime: string;
  }> => {
    try {
      const alerts = await alertsApi.list({ status: 'active' });

      // Count alerts in last 24 hours
      const now = Date.now();
      const triggerPeriod = 24 * 60 * 60 * 1000;
      const alert24h = alerts.filter(a => {
        const alertTime = new Date(a.timestamp).getTime();
        return (now - alertTime) < triggerPeriod;
      }).length;

      // Determine system status based on high severity alerts
      let status: 'Degraded' | 'Healthy' | 'Critical' | 'Maintenance' = 'Healthy';
      const highAlertsCount = alerts.filter(a => {
        const isHigh = a.severity === 'HIGH';
        const isRecent = (now - new Date(a.timestamp).getTime()) < 6 * 60 * 60 * 1000;
        return isHigh && isRecent;
      }).length;

      if (highAlertsCount > 2) {
        status = 'Critical';
      } else if (highAlertsCount > 0) {
        status = 'Degraded';
      }

      return {
        totalLocations: 0, // Would need separate API call
        activeRules: 0, // Would need separate API call
        triggeredAlerts24h: alert24h,
        systemStatus: status,
        systemUptime: '99.98%',
      };
    } catch (error) {
      // Return default stats on error
      return {
        totalLocations: 0,
        activeRules: 0,
        triggeredAlerts24h: 0,
        systemStatus: 'Healthy',
        systemUptime: '99.98%',
      };
    }
  },
};
