
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

// Add a constant for session timeout (30 minutes in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Password strength validation function
export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must include at least one number' };
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one letter' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one special character' };
  }
  
  return { isValid: true, message: 'Password meets strength requirements' };
};

// Helper function to clean up auth state
export const cleanupAuthState = () => {
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

// Export the UserWithMetadata interface
export interface UserWithMetadata extends User {
  name?: string;
  email?: string;
  account_type?: 'student' | 'admin' | 'teacher' | 'institution';
  avatarUrl?: string;
  last_prompt_shown?: string;
  bio?: string;
  document_count?: number;
  flashcard_count?: number;
  streak_count?: number;
  study_hours?: number;
  last_active?: string;
  institution_id?: string;
  subscription_tier?: string;
  subscription_expiry?: string;
  is_first_login?: boolean;
  user_metadata: {
    name?: string;
    account_type?: 'student' | 'admin' | 'teacher' | 'institution';
    institution_name?: string;
    domain?: string;
    institution_id?: string;
    bio?: string;
  };
}

interface AuthState {
  user: UserWithMetadata | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  lastActivity: number;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, options?: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserWithMetadata | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (data: Partial<UserWithMetadata>) => Promise<void>;
  initialize: () => Promise<void>;
  updateLastActivity: () => void;
  checkSessionTimeout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (password: string) => Promise<void>;
  enableTwoFactorAuth: () => Promise<string>;
  verifyTwoFactorAuth: (token: string) => Promise<boolean>;
  cleanupAuthState: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  lastActivity: Date.now(),
  
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
  
  setSession: (session) => {
    // Extract user metadata from session
    const user = session?.user ? {
      ...session.user,
      name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
      account_type: session.user.user_metadata?.account_type || 'student',
      avatarUrl: session.user.user_metadata?.avatar_url,
      institution_id: session.user.user_metadata?.institution_id,
      subscription_tier: 'free',
      subscription_expiry: null,
      is_first_login: false
    } as UserWithMetadata : null;

    set({ 
      session, 
      user,
      isAuthenticated: !!session?.user,
      lastActivity: Date.now() // Reset last activity timestamp when session changes
    });
  },
  
  setLoading: (loading) => {
    set({ loading });
  },
  
  login: async (email, password) => {
    // Clean up existing auth state
    cleanupAuthState();
    
    // Try to sign out globally first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw error;
    }
    
    // Process user metadata
    const user = data.user ? {
      ...data.user,
      name: data.user.user_metadata?.name || data.user.user_metadata?.full_name,
      account_type: data.user.user_metadata?.account_type || 'student',
      avatarUrl: data.user.user_metadata?.avatar_url,
      subscription_tier: 'free',
      subscription_expiry: null,
      is_first_login: false
    } as UserWithMetadata : null;
    
    set({ 
      user,
      session: data.session,
      isAuthenticated: true,
      lastActivity: Date.now() // Set last activity to current time on login
    });
  },
  
  signup: async (email, password, name, options = {}) => {
    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    // Clean up existing auth state
    cleanupAuthState();
    
    const userData = {
      name,
      account_type: options.accountType || 'student'
    };
    
    if (options.accountType === 'institution') {
      Object.assign(userData, {
        institution_name: options.institutionName,
        domain: options.domain
      });
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/#/auth/callback?autoLogin=true`
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (data.user) {
      // Process user metadata
      const user = {
        ...data.user,
        name: userData.name,
        account_type: userData.account_type,
        subscription_tier: 'free',
        subscription_expiry: null,
        is_first_login: true
      } as UserWithMetadata;
      
      set({ 
        user,
        session: data.session,
        isAuthenticated: !!data.session,
        lastActivity: Date.now() // Set last activity to current time on signup
      });
    }
  },
  
  loginWithGoogle: async () => {
    // Clean up existing auth state
    cleanupAuthState();
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/auth/callback?autoLogin=true`
      }
    });
    
    if (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      // First clear the store state
      set({ 
        user: null, 
        session: null, 
        isAuthenticated: false 
      });
      
      // Clean up all auth state
      cleanupAuthState();
      
      // Remove admin session data
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminLoginTime');
      
      // Then tell Supabase to sign out
      const { error } = await supabase.auth.signOut({ 
        scope: 'global' // Sign out from all devices
      });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      // Notify user
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
      
      // Force page reload to ensure clean state
      window.location.href = '/#/login';
      
      // Return successful
      return Promise.resolve();
    } catch (error) {
      console.error('Logout error:', error);
      return Promise.reject(error);
    }
  },

  updateProfile: async (data) => {
    const { error } = await supabase.auth.updateUser({
      data
    });

    if (error) {
      throw error;
    }

    // Update local user data
    const currentUser = get().user;
    if (currentUser) {
      set({ 
        user: { ...currentUser, ...data },
        lastActivity: Date.now() // Update last activity on profile update
      });
    }
  },
  
  initialize: async () => {
    try {
      const { setUser, setSession, setLoading } = get();
      setLoading(true);
      
      console.log("Initializing auth store...");
      
      // First set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event, session?.user?.email);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log("User signed in:", session.user.email);
            
            // Create profile if it doesn't exist
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const isAdmin = user.email === 'admin@mindgrove.com';
                await supabase.from('profiles').upsert({
                  id: user.id,
                  email: user.email,
                  account_type: isAdmin ? 'admin' : (user.user_metadata.account_type || 'student')
                }).eq('id', user.id);
              }
            } catch (err) {
              console.error("Error ensuring profile exists:", err);
            }
          }
          
          // Process user metadata from session
          const user = session?.user ? {
            ...session.user,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
            account_type: session.user.user_metadata?.account_type || session.user.email === 'admin@mindgrove.com' ? 'admin' : 'student',
            avatarUrl: session.user.user_metadata?.avatar_url,
            institution_id: session.user.user_metadata?.institution_id,
            subscription_tier: 'free',
            subscription_expiry: null,
            is_first_login: false
          } as UserWithMetadata : null;
          
          setSession(session);
          setUser(user);
        }
      );
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Process user metadata from existing session
      const user = session?.user ? {
        ...session.user,
        name: session.user.user_metadata?.name || session.user.user_metadata?.full_name,
        account_type: session.user.user_metadata?.account_type || session.user.email === 'admin@mindgrove.com' ? 'admin' : 'student',
        avatarUrl: session.user.user_metadata?.avatar_url,
        institution_id: session.user.user_metadata?.institution_id,
        subscription_tier: 'free',
        subscription_expiry: null,
        is_first_login: false
      } as UserWithMetadata : null;
      
      setSession(session);
      setUser(user);
      
      console.log("Auth initialized:", user?.email, user?.account_type);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Auth initialization error:", error);
      return Promise.reject(error);
    } finally {
      get().setLoading(false);
    }
  },
  
  // Method to update the last activity timestamp
  updateLastActivity: () => {
    set({ lastActivity: Date.now() });
  },
  
  // Method to check if session has timed out
  checkSessionTimeout: () => {
    const { lastActivity, isAuthenticated, logout } = get();
    const currentTime = Date.now();
    
    if (isAuthenticated && currentTime - lastActivity > SESSION_TIMEOUT) {
      // Session has timed out, log the user out
      logout().then(() => {
        toast({
          title: "Session expired",
          description: "You have been logged out due to inactivity",
          variant: "default"
        });
        
        // Redirect to login page
        window.location.href = '/#/login';
      });
    }
  },
  
  // Password reset methods
  requestPasswordReset: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Password reset email sent",
      description: "Check your inbox for a link to reset your password"
    });
  },
  
  resetPassword: async (password: string) => {
    // Validate password strength
    const validation = validatePassword(password);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully"
    });
  },
  
  // Two-factor authentication methods (placeholder - would need actual implementation)
  enableTwoFactorAuth: async () => {
    // This would typically generate a QR code or secret for an authenticator app
    toast({
      title: "2FA Feature",
      description: "Two-factor authentication would be implemented with Supabase Auth",
      variant: "default"
    });
    return "EXAMPLE_SECRET_KEY";
  },
  
  verifyTwoFactorAuth: async (token: string) => {
    // This would verify the token against the user's secret
    toast({
      title: "2FA Verification",
      description: "Token verification would be implemented with Supabase Auth",
      variant: "default"
    });
    return token.length === 6;
  },
  
  cleanupAuthState
}));

// Set up activity tracker
export const initializeAuth = async () => {
  const { initialize, updateLastActivity, checkSessionTimeout } = useAuthStore.getState();
  
  try {
    // Initialize auth
    await initialize();
    
    // Set up activity listeners to track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      window.addEventListener(event, updateLastActivity);
    });
    
    // Set up session timeout check interval
    const timeoutCheckInterval = setInterval(checkSessionTimeout, 60000); // Check every minute
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateLastActivity);
      });
      clearInterval(timeoutCheckInterval);
    };
  } catch (error) {
    console.error("Auth initialization error:", error);
  }
};
