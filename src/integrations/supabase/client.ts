
import { createClient } from '@supabase/supabase-js';

// Define environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Define types for wellbeing data
export interface WellbeingData {
  id: string;
  user_id: string;
  date: string;
  focus: number;
  stress: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Define types for quiz data
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface StoredQuiz {
  id: string;
  user_id: string;
  document_id: string | null;
  name: string;
  questions: QuizQuestion[];
  difficulty: string;
  last_taken: string | null;
  created_at: string;
  updated_at: string;
}

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
  
  // Try to perform a global sign out
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    console.error('Error during global sign out:', err);
    // Continue even if this fails
  }
};

// Function to get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();  // Use maybeSingle instead of single to prevent errors
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Ensure user profile exists
export const ensureUserProfile = async (userId: string, email: string, accountType: string = 'student') => {
  if (!userId) {
    console.error('Cannot create profile: No user ID provided');
    return false;
  }
  
  try {
    // Check if profile exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id, account_type')
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
      return true;
    } else {
      console.log('Profile already exists for', userId);
      
      // Update account_type if needed (especially for admin users)
      if (accountType === 'admin' && data.account_type !== 'admin') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            account_type: 'admin',
            updated_at: new Date().toISOString() 
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;
        console.log('Updated profile to admin account type');
      }
      return true;
    }
  } catch (error) {
    console.error('Error ensuring user profile exists:', error);
    throw error;
  }
};

export default supabase;
