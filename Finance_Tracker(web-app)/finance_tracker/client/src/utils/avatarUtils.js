// Utility functions for avatar handling

/**
 * Get the full avatar URL
 * @param {string} avatarPath - The avatar path from the database
 * @returns {string} - The full avatar URL
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Construct the full URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${baseUrl}${avatarPath}`;
};

/**
 * Get avatar URL with fallback
 * @param {string} avatarPath - The avatar path from the database
 * @param {string} fallback - Fallback text or emoji
 * @returns {string|null} - The full avatar URL or null for fallback
 */
export const getAvatarUrlWithFallback = (avatarPath, fallback = null) => {
  return avatarPath ? getAvatarUrl(avatarPath) : fallback;
};

/**
 * Test if an avatar URL is accessible
 * @param {string} url - The avatar URL to test
 * @returns {Promise<boolean>} - Whether the URL is accessible
 */
export const testAvatarUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.warn('Avatar URL test failed:', error);
    return false;
  }
};
