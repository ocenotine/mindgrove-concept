
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, session, isInitialized } = useAuthStore();
  const [isLoading, setIsLoading] = useState(!isInitialized);

  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
  };
};
