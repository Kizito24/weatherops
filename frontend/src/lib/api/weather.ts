import { apiClient } from './client';
import { WeatherData, WeatherUsage } from '../../types';

export const weatherApi = {
  async get(
    lat: number,
    lon: number,
    days: number = 7,
    ai: boolean = true,
    units: string = 'metric',
    lang: string = 'en'
  ): Promise<WeatherData> {
    const response = await apiClient.get('/weather', {
      params: { lat, lon, days, ai, units, lang },
    });
    return response.data;
  },

  async getCurrent(
    lat: number,
    lon: number,
    ai: boolean = false,
    units: string = 'metric'
  ): Promise<WeatherData> {
    const response = await apiClient.get('/weather/current', {
      params: { lat, lon, ai, units },
    });
    return response.data;
  },

  async getForecast(
    lat: number,
    lon: number,
    days: number = 7,
    ai: boolean = false,
    units: string = 'metric'
  ): Promise<WeatherData> {
    const response = await apiClient.get('/weather/forecast', {
      params: { lat, lon, days, ai, units },
    });
    return response.data;
  },

  async getHourly(
    lat: number,
    lon: number,
    days: number = 1,
    ai: boolean = false,
    units: string = 'metric'
  ): Promise<WeatherData> {
    const response = await apiClient.get('/weather/hourly', {
      params: { lat, lon, days, ai, units },
    });
    return response.data;
  },

  async getUsage(): Promise<WeatherUsage> {
    const response = await apiClient.get('/weather/usage');
    return response.data;
  },
};
