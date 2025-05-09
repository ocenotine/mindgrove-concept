
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, session, loading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
  };
};
