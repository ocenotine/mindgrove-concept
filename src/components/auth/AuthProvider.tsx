
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  checkSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { initialize, getSession, isAuthenticated, isLoading } = useAuthStore();

  // Initialize auth store on mount
  useEffect(() => {
    initialize();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async () => {
      await getSession();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialize, getSession]);

  const checkSession = async () => {
    await getSession();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
