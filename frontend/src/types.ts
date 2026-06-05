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

export interface Alert {
  id: string;
  locationId: string;
  ruleId: string;
  metric: WeatherMetric;
  value: number;
  threshold: number;
  operator: RuleOperator;
  severity: SeverityLevel;
  timestamp: string;
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
