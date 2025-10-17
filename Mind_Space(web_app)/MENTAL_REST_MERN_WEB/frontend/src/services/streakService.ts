import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate: string | null;
  totalEntries: number;
  favoriteEntries: number;
}

let cache: StreakData | null = null;
let lastFetch: number = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

export const fetchStreakData = async (): Promise<StreakData> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const entriesResponse = await axios.get(`${API_BASE_URL}/journals?limit=1000&sortBy=createdAt&sortOrder=desc`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = userResponse.data;
    const allEntries = entriesResponse.data.entries;

    const streakData: StreakData = {
      currentStreak: userData.streak?.current || 0,
      longestStreak: userData.streak?.longest || 0,
      lastEntryDate: userData.streak?.lastEntryDate || null,
      totalEntries: entriesResponse.data.pagination?.totalEntries || allEntries.length,
      favoriteEntries: allEntries.filter((entry: any) => entry.isFavorite).length
    };

    cache = streakData;
    lastFetch = Date.now();

    return streakData;
  } catch (error) {
    console.error('Failed to fetch streak data:', error);
    throw error;
  }
};

export const getStreakData = async (forceRefresh: boolean = false): Promise<StreakData> => {
  const now = Date.now();
  
  if (!forceRefresh && cache && (now - lastFetch) < CACHE_DURATION) {
    return cache;
  }

  return await fetchStreakData();
};

export const clearStreakCache = (): void => {
  cache = null;
  lastFetch = 0;
};

export const getCurrentStreak = async (): Promise<number> => {
  const data = await getStreakData();
  return data.currentStreak;
};

export const getLongestStreak = async (): Promise<number> => {
  const data = await getStreakData();
  return data.longestStreak;
};

export const getTotalEntries = async (): Promise<number> => {
  const data = await getStreakData();
  return data.totalEntries;
};

export const getFavoriteEntries = async (): Promise<number> => {
  const data = await getStreakData();
  return data.favoriteEntries;
};

export const refreshStreakData = async (): Promise<StreakData> => {
  clearStreakCache();
  return await fetchStreakData();
};
