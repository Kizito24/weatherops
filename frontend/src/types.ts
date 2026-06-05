export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export type WeatherMetric = 'temperature' | 'rainfall' | 'wind_speed' | 'humidity';

export type RuleOperator = '>' | '<' | '>=' | '<=' | '==';

export interface Rule {
  id: string;
  locationId: string;
  metric: WeatherMetric;
  operator: RuleOperator;
  threshold: number;
  isActive: boolean;
  createdAt: string;
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type AlertStatus = 'active' | 'resolved';

export interface Alert {
  id: string;
  locationId: string;
  ruleId: string;
  metric: WeatherMetric;
  value: number;
  threshold: number;
  operator: RuleOperator;
  severity: SeverityLevel;
  status: AlertStatus;
  timestamp: string;
  resolvedAt?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  apiKey: string;
  notifications: {
    email: boolean;
    sms: boolean;
    system: boolean;
  };
}

export interface WeatherCurrent {
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  rainfall?: number;
  condition?: string;
  pressure?: number;
  visibility?: number;
  uv_index?: number;
  timestamp?: string;
}

export interface WeatherForecastDay {
  date?: string;
  temperature_max?: number;
  temperature_min?: number;
  rainfall_sum?: number;
  wind_speed_max?: number;
  condition?: string;
}

export interface WeatherHourlyEntry {
  time?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  rainfall?: number;
  condition?: string;
}

export interface WeatherData {
  current?: WeatherCurrent;
  daily?: WeatherForecastDay[];
  hourly?: WeatherHourlyEntry[];
  ai_summary?: string;
}

export interface WeatherUsage {
  plan: string;
  requests_used: number;
  requests_remaining: number;
  requests_limit: number;
  ai_requests_used: number;
  ai_requests_remaining: number;
  period_start: string;
  period_end: string;
}

export interface TreeHealth {
  healthy: number;
  needs_care: number;
  needs_replacement: number;
}

export interface TreeAnalysis {
  analysis_id: string;
  timestamp: string;
  farmer_id?: string;
  county?: string;
  location?: string;
  land_acres?: number;
  total_tree_count: number;
  tree_density_per_acre?: number;
  confidence_score: number;
  canopy_coverage_pct: number;
  tree_health: TreeHealth;
  low_confidence: boolean;
  tree_species_guess?: string;
  observations: string[];
  recommendations: string[];
  original_image_url: string;
  overlay_image_url: string;
}

export interface TreeUsage {
  plan: string;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  resets_at: string;
}
