import api from './api';
import { JournalEntry, JournalFormData, PaginatedResponse, MoodStats } from '../types';

export const journalService = {
  // Get journal entries
  async getEntries(params?: {
    page?: number;
    limit?: number;
    mood?: string;
    startDate?: string;
    endDate?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<JournalEntry>> {
    const response = await api.get<PaginatedResponse<JournalEntry>>('/journals', { params });
    return response.data;
  },

  // Get specific journal entry
  async getEntry(id: string): Promise<JournalEntry> {
    const response = await api.get<{ entry: JournalEntry }>(`/journals/${id}`);
    return response.data.entry;
  },

  // Create journal entry
  async createEntry(entryData: JournalFormData): Promise<JournalEntry> {
    const response = await api.post<{ message: string; entry: JournalEntry }>('/journals', entryData);
    return response.data.entry;
  },

  // Update journal entry
  async updateEntry(id: string, entryData: Partial<JournalFormData>): Promise<JournalEntry> {
    const response = await api.put<{ message: string; entry: JournalEntry }>(`/journals/${id}`, entryData);
    return response.data.entry;
  },

  // Delete journal entry
  async deleteEntry(id: string): Promise<void> {
    await api.delete(`/journals/${id}`);
  },

  // Toggle favorite status
  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const response = await api.post<{ message: string; isFavorite: boolean }>(`/journals/${id}/favorite`);
    return { isFavorite: response.data.isFavorite };
  },

  // Get journal statistics
  async getStats(period?: string): Promise<{
    period: string;
    totalEntries: number;
    favoriteCount: number;
    moodStats: MoodStats[];
    writingStreaks: any[];
    averageWordCount: number;
  }> {
    const response = await api.get('/journals/stats/overview', {
      params: { period }
    });
    return response.data;
  },

  // Search journal entries
  async searchEntries(query: string, page?: number, limit?: number): Promise<PaginatedResponse<JournalEntry>> {
    const response = await api.get<PaginatedResponse<JournalEntry>>('/journals/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  },
};
