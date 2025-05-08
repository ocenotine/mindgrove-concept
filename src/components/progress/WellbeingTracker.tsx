
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase, WellbeingData } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, LineChart, Loader } from 'lucide-react';

// Simple Wellbeing tracker component using real data from Supabase
export default function WellbeingTracker() {
  const { user } = useAuthStore();
  const [lastActive, setLastActive] = useState<Date | null>(null);
  const [activityPattern, setActivityPattern] = useState<{ [key: string]: number }>({});
  const [wellbeingData, setWellbeingData] = useState<WellbeingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // New state for wellbeing entry
  const [focusRating, setFocusRating] = useState(5);
  const [stressRating, setStressRating] = useState(5);
  const [wellbeingNotes, setWellbeingNotes] = useState('');
  const [showEntryForm, setShowEntryForm] = useState(false);

  useEffect(() => {
    const fetchUserActivity = async () => {
      if (!user?.id) return;

      setLoading(true);
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
        
        // Get wellbeing data if available
        const { data: wellbeingRecords, error: wellbeingError } = await supabase
          .from('user_wellbeing')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (wellbeingError) {
          console.error('Error fetching wellbeing data:', wellbeingError);
        } else {
          setWellbeingData(wellbeingRecords || []);
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserActivity();
  }, [user?.id]);
  
  const handleSubmitWellbeing = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to track your wellbeing",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_wellbeing')
        .insert({
          user_id: user.id,
          focus: focusRating,
          stress: stressRating,
          notes: wellbeingNotes
        });
        
      if (error) {
        throw error;
      }
      
      // Refresh data after successful submission
      const { data: wellbeingRecords } = await supabase
        .from('user_wellbeing')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
        
      setWellbeingData(wellbeingRecords || []);
      
      toast({
        title: "Wellbeing tracked",
        description: "Your wellbeing entry has been saved",
        variant: "default"
      });
      
      // Reset form
      setFocusRating(5);
      setStressRating(5);
      setWellbeingNotes('');
      setShowEntryForm(false);
    } catch (error) {
      console.error("Error saving wellbeing data:", error);
      toast({
        title: "Error saving data",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
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
  
  // Get wellbeing insights based on recent entries
  const getWellbeingInsight = () => {
    if (wellbeingData.length === 0) {
      return "Track your wellbeing daily to get personalized insights";
    }
    
    const latest = wellbeingData[0];
    
    if (latest.focus < 4) {
      return "Your focus has been low. Consider taking more breaks or trying the Pomodoro technique.";
    } else if (latest.stress > 7) {
      return "Your stress levels are high. Deep breathing exercises and short walks might help.";
    } else if (latest.focus > 7 && latest.stress < 4) {
      return "Great job! Your focus is high and stress is low. Keep up the good habits.";
    } else {
      return "Your wellbeing seems balanced. Regular check-ins help maintain this balance.";
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Activity Pattern Chart */}
      <div className="grid grid-cols-7 gap-1">
        {Object.entries(activityPattern).map(([day, count], index) => {
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
      
      {/* Summary and Insights */}
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
      
      {/* Wellbeing Insights */}
      <div className="bg-muted/40 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <LineChart className="h-4 w-4 text-primary" />
          <h4 className="font-medium">Wellbeing Insight</h4>
        </div>
        <p className="text-sm">{getWellbeingInsight()}</p>
      </div>
      
      {/* Wellbeing Entry Form or Button */}
      {!showEntryForm ? (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full" 
          onClick={() => setShowEntryForm(true)}
        >
          Track Today's Wellbeing
        </Button>
      ) : (
        <div className="border rounded-lg p-4 space-y-3 bg-card">
          <h4 className="text-sm font-medium">How are you feeling today?</h4>
          
          {/* Focus Rating */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Focus</span>
              <span className="font-medium">{focusRating}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={focusRating}
              onChange={(e) => setFocusRating(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Stress Rating */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Stress</span>
              <span className="font-medium">{stressRating}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={stressRating}
              onChange={(e) => setStressRating(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          {/* Notes */}
          <div>
            <input
              type="text"
              placeholder="Notes (optional)"
              value={wellbeingNotes}
              onChange={(e) => setWellbeingNotes(e.target.value)}
              className="w-full px-3 py-1 text-sm rounded border bg-background"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex-1"
              onClick={() => setShowEntryForm(false)}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={handleSubmitWellbeing}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader className="h-3 w-3 mr-1 animate-spin" /> Saving
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" /> Save
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
