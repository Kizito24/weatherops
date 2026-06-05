import { Location, Rule, Alert, UserProfile } from '../../types';

const STORAGE_KEYS = {
  LOCATIONS: 'weatherops_locations',
  RULES: 'weatherops_rules',
  ALERTS: 'weatherops_alerts',
  USER: 'weatherops_user',
  TOKEN: 'weatherops_token',
};

// Seed Data
const DEFAULT_LOCATIONS: Location[] = [
  { id: 'loc-1', name: 'Lagos, Nigeria', latitude: 6.5244, longitude: 3.3792, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'loc-2', name: 'Nairobi, Kenya', latitude: -1.2921, longitude: 36.8219, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'loc-3', name: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'loc-4', name: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'loc-5', name: 'New York, USA', latitude: 40.7128, longitude: -74.0060, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const DEFAULT_RULES: Rule[] = [
  { id: 'rule-1', locationId: 'loc-1', metric: 'temperature', operator: '>', threshold: 38, isActive: true, createdAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rule-2', locationId: 'loc-2', metric: 'rainfall', operator: '>', threshold: 30, isActive: true, createdAt: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rule-3', locationId: 'loc-3', metric: 'rainfall', operator: '>', threshold: 25, isActive: true, createdAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rule-4', locationId: 'loc-4', metric: 'wind_speed', operator: '>', threshold: 20, isActive: true, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'rule-5', locationId: 'loc-5', metric: 'temperature', operator: '<', threshold: 0, isActive: true, createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() },
];

const DEFAULT_ALERTS: Alert[] = [
  {
    id: 'alert-1',
    locationId: 'loc-1',
    ruleId: 'rule-1',
    metric: 'temperature',
    value: 40.5,
    threshold: 38,
    operator: '>',
    severity: 'HIGH',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hrs ago
  },
  {
    id: 'alert-2',
    locationId: 'loc-2',
    ruleId: 'rule-2',
    metric: 'rainfall',
    value: 35.2,
    threshold: 30,
    operator: '>',
    severity: 'MEDIUM',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hrs ago
  },
  {
    id: 'alert-3',
    locationId: 'loc-3',
    ruleId: 'rule-3',
    metric: 'rainfall',
    value: 28.1,
    threshold: 25,
    operator: '>',
    severity: 'LOW',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hrs ago
  },
  {
    id: 'alert-4',
    locationId: 'loc-4',
    ruleId: 'rule-4',
    metric: 'wind_speed',
    value: 24.5,
    threshold: 20,
    operator: '>',
    severity: 'MEDIUM',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'alert-5',
    locationId: 'loc-5',
    ruleId: 'rule-5',
    metric: 'temperature',
    value: -2.3,
    threshold: 0,
    operator: '<',
    severity: 'HIGH',
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
  },
];

const DEFAULT_USER: UserProfile = {
  name: 'Alex Mercer',
  email: 'alex.mercer@weatherops.com',
  role: 'Operations Director',
  apiKey: 'wops_live_7f8a9b2c3d4e5f6a1b2c3d4e5f',
  notifications: {
    email: true,
    sms: false,
    system: true,
  },
};

export const initializeDB = () => {
  if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.RULES)) {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(DEFAULT_RULES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(DEFAULT_ALERTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  }
};

// Small utility to get with latency simulation
export const delay = (ms: number = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const getDBItem = <T>(key: string): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [] as unknown as T;
};

export const setDBItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export { STORAGE_KEYS };
