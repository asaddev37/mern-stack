import api from './api';
import { Insight, PaginatedResponse } from '../types';

export const insightService = {
  // Get insights
  async getInsights(params?: {
    type?: string;
    category?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Insight>> {
    const response = await api.get<PaginatedResponse<Insight>>('/insights', { params });
    return response.data;
  },

  // Get insights dashboard
  async getDashboard(period?: string): Promise<{
    period: string;
    moodTrend: {
      average: number;
      stats: any[];
      totalEntries: number;
    };
    recentInsights: Insight[];
    unreadCount: number;
    highPriorityInsights: Insight[];
    summary: {
      moodStatus: string;
      insightsGenerated: number;
      hasHighPriority: boolean;
    };
  }> {
    const response = await api.get('/insights/dashboard', {
      params: { period }
    });
    return response.data;
  },

  // Generate new insights
  async generateInsights(type: string, period?: string): Promise<Insight> {
    const response = await api.post<{ message: string; insight: Insight }>('/insights/generate', {
      type,
      period
    });
    return response.data.insight;
  },

  // Mark insight as read
  async markAsRead(id: string): Promise<Insight> {
    const response = await api.put<{ message: string; insight: Insight }>(`/insights/${id}/read`);
    return response.data.insight;
  },

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post<{ message: string; isFavorite: boolean }>(`/insights/${id}/favorite`);
    return { isFavorite: response.data.isFavorite };
  },

  // Get wellness tips
  async getWellnessTips(period?: string): Promise<{
    tips: string[];
    focus: string;
    encouragement: string;
    basedOn: {
      period: string;
      moodData: any[];
    };
    generatedAt: string;
  }> {
    const response = await api.get('/insights/wellness-tips', {
      params: { period }
    });
    return response.data;
  },

  // Analyze specific entry
  async analyzeEntry(entryId: string): Promise<{
    analysis: any;
    entry: {
      id: string;
      content: string;
      mood: string;
      createdAt: string;
    };
  }> {
    const response = await api.post<{ message: string; analysis: any; entry: any }>('/insights/analyze-entry', {
      entryId
    });
    return {
      analysis: response.data.analysis,
      entry: response.data.entry
    };
  },

  // Check AI service health
  async checkAIHealth(): Promise<{
    aiService: {
      isRunning: boolean;
      models?: string[];
      error?: string;
    };
    timestamp: string;
  }> {
    const response = await api.get('/insights/ai-health');
    return response.data;
  },
};
