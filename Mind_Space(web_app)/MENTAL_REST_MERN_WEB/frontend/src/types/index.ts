// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin';
  preferences: UserPreferences;
  wellnessGoals: WellnessGoal[];
  streak: {
    current: number;
    longest: number;
    lastEntryDate?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    push: boolean;
  };
  privacy: {
    shareAnonymously: boolean;
    dataRetention: number;
  };
}

export interface WellnessGoal {
  _id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
}

// Journal Types
export interface JournalEntry {
  _id: string;
  user: string;
  title?: string;
  content: string;
  mood: MoodType;
  moodIntensity: number;
  tags: string[];
  isPrivate: boolean;
  prompt?: Prompt;
  aiAnalysis?: AIAnalysis;
  isFavorite: boolean;
  wordCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
}

export type MoodType = 
  | 'very-happy' 
  | 'happy' 
  | 'neutral' 
  | 'sad' 
  | 'very-sad' 
  | 'anxious' 
  | 'stressed' 
  | 'calm' 
  | 'excited' 
  | 'grateful' 
  | 'frustrated' 
  | 'peaceful';

export interface AIAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  summary: string;
  suggestions: string[];
  analyzedAt: string;
}

// Prompt Types
export interface Prompt {
  _id: string;
  title: string;
  content: string;
  category: PromptCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  tags: string[];
  isActive: boolean;
  usageCount: number;
  createdBy?: string;
  isSystemPrompt: boolean;
  language: string;
  targetAudience: string;
  createdAt: string;
  updatedAt: string;
}

export type PromptCategory = 
  | 'gratitude' 
  | 'reflection' 
  | 'mindfulness' 
  | 'goal-setting' 
  | 'self-care' 
  | 'relationships' 
  | 'work' 
  | 'creativity' 
  | 'general';

// Insight Types
export interface Insight {
  _id: string;
  user: string;
  type: InsightType;
  title: string;
  description: string;
  data: any;
  period: {
    startDate: string;
    endDate: string;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  isRead: boolean;
  isFavorite: boolean;
  priority: 'low' | 'medium' | 'high';
  category: 'positive' | 'neutral' | 'concern' | 'achievement';
  actionable: boolean;
  actionItems: ActionItem[];
  generatedBy: 'ai' | 'system' | 'manual';
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export type InsightType = 
  | 'mood-trend' 
  | 'sentiment-analysis' 
  | 'writing-pattern' 
  | 'wellness-tip' 
  | 'achievement' 
  | 'streak-milestone';

export interface ActionItem {
  text: string;
  completed: boolean;
  dueDate?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Auth Types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface MoodStats {
  _id: string;
  count: number;
  avgIntensity: number;
}

// Community Types
export interface LeaderboardEntry {
  displayName: string;
  streak: number;
  entryCount: number;
  longestStreak: number;
}

export interface CommunityStats {
  totalUsers: number;
  activeUsers: number;
  totalEntries: number;
  avgEntriesPerUser: number;
  moodDistribution: MoodStats[];
  popularTags: { _id: string; count: number }[];
}

// Form Types
export interface JournalFormData {
  title?: string;
  content: string;
  mood: MoodType;
  moodIntensity: number;
  tags: string[];
  isPrivate: boolean;
  promptId?: string;
}

export interface GoalFormData {
  title: string;
  description?: string;
  targetValue: number;
  unit: string;
  deadline?: string;
}

// Theme Types
export interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Utility Types
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterOptions {
  search?: string;
  category?: string;
  mood?: MoodType;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}
