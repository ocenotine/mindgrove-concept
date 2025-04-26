
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const StreakCounter = () => {
  const { user } = useAuthStore();
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch the user's profile to get the streak count
        const { data, error } = await supabase
          .from('profiles')
          .select('streak_count, last_active')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setStreak(data?.streak_count || 0);
        
        // Check if we need to update the streak
        const lastActiveDate = data?.last_active ? new Date(data.last_active) : new Date();
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If the user hasn't been active today, and was last active before yesterday,
        // reset the streak. If they were active yesterday, increment the streak.
        if (lastActiveDate.toDateString() !== today.toDateString()) {
          // Update last_active in the profile table
          await supabase
            .from('profiles')
            .update({ 
              last_active: new Date().toISOString(),
              streak_count: lastActiveDate.toDateString() === yesterday.toDateString() ? (data?.streak_count || 0) + 1 : 1
            })
            .eq('id', user.id);
            
          // Update local streak state
          setStreak(lastActiveDate.toDateString() === yesterday.toDateString() ? (data?.streak_count || 0) + 1 : 1);
        }
        
      } catch (error) {
        console.error('Error fetching streak:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStreak();
  }, [user]);

  return (
    <div>
      {loading ? (
        <span>Loading...</span>
      ) : (
        <span>{streak} days</span>
      )}
    </div>
  );
};

export default StreakCounter;
