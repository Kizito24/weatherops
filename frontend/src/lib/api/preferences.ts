import apiClient from './client';

interface UserPreferences {
  email_alerts_enabled: boolean;
  email_digest_enabled: boolean;
  email_digest_frequency: 'daily' | 'weekly' | 'monthly';

  sms_alerts_enabled: boolean;
  sms_phone_number: string | null;

  webhook_enabled: boolean;
  webhook_url: string | null;

  alert_low_enabled: boolean;
  alert_medium_enabled: boolean;
  alert_high_enabled: boolean;

  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;

  temperature_high_threshold: number | null;
  temperature_medium_threshold: number | null;
  rainfall_high_threshold: number | null;
  rainfall_medium_threshold: number | null;
  wind_speed_high_threshold: number | null;
  wind_speed_medium_threshold: number | null;
}

interface TestNotificationResult {
  success: boolean;
  message: string;
}

export const preferencesApi = {
  /**
   * Get user preferences
   */
  get: async (): Promise<UserPreferences> => {
    const response = await apiClient.get<UserPreferences>('/preferences');
    return response.data;
  },

  /**
   * Update user preferences
   */
  update: async (updates: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await apiClient.put<UserPreferences>('/preferences', updates);
    return response.data;
  },

  /**
   * Test email notification
   */
  testEmail: async (): Promise<TestNotificationResult> => {
    try {
      const response = await apiClient.post<TestNotificationResult>('/preferences/test/email');
      return response.data;
    } catch (error) {
      console.error('Email test failed:', error);
      return { success: false, message: 'Failed to send test email' };
    }
  },

  /**
   * Test SMS notification
   */
  testSMS: async (): Promise<TestNotificationResult> => {
    try {
      const response = await apiClient.post<TestNotificationResult>('/preferences/test/sms');
      return response.data;
    } catch (error) {
      console.error('SMS test failed:', error);
      return { success: false, message: 'Failed to send test SMS' };
    }
  },

  /**
   * Test webhook notification
   */
  testWebhook: async (): Promise<TestNotificationResult> => {
    try {
      const response = await apiClient.post<TestNotificationResult>('/preferences/test/webhook');
      return response.data;
    } catch (error) {
      console.error('Webhook test failed:', error);
      return { success: false, message: 'Failed to send test webhook' };
    }
  },
};
