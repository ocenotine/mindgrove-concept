
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from '@/components/animations/LoadingScreen';
import { useDocuments } from '@/hooks/useDocuments';

export default function Index() {
  const { isAuthenticated, user } = useAuthStore();
  const loading = useAuthStore.getState().loading;
  const { fetchDocuments } = useDocuments();
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // Preload documents data
      fetchDocuments().catch(console.error);
    }
  }, [isAuthenticated, user, fetchDocuments]);

  // Show loading screen while authentication state is being determined
  if (loading) {
    return <LoadingScreen />;
  }

  // Redirect based on authentication state
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
}
