
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface StreakCounterProps {
  streak?: number; // Optional streak count prop
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak: externalStreak }) => {
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [nextMilestone, setNextMilestone] = useState(7);
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuthStore();

  useEffect(() => {
    const updateStreakData = async () => {
      // If external streak is provided, use it
      if (externalStreak !== undefined) {
        setStreak(externalStreak);
        return;
      }

      if (!user) return;

      setLoading(true);
      try {
        // Get the user's profile data from Supabase
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('streak_count, last_active')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        const currentStreak = profileData?.streak_count || 0;
        const lastActive = profileData?.last_active ? new Date(profileData.last_active) : null;
        const currentDate = new Date();
        
        // Format dates to compare just the date part (not time)
        const lastActiveDate = lastActive ? new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()) : null;
        const todayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const yesterdayDate = new Date(todayDate);
        yesterdayDate.setDate(todayDate.getDate() - 1);
        
        let newStreak = currentStreak;
        let shouldUpdateDatabase = false;

        // If first time user or no last active date
        if (!lastActive) {
          newStreak = 1;
          shouldUpdateDatabase = true;
        } 
        // If user hasn't been active today but was active yesterday, increment streak
        else if (lastActiveDate.getTime() === yesterdayDate.getTime()) {
          newStreak = currentStreak + 1;
          shouldUpdateDatabase = true;
        }
        // If user hasn't been active for more than 1 day, reset streak
        else if (lastActiveDate.getTime() < yesterdayDate.getTime()) {
          newStreak = 1;
          shouldUpdateDatabase = true;
        }
        // If user was already active today, keep current streak
        else if (lastActiveDate.getTime() === todayDate.getTime()) {
          // No need to update, just keep the current streak
          newStreak = currentStreak;
          shouldUpdateDatabase = false;
        }

        // Update the database if needed
        if (shouldUpdateDatabase) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              streak_count: newStreak,
              last_active: currentDate.toISOString()
            })
            .eq('id', user.id);

          if (updateError) throw updateError;
          
          // Update the local store
          updateProfile({
            streakCount: newStreak,
            lastActive: currentDate.toISOString()
          });
        }

        setStreak(newStreak);
      } catch (error) {
        console.error('Error updating streak:', error);
      } finally {
        setLoading(false);
      }
    };

    updateStreakData();
  }, [user, externalStreak, updateProfile]);
  
  useEffect(() => {
    // Calculate next milestone and progress
    const milestones = [7, 14, 30, 60, 90, 180, 365];
    let next = milestones.find(m => m > streak) || (streak + 7);
    setNextMilestone(next);
    
    // Calculate progress percentage
    const prevMilestone = milestones.filter(m => m < streak).pop() || 0;
    const progressValue = ((streak - prevMilestone) / (next - prevMilestone)) * 100;
    setProgress(progressValue);
  }, [streak]);

  return (
    <Card className="w-full glass-card backdrop-blur-md border-white/20">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Daily Streak</CardTitle>
        <Calendar className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center space-y-3">
          <motion.div 
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{loading ? '...' : streak}</span>
            </div>
            <motion.div
              animate={{ 
                rotate: 360,
                filter: ["drop-shadow(0 0 5px rgba(255,140,0,0.5))", "drop-shadow(0 0 15px rgba(255,140,0,0.8))", "drop-shadow(0 0 5px rgba(255,140,0,0.5))"]
              }}
              transition={{ 
                rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                filter: { duration: 2, repeat: Infinity, yoyo: true }
              }}
            >
              <Flame className="h-16 w-16 text-orange-500" />
            </motion.div>
          </motion.div>
          
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Current</span>
              <span className="font-medium">{nextMilestone} days</span>
            </div>
            <Progress value={progress} className="h-2 bg-white/20" />
          </div>
          
          {streak >= 7 && (
            <motion.div 
              className="flex items-center space-x-1 text-xs text-amber-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Award className="h-3 w-3" />
              <span>{getStreakAchievement(streak)}</span>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get achievement text based on streak length
const getStreakAchievement = (streak: number) => {
  if (streak >= 365) return "Yearly Scholar";
  if (streak >= 180) return "Half-Year Dedication";
  if (streak >= 90) return "Quarterly Master";
  if (streak >= 30) return "Monthly Devotee";
  if (streak >= 14) return "Fortnight Focus";
  if (streak >= 7) return "Week Warrior";
  return "";
};

export default StreakCounter;
