
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, session, isAuthenticated, loading, logout, login } = useAuthStore();

  return {
    user,
    session,
    isAuthenticated,
    isLoading: loading, // Renamed from isInitialized to isLoading to match the store property
    logout,
    login
  };
};

export default useAuth;
