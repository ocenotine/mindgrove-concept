
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  streakCount: number;
  lastActive: string;
  // Added missing properties from profile
  bio?: string;
  createdAt?: string;
  documentCount?: number;
  flashcardCount?: number;
  studyHours?: number;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: User;
}

// Interface to match our database structure for profiles
interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  document_count?: number;
  flashcard_count?: number;
  study_hours?: number;
  last_active?: string;
  streak_count?: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  updateStreak: () => void;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  fetchUserProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        // Check if it's a new day (24 hours) since last login
        const lastActive = profile.last_active ? new Date(profile.last_active) : null;
        const now = new Date();
        const isNewDay = lastActive ? 
          (now.getTime() - lastActive.getTime()) > (24 * 60 * 60 * 1000) : true;
        
        set({
          user: {
            id: user.id,
            name: profile.name || user.email?.split('@')[0] || '',
            email: profile.email || user.email || '',
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            streakCount: profile.streak_count || 0,
            lastActive: profile.last_active || new Date().toISOString(),
            createdAt: profile.created_at,
            documentCount: profile.document_count,
            flashcardCount: profile.flashcard_count,
            studyHours: profile.study_hours
          },
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      set({ isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error('Invalid credentials');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!profile) {
        throw new Error('User profile not found');
      }

      // Check if it's a new day (24 hours) since last login
      const lastActive = profile.last_active ? new Date(profile.last_active) : null;
      const now = new Date();
      const isNewDay = lastActive ? 
        (now.getTime() - lastActive.getTime()) > (24 * 60 * 60 * 1000) : true;
      
      // Update the last_active timestamp and streak count in the database
      if (isNewDay) {
        await supabase
          .from('profiles')
          .update({ 
            last_active: now.toISOString(),
            streak_count: (profile.streak_count || 0) + 1
          })
          .eq('id', data.user.id);
      } else {
        // Just update the last_active timestamp without incrementing the streak
        await supabase
          .from('profiles')
          .update({ 
            last_active: now.toISOString()
          })
          .eq('id', data.user.id);
      }

      set({ 
        user: {
          id: data.user.id,
          name: profile.name || data.user.email?.split('@')[0] || '',
          email: profile.email || data.user.email || '',
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          streakCount: isNewDay ? (profile.streak_count || 0) + 1 : (profile.streak_count || 0),
          lastActive: now.toISOString(),
          createdAt: profile.created_at,
          documentCount: profile.document_count,
          flashcardCount: profile.flashcard_count,
          studyHours: profile.study_hours
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
          user: {
            id: data.user.id,
            name: profile.name || data.user.email?.split('@')[0] || '',
            email: profile.email || data.user.email || '',
            avatar_url: profile.avatar_url,
            streakCount: isNewDay ? (profile.streak_count || 0) + 1 : (profile.streak_count || 0),
            lastActive: now.toISOString(),
            createdAt: profile.created_at,
            documentCount: profile.document_count,
            flashcardCount: profile.flashcard_count,
            studyHours: profile.study_hours
          }
        },
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Invalid email or password', 
        isLoading: false 
      });
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: "destructive"
      });
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        throw error;
      }
      
      // Auth state will be handled by the listener in the store
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to login with Google', 
        isLoading: false 
      });
      toast({
        title: "Authentication failed",
        description: error instanceof Error ? error.message : 'Failed to login with Google',
        variant: "destructive"
      });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
      set({ 
        user: null, 
        session: null,
        isAuthenticated: false,
        isLoading: false
      });
      // Add success toast notification
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      console.error('Error during logout:', error);
      set({ isLoading: false });
      // Add error toast notification
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Error during logout",
        variant: "destructive"
      });
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        set({ 
          user: {
            id: data.user.id,
            name,
            email,
            streakCount: 0,
            lastActive: new Date().toISOString(),
            documentCount: 0,
            flashcardCount: 0,
            studyHours: 0
          },
          session: data.session ? {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
            user: {
              id: data.user.id,
              name,
              email,
              streakCount: 0,
              lastActive: new Date().toISOString(),
              documentCount: 0,
              flashcardCount: 0,
              studyHours: 0
            }
          } : null,
          isAuthenticated: !!data.session,
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign up', 
        isLoading: false 
      });
    }
  },

  updateStreak: () => {
    const state = get();
    if (!state.user) return;
    
    // Only update streak if it's been more than 24 hours since last login
    const lastActive = new Date(state.user.lastActive);
    const now = new Date();
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (diffHours >= 24) {
      set({
        user: {
          ...state.user,
          streakCount: state.user.streakCount + 1,
          lastActive: now.toISOString()
        }
      });
      
      // Update the database too
      supabase
        .from('profiles')
        .update({ 
          last_active: now.toISOString(),
          streak_count: state.user.streakCount + 1
        })
        .eq('id', state.user.id)
        .then(({ error }) => {
          if (error) console.error('Error updating streak:', error);
        });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true });
    try {
      const state = get();
      if (!state.user) {
        throw new Error('You must be logged in to update your profile');
      }

      // Map User properties to profile table fields
      const profileData: Partial<ProfileData> = {
        name: data.name,
        bio: data.bio,
        updated_at: new Date().toISOString(),
        streak_count: data.streakCount,
        last_active: data.lastActive
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', state.user.id);

      if (error) {
        throw error;
      }

      set({
        user: {
          ...state.user,
          ...data,
        },
        isLoading: false
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      set({ isLoading: false });
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: "destructive"
      });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      set({ isLoading: false });
      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link",
      });
    } catch (error) {
      set({ isLoading: false });
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : 'Failed to send reset email',
        variant: "destructive"
      });
    }
  }
}));

// Setup auth state listener
if (typeof window !== 'undefined') {
  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      useAuthStore.getState().fetchUserProfile();
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange((_event, session) => {
    const state = useAuthStore.getState();
    
    if (session) {
      if (!state.isAuthenticated) {
        state.fetchUserProfile();
      }
    } else {
      useAuthStore.setState({ 
        user: null, 
        session: null, 
        isAuthenticated: false,
        isLoading: false
      });
    }
  });
}
