import { apiClient } from './client';
import { TreeAnalysis, TreeUsage } from '../../types';

export const treesApi = {
  async analyze(formData: FormData): Promise<TreeAnalysis> {
    const response = await apiClient.post('/trees/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async listAnalyses(limit: number = 20, cursor?: string): Promise<{
    analyses: TreeAnalysis[];
    next_cursor?: string;
    has_more: boolean;
  }> {
    const params: any = { limit };
    if (cursor) {
      params.cursor = cursor;
    }
    const response = await apiClient.get('/trees/analyses', { params });
    return response.data;
  },

  async getUsage(): Promise<TreeUsage> {
    const response = await apiClient.get('/trees/usage');
    return response.data;
  },
};
