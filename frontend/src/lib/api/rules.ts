import apiClient from './client';
import { Rule, WeatherMetric, RuleOperator } from '../../types';

interface RuleCreateRequest {
  name: string;
  metric: WeatherMetric;
  operator: RuleOperator;
  threshold: number;
}

interface RuleUpdateRequest {
  name?: string;
  metric?: WeatherMetric;
  operator?: RuleOperator;
  threshold?: number;
  active?: boolean;
}

interface RuleResponse {
  id: string;
  name: string;
  location_id: string;
  metric: WeatherMetric;
  operator: RuleOperator;
  threshold: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert backend response to frontend Rule type
 */
const mapToRule = (locationId: string, response: RuleResponse): Rule => ({
  id: response.id,
  locationId: locationId,
  metric: response.metric,
  operator: response.operator,
  threshold: response.threshold,
  isActive: response.active,
  createdAt: response.created_at,
});

export const rulesApi = {
  /**
   * Get all rules for a location
   */
  list: async (locationId: string): Promise<Rule[]> => {
    const response = await apiClient.get<RuleResponse[]>(`/locations/${locationId}/rules`);
    return response.data.map(r => mapToRule(locationId, r));
  },

  /**
   * Get a single rule
   */
  get: async (locationId: string, ruleId: string): Promise<Rule> => {
    const response = await apiClient.get<RuleResponse>(`/locations/${locationId}/rules/${ruleId}`);
    return mapToRule(locationId, response.data);
  },

  /**
   * Create a new rule for a location
   */
  create: async (locationId: string, name: string, metric: WeatherMetric, operator: RuleOperator, threshold: number): Promise<Rule> => {
    const request: RuleCreateRequest = {
      name,
      metric,
      operator,
      threshold,
    };
    const response = await apiClient.post<RuleResponse>(`/locations/${locationId}/rules`, request);
    return mapToRule(locationId, response.data);
  },

  /**
   * Update an existing rule
   */
  update: async (locationId: string, ruleId: string, name: string, metric: WeatherMetric, operator: RuleOperator, threshold: number): Promise<Rule> => {
    const request: RuleUpdateRequest = {
      name,
      metric,
      operator,
      threshold,
    };
    const response = await apiClient.put<RuleResponse>(`/locations/${locationId}/rules/${ruleId}`, request);
    return mapToRule(locationId, response.data);
  },

  /**
   * Toggle rule active status
   */
  toggleActive: async (locationId: string, ruleId: string, active: boolean): Promise<Rule> => {
    const request: RuleUpdateRequest = { active };
    const response = await apiClient.put<RuleResponse>(`/locations/${locationId}/rules/${ruleId}`, request);
    return mapToRule(locationId, response.data);
  },

  /**
   * Delete a rule (cascades to related alerts)
   */
  delete: async (locationId: string, ruleId: string): Promise<void> => {
    await apiClient.delete(`/locations/${locationId}/rules/${ruleId}`);
  },
};
