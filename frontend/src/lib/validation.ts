/**
 * Form validation utilities with real-time validation support
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Location validation
export const validateLocationName = (name: string): string | null => {
  if (!name || !name.trim()) {
    return 'Location name is required';
  }
  if (name.trim().length < 2) {
    return 'Location name must be at least 2 characters';
  }
  if (name.trim().length > 100) {
    return 'Location name must not exceed 100 characters';
  }
  return null;
};

export const validateLatitude = (lat: number): string | null => {
  if (lat === undefined || lat === null) {
    return 'Latitude is required';
  }
  if (typeof lat !== 'number') {
    return 'Latitude must be a number';
  }
  if (lat < -90 || lat > 90) {
    return 'Latitude must be between -90 and 90';
  }
  return null;
};

export const validateLongitude = (lng: number): string | null => {
  if (lng === undefined || lng === null) {
    return 'Longitude is required';
  }
  if (typeof lng !== 'number') {
    return 'Longitude must be a number';
  }
  if (lng < -180 || lng > 180) {
    return 'Longitude must be between -180 and 180';
  }
  return null;
};

export const validateLocation = (name: string, lat: number, lng: number): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateLocationName(name);
  if (nameError) {
    errors.push({ field: 'name', message: nameError });
  }

  const latError = validateLatitude(lat);
  if (latError) {
    errors.push({ field: 'latitude', message: latError });
  }

  const lngError = validateLongitude(lng);
  if (lngError) {
    errors.push({ field: 'longitude', message: lngError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Rule validation
export const validateThreshold = (threshold: number | string): string | null => {
  if (threshold === undefined || threshold === null || threshold === '') {
    return 'Threshold value is required';
  }
  const num = typeof threshold === 'string' ? parseFloat(threshold) : threshold;
  if (isNaN(num)) {
    return 'Threshold must be a valid number';
  }
  if (num < -100 || num > 100) {
    return 'Threshold must be between -100 and 100';
  }
  return null;
};

export const validateMetric = (metric: string): string | null => {
  const validMetrics = ['temperature', 'rainfall', 'wind_speed', 'humidity'];
  if (!metric || !validMetrics.includes(metric)) {
    return 'Please select a valid metric';
  }
  return null;
};

export const validateOperator = (operator: string): string | null => {
  const validOperators = ['>', '<', '>=', '<=', '=='];
  if (!operator || !validOperators.includes(operator)) {
    return 'Please select a valid operator';
  }
  return null;
};

export const validateRule = (metric: string, operator: string, threshold: number | string): ValidationResult => {
  const errors: ValidationError[] = [];

  const metricError = validateMetric(metric);
  if (metricError) {
    errors.push({ field: 'metric', message: metricError });
  }

  const operatorError = validateOperator(operator);
  if (operatorError) {
    errors.push({ field: 'operator', message: operatorError });
  }

  const thresholdError = validateThreshold(threshold);
  if (thresholdError) {
    errors.push({ field: 'threshold', message: thresholdError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Phone validation (E.164 format)
export const validatePhoneNumber = (phone: string): string | null => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required';
  }
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Please enter a valid phone number (E.164 format: +1234567890)';
  }
  return null;
};

// Webhook URL validation
export const validateWebhookUrl = (url: string): string | null => {
  if (!url || !url.trim()) {
    return 'Webhook URL is required';
  }
  try {
    new URL(url);
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'Webhook URL must start with http:// or https://';
    }
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  return null;
};

// Get field error from validation result
export const getFieldError = (validationResult: ValidationResult, field: string): string | null => {
  const error = validationResult.errors.find((e) => e.field === field);
  return error ? error.message : null;
};

// Check if field has error
export const hasFieldError = (validationResult: ValidationResult, field: string): boolean => {
  return validationResult.errors.some((e) => e.field === field);
};
