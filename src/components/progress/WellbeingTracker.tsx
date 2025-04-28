
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

// Simple Wellbeing tracker component using real data where possible
export default function WellbeingTracker() {
  const { user } = useAuthStore();
  const [lastActive, setLastActive] = useState<Date | null>(null);
  const [activityPattern, setActivityPattern] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user?.id) return;

      try {
        // Get user profile for last active data
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('last_active')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Error fetching user profile:', profileError);
        } else if (profile?.last_active) {
          setLastActive(new Date(profile.last_active));
        }
        
        // Get document activity to analyze patterns
        const { data: docActivity, error: docError } = await supabase
          .from('documents')
          .select('created_at')
          .eq('user_id', user.id);
          
        if (docError) {
          console.error('Error fetching document activity:', docError);
        }
        
        // Get chat activity to analyze patterns
        const { data: chatActivity, error: chatError } = await supabase
          .from('document_chats')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('role', 'user');
          
        if (chatError) {
          console.error('Error fetching chat activity:', chatError);
        }
        
        // Combine activities and analyze patterns
        const allActivities = [
          ...(docActivity || []).map(d => new Date(d.created_at)),
          ...(chatActivity || []).map(c => new Date(c.created_at))
        ];
        
        // Group by day of week
        const dayCount: { [key: string]: number } = {
          'Sunday': 0,
          'Monday': 0,
          'Tuesday': 0,
          'Wednesday': 0,
          'Thursday': 0,
          'Friday': 0,
          'Saturday': 0
        };
        
        allActivities.forEach(date => {
          const day = date.toLocaleDateString('en-US', { weekday: 'long' });
          dayCount[day] = (dayCount[day] || 0) + 1;
        });
        
        setActivityPattern(dayCount);
      } catch (error) {
        console.error('Error fetching wellbeing data:', error);
      }
    };
    
    fetchUserActivity();
  }, [user?.id]);
  
  // Find the days with most and least activity
  const findPeakDays = () => {
    let maxDay = 'Sunday';
    let minDay = 'Sunday';
    let maxCount = 0;
    let minCount = Infinity;
    
    Object.entries(activityPattern).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxDay = day;
      }
      if (count < minCount) {
        minCount = count;
        minDay = day;
      }
    });
    
    return { maxDay, minDay };
  };
  
  const { maxDay, minDay } = findPeakDays();
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {Object.entries(activityPattern).map(([day, count], index) => {
          // Normalize height based on activity
          const maxVal = Math.max(...Object.values(activityPattern));
          const height = maxVal > 0 ? Math.max(20, (count / maxVal) * 80) : 20;
          const shortDay = day.substring(0, 3);
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className="w-full bg-primary/20 rounded-t-sm mt-auto"
                style={{ height: `${height}px` }}
              ></div>
              <span className="text-xs text-muted-foreground mt-1">{shortDay}</span>
            </div>
          );
        })}
      </div>
      
      <div className="text-sm space-y-2">
        <p>Most productive day: <span className="font-semibold">{maxDay}</span></p>
        <p>Least active day: <span className="font-semibold">{minDay}</span></p>
        {lastActive && (
          <p>Last active: <span className="font-semibold">
            {lastActive.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span></p>
        )}
      </div>
    </div>
  );
}
