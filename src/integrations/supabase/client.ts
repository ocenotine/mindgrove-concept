
import { createClient } from '@supabase/supabase-js';

// Define environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in a browser environment with localStorage available
const hasLocalStorage = typeof window !== 'undefined' && window.localStorage;

// Create a Supabase client with explicit configuration to prevent auth issues
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: hasLocalStorage ? localStorage : undefined,
  }
});

// Function to clean up auth state to prevent issues
export const cleanupAuthState = async () => {
  // Remove all Supabase auth keys from localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Remove from sessionStorage if in use
  if (typeof window !== 'undefined' && window.sessionStorage) {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// Function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Ensure user profile exists
export const ensureUserProfile = async (userId: string, email: string, accountType: string = 'student') => {
  try {
    // Check if profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    
    // If profile doesn't exist, create it
    if (!data) {
      console.log('Profile does not exist. Creating profile for', userId);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          account_type: accountType,
          updated_at: new Date().toISOString()
        });
      
      if (insertError) throw insertError;
      console.log('Profile created successfully');
    } else {
      console.log('Profile already exists for', userId);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    throw error;
  }
};

export default supabase;
