
import { useAuthStore } from '@/store/authStore';
import { useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';

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
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout error",
        description: "There was a problem logging you out. Please try again.",
        variant: "destructive"
      });
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
