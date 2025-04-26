
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, options?: any) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserWithMetadata | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  updateProfile: (data: Partial<UserWithMetadata>) => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  
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
      isAuthenticated: !!session?.user
    });
  },
  
  setLoading: (loading) => {
    set({ loading });
  },
  
  login: async (email, password) => {
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
      isAuthenticated: true 
    });
  },
  
  signup: async (email, password, name, options = {}) => {
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
        data: userData
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
        isAuthenticated: !!data.session
      });
    }
  },
  
  loginWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/#/auth/callback`
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
      
      // Then tell Supabase to sign out
      const { error } = await supabase.auth.signOut({ 
        scope: 'local' // Use 'global' to sign out from all devices
      });
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      // Clear any local auth data
      localStorage.removeItem('supabase.auth.token');
      
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
      set({ user: { ...currentUser, ...data } });
    }
  },
  
  initialize: async () => {
    const { setUser, setSession, setLoading } = get();
    setLoading(true);
    
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Process user metadata from existing session
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
      
      setSession(session);
      setUser(user);
      
      return Promise.resolve();
    } catch (error) {
      console.error("Auth initialization error:", error);
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  }
}));

// Set up auth listener
export const initializeAuth = async () => {
  const { setUser, setSession, setLoading } = useAuthStore.getState();
  
  try {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        // Process user metadata from session
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
        
        setSession(session);
        setUser(user);
        setLoading(false);
      }
    );
    
    // Then check for any existing session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Process user metadata from existing session
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
    
    setSession(session);
    setUser(user);
    setLoading(false);
    
    return () => {
      subscription.unsubscribe();
    };
  } catch (error) {
    console.error("Auth initialization error:", error);
    setLoading(false);
  }
};
