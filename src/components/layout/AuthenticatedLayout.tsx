
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from '@/components/animations/LoadingScreen';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  requiredRole?: 'student' | 'admin' | 'institution';
  redirectTo?: string;
}

/**
 * A wrapper component that handles authentication and role-based access
 */
const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({
  children,
  requiredRole,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user, loading } = useAuthStore();
  
  // Show loading screen while initializing auth
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Check user role if required
  if (requiredRole) {
    const userRole = user.user_metadata?.account_type || user.account_type;
    
    // Redirect based on role mismatch
    if (userRole !== requiredRole) {
      // Determine appropriate redirect based on actual role
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'institution') {
        return <Navigate to="/institution/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }
  
  // If all checks pass, render children
  return <>{children}</>;
};

export default AuthenticatedLayout;
