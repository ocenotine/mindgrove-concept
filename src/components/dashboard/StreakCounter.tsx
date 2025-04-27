
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
        
        if (error) {
          console.error('Error fetching streak data:', error);
          return;
        }
        
        // Set the current streak count
        setStreak(data?.streak_count || 0);
        
        // Check if we need to update the streak
        const lastActiveDate = data?.last_active ? new Date(data.last_active) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of day
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // If last_active is null or user hasn't been active today
        if (!lastActiveDate || lastActiveDate.getDate() !== today.getDate()) {
          let newStreakCount = 0;
          
          // If they were active yesterday, increment streak
          if (lastActiveDate && 
              lastActiveDate.getDate() === yesterday.getDate() && 
              lastActiveDate.getMonth() === yesterday.getMonth() && 
              lastActiveDate.getFullYear() === yesterday.getFullYear()) {
            newStreakCount = (data?.streak_count || 0) + 1;
          } else {
            // Not active yesterday, reset to 1 for today
            newStreakCount = 1;
          }
          
          // Update last_active and streak_count in the profile table
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              last_active: new Date().toISOString(),
              streak_count: newStreakCount
            })
            .eq('id', user.id);
            
          if (updateError) {
            console.error('Error updating streak:', updateError);
          } else {
            // Update local streak state
            setStreak(newStreakCount);
          }
        }
        
      } catch (error) {
        console.error('Error managing streak:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStreak();
    
    // Set up a daily check for the streak
    const dailyCheck = setInterval(fetchStreak, 1000 * 60 * 60); // Check every hour
    
    return () => clearInterval(dailyCheck);
  }, [user]);

  return (
    <div>
      {loading ? (
        <span className="text-muted-foreground">Loading...</span>
      ) : (
        <span className="font-medium">{streak} day{streak !== 1 ? 's' : ''}</span>
      )}
    </div>
  );
};

export default StreakCounter;
