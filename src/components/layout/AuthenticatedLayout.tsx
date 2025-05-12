
import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    // Preserve pathname for after login
    const currentPath = window.location.pathname;
    if (currentPath !== '/' && currentPath !== '/login' && currentPath !== '/signup') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
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
