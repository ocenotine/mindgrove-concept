
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { 
    user, 
    session, 
    isAuthenticated, 
    loading, 
    logout, 
    login,
    initialize 
  } = useAuthStore();

  // Clean up function for more reliable auth state changes
  const cleanupAuthState = () => {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  // Enhanced logout function
  const enhancedLogout = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      // Call the actual logout function
      await logout();
      // Force a clean page reload for complete reset
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, try to clean up and redirect
      window.location.href = '/login';
    }
  };

  // Enhanced login function with better error handling
  const enhancedLogin = async (email: string, password: string) => {
    try {
      // Clean up existing state before logging in
      cleanupAuthState();
      // Call the actual login function
      const result = await login(email, password);
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Make sure authentication is initialized
  const ensureInitialized = async () => {
    if (loading) {
      try {
        await initialize();
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    }
  };

  return {
    user,
    session,
    isAuthenticated,
    isLoading: loading, // Renamed from loading to isLoading for consistency
    logout: enhancedLogout,
    login: enhancedLogin,
    ensureInitialized
  };
};

export default useAuth;
