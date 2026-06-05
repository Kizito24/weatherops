import apiClient from './client';
import { Rule, WeatherMetric, RuleOperator } from '../../types';

interface RuleCreateRequest {
  location_id: string;
  metric: WeatherMetric;
  operator: RuleOperator;
  threshold: number;
}

interface RuleUpdateRequest {
  metric?: WeatherMetric;
  operator?: RuleOperator;
  threshold?: number;
  is_active?: boolean;
}

interface RuleResponse {
  id: string;
  location_id: string;
  metric: WeatherMetric;
  operator: RuleOperator;
  threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convert backend response to frontend Rule type
 */
const mapToRule = (response: RuleResponse): Rule => ({
  id: response.id,
  locationId: response.location_id,
  metric: response.metric,
  operator: response.operator,
  threshold: response.threshold,
  isActive: response.is_active,
  createdAt: response.created_at,
});

export const rulesApi = {
  /**
   * Get all rules for a location
   */
  list: async (locationId: string): Promise<Rule[]> => {
    const response = await apiClient.get<RuleResponse[]>(`/rules/location/${locationId}`);
    return response.data.map(mapToRule);
  },

  /**
   * Get a single rule
   */
  get: async (ruleId: string): Promise<Rule> => {
    const response = await apiClient.get<RuleResponse>(`/rules/${ruleId}`);
    return mapToRule(response.data);
  },

  /**
   * Create a new rule for a location
   */
  create: async (locationId: string, metric: WeatherMetric, operator: RuleOperator, threshold: number): Promise<Rule> => {
    const request: RuleCreateRequest = {
      location_id: locationId,
      metric,
      operator,
      threshold,
    };
    const response = await apiClient.post<RuleResponse>('/rules', request);
    return mapToRule(response.data);
  },

  /**
   * Update an existing rule
   */
  update: async (ruleId: string, metric?: WeatherMetric, operator?: RuleOperator, threshold?: number): Promise<Rule> => {
    const request: RuleUpdateRequest = {};
    if (metric) request.metric = metric;
    if (operator) request.operator = operator;
    if (threshold !== undefined) request.threshold = threshold;

    const response = await apiClient.put<RuleResponse>(`/rules/${ruleId}`, request);
    return mapToRule(response.data);
  },

  /**
   * Toggle rule active status
   */
  toggleActive: async (ruleId: string, isActive: boolean): Promise<Rule> => {
    const request: RuleUpdateRequest = { is_active: isActive };
    const response = await apiClient.put<RuleResponse>(`/rules/${ruleId}`, request);
    return mapToRule(response.data);
  },

  /**
   * Delete a rule (cascades to related alerts)
   */
  delete: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/rules/${ruleId}`);
  },
};
