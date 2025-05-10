
/**
 * API Helpers for managing API keys and other credentials
 */

/**
 * Get the OpenRouter API key from localStorage or prompt user to set one
 */
export const getOpenRouterApiKey = (): string | null => {
  return localStorage.getItem('openRouterApiKey');
};

/**
 * Set the OpenRouter API key in localStorage
 */
export const setOpenRouterApiKey = (key: string): void => {
  localStorage.setItem('openRouterApiKey', key);
};

/**
 * Check if OpenRouter API key exists
 */
export const hasOpenRouterApiKey = (): boolean => {
  const key = getOpenRouterApiKey();
  return key !== null && key.trim() !== '';
};

/**
 * Clear OpenRouter API key from localStorage
 */
export const clearOpenRouterApiKey = (): void => {
  localStorage.removeItem('openRouterApiKey');
};
