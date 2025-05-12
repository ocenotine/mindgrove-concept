
import { useAuthStore } from '@/store/authStore';
import { useCallback } from 'react';

/**
 * Custom hook that provides authentication utilities with improved performance
 */
export const useAuth = () => {
  const { 
    user, 
    session, 
    isAuthenticated, 
    loading, 
    logout, 
    login,
    loginWithGoogle 
  } = useAuthStore();
  
  // Memoized version of the logout function
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }, [logout]);

  return {
    user,
    session,
    isAuthenticated,
    isLoading: loading, // Renamed for clarity
    logout: handleLogout,
    login,
    loginWithGoogle
  };
};

export default useAuth;
