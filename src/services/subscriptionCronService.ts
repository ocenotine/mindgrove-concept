
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { downgradeExpiredSubscription } from '@/services/subscriptionService';

export const useSubscriptionCronService = () => {
  const { user } = useAuthStore();
  const [initialized, setInitialized] = useState(false);
  
  // Check subscription status on initial load and every hour
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || user.subscriptionTier === 'free') return;
      
      // Check if subscription has expired
      if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
        console.log('Subscription expired, downgrading to free tier');
        await downgradeExpiredSubscription();
      }
    };
    
    // Run check when component mounts
    if (user && !initialized) {
      checkSubscription();
      setInitialized(true);
    }
    
    // Set up hourly check
    const interval = setInterval(checkSubscription, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(interval);
  }, [user, initialized]);
  
  // Process all expired subscriptions (e.g. for users who haven't logged in)
  useEffect(() => {
    const processAllExpiredSubscriptions = async () => {
      if (!user?.id) return; // Only run for logged-in users
      
      // This would typically be a server-side cron job
      // For demo purposes, we'll just check the current user
      
      const today = new Date();
      
      // Check if we've already run the job today
      const lastRunKey = `subscription_cron_last_run`;
      const lastRun = localStorage.getItem(lastRunKey);
      
      if (lastRun && lastRun === today.toDateString()) {
        return; // Already ran today
      }
      
      try {
        // For a real app, this would be a server-side cron job
        // that checks all expired subscriptions in the database
        
        // Mark as run today
        localStorage.setItem(lastRunKey, today.toDateString());
      } catch (error) {
        console.error('Error processing expired subscriptions:', error);
      }
    };
    
    // Run once on mount
    if (user) {
      processAllExpiredSubscriptions();
    }
  }, [user]);
  
  return null; // This hook doesn't return anything
};

// SQL migration for subscription_events table (for reference only)
/*
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT, -- 'upgrade', 'downgrade', 'payment_failed'
  tier TEXT,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add subscription fields to profiles table
ALTER TABLE profiles 
ADD COLUMN subscription_tier TEXT DEFAULT 'free',
ADD COLUMN subscription_expiry TIMESTAMPTZ,
ADD COLUMN is_first_login BOOLEAN DEFAULT true;
*/
