
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  streak?: number;
  flashcardCount?: number;
  lastActive?: string;
  bio?: string;
  documentCount?: number;
  createdAt?: string;
  subscriptionTier: 'free' | 'weekly' | 'monthly';
  subscriptionExpiry?: string;
  isFirstLogin?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean; // Added for compatibility
  error: string | null;
  
  // Add method signatures for authentication
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  updateSubscription: (tier: 'free' | 'weekly' | 'monthly', expiryDate?: string) => Promise<void>;

  initialize: () => Promise<void>;
  getSession: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  isLoading: true, // Added for compatibility
  error: null,
  
  // Initialize the auth store
  initialize: async () => {
    set({ loading: true, isLoading: true });
    try {
      const authenticated = await get().getSession();
      set({ isAuthenticated: authenticated, loading: false, isLoading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ error: 'Failed to initialize authentication', loading: false, isLoading: false });
    }
  },

  // Get the current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (data?.session) {
        const user = data.session.user;
        
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        set({ 
          user: { 
            id: user.id,
            email: user.email || '',
            name: profileData?.name || user.user_metadata?.full_name || 'User',
            avatarUrl: profileData?.avatar_url,
            streak: profileData?.streak_count || 0,
            flashcardCount: profileData?.flashcard_count || 0,
            lastActive: profileData?.last_active,
            bio: profileData?.bio || '',
            documentCount: profileData?.document_count || 0,
            createdAt: profileData?.created_at,
            subscriptionTier: profileData?.subscription_tier || 'free',
            subscriptionExpiry: profileData?.subscription_expiry,
            isFirstLogin: profileData?.is_first_login
          },
          token: data.session.access_token,
          isAuthenticated: true,
          loading: false,
          isLoading: false
        });
        return true;
      } else {
        set({ user: null, token: null, isAuthenticated: false, loading: false, isLoading: false });
        return false;
      }
    } catch (error) {
      console.error('Session error:', error);
      set({ user: null, token: null, isAuthenticated: false, loading: false, isLoading: false });
      return false;
    }
  },

  // Sign in a user
  signIn: async (email, password) => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Get user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        set({ 
          user: { 
            id: data.user.id,
            email: data.user.email || '',
            name: profileData?.name || data.user.user_metadata?.full_name || 'User',
            avatarUrl: profileData?.avatar_url,
            streak: profileData?.streak_count || 0,
            flashcardCount: profileData?.flashcard_count || 0,
            lastActive: profileData?.last_active,
            bio: profileData?.bio || '',
            documentCount: profileData?.document_count || 0,
            createdAt: profileData?.created_at,
            subscriptionTier: profileData?.subscription_tier || 'free',
            subscriptionExpiry: profileData?.subscription_expiry,
            isFirstLogin: profileData?.is_first_login
          },
          token: data.session?.access_token || null,
          isAuthenticated: true,
          loading: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in', 
        loading: false,
        isLoading: false 
      });
      throw error;
    }
  },

  // Sign up a new user
  signUp: async (email, password, name) => {
    set({ loading: true, isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Create a profile for the user
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: name,
          email: email,
          updated_at: new Date().toISOString(),
          streak_count: 1,
          last_active: new Date().toISOString(),
          is_first_login: true,
          subscription_tier: 'free'
        });
        
        set({ 
          user: { 
            id: data.user.id, 
            email: email,
            name: name,
            streak: 1,
            flashcardCount: 0,
            lastActive: new Date().toISOString(),
            subscriptionTier: 'free',
            isFirstLogin: true
          },
          token: data.session?.access_token || null,
          isAuthenticated: true,
          loading: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign up', 
        loading: false,
        isLoading: false 
      });
      throw error;
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ error: 'Failed to sign out' });
      throw error;
    }
  },

  // Update user profile
  updateProfile: (data) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    set({
      user: {
        ...currentUser,
        ...data
      }
    });
  },

  // Update user subscription
  updateSubscription: async (tier, expiryDate) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    try {
      // Update the subscription in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_tier: tier,
          subscription_expiry: expiryDate || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
        
      if (error) throw error;
      
      // Update local state
      set({
        user: {
          ...currentUser,
          subscriptionTier: tier,
          subscriptionExpiry: expiryDate
        }
      });
      
    } catch (error) {
      console.error('Subscription update error:', error);
      throw error;
    }
  }
}));
