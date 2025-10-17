import api from './api';
import { Prompt, WellnessGoal, GoalFormData } from '../types';

export const resourceService = {
  // Get prompts
  async getPrompts(params?: {
    category?: string;
    difficulty?: string;
    limit?: number;
    random?: boolean;
    popular?: boolean;
  }): Promise<{ prompts: Prompt[]; filters: any }> {
    const response = await api.get('/resources/prompts', { params });
    return response.data;
  },

  // Get specific prompt
  async getPrompt(id: string): Promise<Prompt> {
    const response = await api.get<{ prompt: Prompt }>(`/resources/prompts/${id}`);
    return response.data.prompt;
  },

  // Generate AI prompts
  async generatePrompts(category?: string, userMood?: string): Promise<{
    prompts: Array<{ title: string; content: string }>;
    metadata: {
      category: string;
      difficulty: string;
      estimatedTime: number;
      generatedAt: string;
    };
  }> {
    const response = await api.post('/resources/generate-prompts', {
      category,
      userMood
    });
    return response.data;
  },

  // Get wellness goals
  async getGoals(): Promise<{
    goals: WellnessGoal[];
    totalGoals: number;
    completedGoals: number;
  }> {
    const response = await api.get('/resources/goals');
    return response.data;
  },

  // Create wellness goal
  async createGoal(goalData: GoalFormData): Promise<WellnessGoal> {
    const response = await api.post<{ message: string; goal: WellnessGoal }>('/resources/goals', goalData);
    return response.data.goal;
  },

  // Update wellness goal
  async updateGoal(goalId: string, goalData: Partial<GoalFormData>): Promise<WellnessGoal> {
    const response = await api.put<{ message: string; goal: WellnessGoal }>(`/resources/goals/${goalId}`, goalData);
    return response.data.goal;
  },

  // Delete wellness goal
  async deleteGoal(goalId: string): Promise<void> {
    await api.delete(`/resources/goals/${goalId}`);
  },

  // Get mindfulness exercises
  async getExercises(params?: {
    category?: string;
    duration?: number;
  }): Promise<{
    exercises: Array<{
      id: string;
      title: string;
      description: string;
      category: string;
      duration: number;
      instructions: string[];
      benefits: string[];
    }>;
    totalExercises: number;
    categories: string[];
  }> {
    const response = await api.get('/resources/exercises', { params });
    return response.data;
  },

  // Get resource categories
  async getCategories(): Promise<{
    categories: {
      prompts: string[];
      exercises: string[];
      difficulties: string[];
    };
  }> {
    const response = await api.get('/resources/categories');
    return response.data;
  },
};
