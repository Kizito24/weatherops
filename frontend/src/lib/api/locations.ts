import apiClient from './client';
import { Location } from '../../types';

interface LocationCreateRequest {
  name: string;
  latitude: number;
  longitude: number;
}

interface LocationUpdateRequest {
  name?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

/**
 * Convert backend response to frontend Location type
 */
const mapToLocation = (response: LocationResponse): Location => ({
  id: response.id,
  name: response.name,
  latitude: response.latitude,
  longitude: response.longitude,
  createdAt: response.created_at,
});

export const locationsApi = {
  /**
   * Get all locations for current user
   */
  list: async (): Promise<Location[]> => {
    const response = await apiClient.get<LocationResponse[]>('/locations');
    return response.data.map(mapToLocation);
  },

  /**
   * Get a single location by ID
   */
  get: async (id: string): Promise<Location> => {
    const response = await apiClient.get<LocationResponse>(`/locations/${id}`);
    return mapToLocation(response.data);
  },

  /**
   * Create a new location
   */
  create: async (name: string, latitude: number, longitude: number): Promise<Location> => {
    const request: LocationCreateRequest = {
      name: name.trim(),
      latitude,
      longitude,
    };
    const response = await apiClient.post<LocationResponse>('/locations', request);
    return mapToLocation(response.data);
  },

  /**
   * Update an existing location
   */
  update: async (id: string, name: string, latitude: number, longitude: number): Promise<Location> => {
    const request: LocationUpdateRequest = {
      name: name.trim(),
      latitude,
      longitude,
    };
    const response = await apiClient.put<LocationResponse>(`/locations/${id}`, request);
    return mapToLocation(response.data);
  },

  /**
   * Delete a location (cascades to rules and alerts)
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/locations/${id}`);
  },
};
