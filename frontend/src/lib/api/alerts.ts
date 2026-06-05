import apiClient from './client';
import { Alert, WeatherMetric, RuleOperator } from '../../types';

interface AlertResponse {
  id: string;
  location_id: string;
  rule_id: string;
  user_id: string;
  metric: WeatherMetric;
  actual_value: number;
  threshold: number;
  operator: RuleOperator;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'active' | 'resolved';
  weather_snapshot: string | null;
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
  severity: response.severity,
  timestamp: response.created_at,
});

export const alertsApi = {
  /**
   * Get all alerts with optional filtering and pagination
   */
  list: async (filters?: {
    location_id?: string;
    status?: 'active' | 'resolved';
    severity?: 'LOW' | 'MEDIUM' | 'HIGH';
    limit?: number;
    offset?: number;
  }): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (filters?.location_id) {
      params.append('location_id', filters.location_id);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.severity) {
      params.append('severity', filters.severity);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
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
  getLocationAlerts: async (locationId: string, severity?: 'LOW' | 'MEDIUM' | 'HIGH'): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (severity) {
      params.append('severity', severity);
    }
    const response = await apiClient.get<AlertResponse[]>(`/alerts/location/${locationId}`, { params });
    return response.data.map(mapToAlert);
  },

  /**
   * Get critical alert count (HIGH severity)
   */
  getCriticalCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get<{ critical_count: number }>('/alerts/count/critical');
      return response.data.critical_count;
    } catch (error) {
      console.error('Failed to get critical alert count:', error);
      return 0;
    }
  },

  /**
   * Get alert counts by severity
   */
  getCountsBySeverity: async (): Promise<{ low: number; medium: number; high: number }> => {
    try {
      const response = await apiClient.get<{ by_severity: { low: number; medium: number; high: number } }>('/alerts/count/by-severity');
      return response.data.by_severity;
    } catch (error) {
      console.error('Failed to get severity counts:', error);
      return { low: 0, medium: 0, high: 0 };
    }
  },
};
