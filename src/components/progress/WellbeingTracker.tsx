
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

type WellbeingData = {
  id?: string;
  date: string;
  focus: number;
  stress: number;
  user_id?: string;
};

export default function WellbeingTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [wellbeingData, setWellbeingData] = useState<WellbeingData[]>([]);
  const [weeklyFocus, setWeeklyFocus] = useState(0);
  const [weeklyStress, setWeeklyStress] = useState(0);
  const [weeklyBreaks, setWeeklyBreaks] = useState(0);
  
  const { user } = useAuthStore();
  
  // Load data from Supabase or localStorage on component mount
  useEffect(() => {
    const loadWellbeingData = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('user_wellbeing')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(30);
          
          if (error) {
            console.error('Error loading wellbeing data:', error);
            throw error;
          }
          
          if (data && data.length > 0) {
            setWellbeingData(data);
            calculateWeeklyStats(data);
            return;
          }
        } catch (err) {
          console.error('Error fetching wellbeing data:', err);
        }
      }
      
      // Fallback to localStorage
      const savedData = localStorage.getItem('wellbeingData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setWellbeingData(parsedData);
          calculateWeeklyStats(parsedData);
        } catch (e) {
          console.error('Error parsing wellbeing data', e);
        }
      }
    };
    
    loadWellbeingData();
    
    // Set up timer to show popup after 30 minutes (30 * 60 * 1000 = 1800000 ms)
    // For demo purposes, using a shorter time of 3 minutes (180000 ms)
    const timer = setTimeout(() => {
      // Check when last prompt was shown
      const lastPromptTime = localStorage.getItem('lastWellbeingPrompt');
      const now = new Date().getTime();
      
      if (!lastPromptTime || now - parseInt(lastPromptTime) > 3600000) { // 1 hour
        setIsOpen(true);
        localStorage.setItem('lastWellbeingPrompt', now.toString());
      }
    }, 180000);
    
    return () => clearTimeout(timer);
  }, [user?.id]);
  
  // Calculate weekly averages for focus, stress, and break compliance
  const calculateWeeklyStats = (data: WellbeingData[]) => {
    // Filter data from the last 7 days
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    
    const weeklyData = data.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= weekAgo && entryDate <= now;
    });
    
    // Calculate averages
    if (weeklyData.length > 0) {
      // Average focus (0-4 scale, converted to percentage)
      const avgFocus = weeklyData.reduce((sum, entry) => sum + entry.focus, 0) / weeklyData.length;
      setWeeklyFocus((avgFocus / 4) * 100);
      
      // Average stress (0-4 scale, converted to stress management percentage, so inverse)
      const avgStress = weeklyData.reduce((sum, entry) => sum + entry.stress, 0) / weeklyData.length;
      setWeeklyStress((1 - avgStress / 4) * 100);
      
      // Break compliance (random for demo)
      setWeeklyBreaks(45); // 45% compliance rate
    }
  };
  
  const saveResponse = async () => {
    if (focus !== null && stress !== null) {
      const now = new Date();
      
      const newEntry: WellbeingData = {
        date: now.toISOString(),
        focus,
        stress,
        user_id: user?.id
      };
      
      // Save to Supabase if logged in
      if (user?.id) {
        try {
          const { error } = await supabase
            .from('user_wellbeing')
            .insert({
              user_id: user.id,
              date: now.toISOString(),
              focus,
              stress
            });
          
          if (error) {
            console.error('Error saving wellbeing data:', error);
            throw error;
          }
        } catch (err) {
          console.error('Failed to save wellbeing data to Supabase:', err);
        }
      }
      
      const newData = [newEntry, ...wellbeingData];
      setWellbeingData(newData);
      
      // Save to localStorage as backup
      localStorage.setItem('wellbeingData', JSON.stringify(newData));
      
      // Recalculate weekly stats
      calculateWeeklyStats(newData);
      
      // Show appropriate suggestions
      if (stress >= 4) {
        toast({
          title: "Take a breather",
          description: "You seem stressed. How about a short walk or a 60-second breathing exercise?",
          duration: 10000,
        });
      } else if (focus <= 2) {
        const nextPomodoroTime = new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        toast({
          title: "Focus boost",
          description: `Try a 10-minute break. Your next study session can start at ${nextPomodoroTime}.`,
          duration: 10000,
        });
      }
      
      // Reset and close the popup
      setFocus(null);
      setStress(null);
      setIsOpen(false);
    }
  };

  // Emoji for focus and stress scales
  const focusEmojis = ['😩', '😕', '😐', '🙂', '😊'];
  const stressEmojis = ['😐', '😟', '😣', '😥', '😰'];
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        className="w-full mb-4"
      >
        How am I feeling?
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Wellbeing Check</CardTitle>
                <CardDescription>
                  A quick check on how you're doing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Rate your current focus</p>
                  <div className="flex justify-between">
                    {focusEmojis.map((emoji, index) => (
                      <button 
                        key={index} 
                        className={`text-2xl transition-transform ${focus === index ? 'transform scale-125' : ''}`}
                        onClick={() => setFocus(index)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">How stressed do you feel?</p>
                  <div className="flex justify-between">
                    {stressEmojis.map((emoji, index) => (
                      <button 
                        key={index} 
                        className={`text-2xl transition-transform ${stress === index ? 'transform scale-125' : ''}`}
                        onClick={() => setStress(index)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveResponse} disabled={focus === null || stress === null}>
                  Done
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Weekly Trends</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Focus</span>
                <span className="text-sm font-medium">{Math.round(weeklyFocus)}%</span>
              </div>
              <Progress value={weeklyFocus} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Stress Management</span>
                <span className="text-sm font-medium">{Math.round(weeklyStress)}%</span>
              </div>
              <Progress value={weeklyStress} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Break Compliance</span>
                <span className="text-sm font-medium">{weeklyBreaks}%</span>
              </div>
              <Progress value={weeklyBreaks} className="h-2" />
            </div>
          </div>
        </div>
        
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
          <h3 className="font-medium mb-2">Wellbeing Insights</h3>
          <ul className="space-y-2 text-sm">
            {weeklyFocus > 70 && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Great job! Your focus levels this week are excellent. Keep up the good work.</span>
              </li>
            )}
            
            {weeklyFocus < 50 && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your focus is lower than usual this week. Consider trying the Pomodoro Technique to improve concentration.</span>
              </li>
            )}
            
            {weeklyStress < 60 && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Your stress levels are elevated. Try incorporating short meditation or deep breathing exercises.</span>
              </li>
            )}
            
            {weeklyBreaks < 50 && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>You've only taken {Math.round(weeklyBreaks/100 * 20)} out of 20 suggested breaks this week. Regular breaks can help maintain focus.</span>
              </li>
            )}
            
            {wellbeingData.length > 0 && wellbeingData.length < 3 && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Keep tracking your wellbeing daily to get more personalized insights.</span>
              </li>
            )}
            
            {wellbeingData.length === 0 && (
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Start tracking your wellbeing daily to get personalized insights.</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
