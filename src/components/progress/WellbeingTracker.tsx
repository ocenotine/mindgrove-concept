
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

type WellbeingData = {
  date: string;
  focus: number;
  stress: number;
};

export default function WellbeingTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [focus, setFocus] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [wellbeingData, setWellbeingData] = useState<WellbeingData[]>([]);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('wellbeingData');
    if (savedData) {
      try {
        setWellbeingData(JSON.parse(savedData));
      } catch (e) {
        console.error('Error parsing wellbeing data', e);
      }
    }
    
    // Set up timer to show popup after 90 minutes (90 * 60 * 1000 = 5400000 ms)
    // For testing purposes, we'll use a shorter time (30 seconds)
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 30000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const saveResponse = () => {
    if (focus !== null && stress !== null) {
      const newEntry: WellbeingData = {
        date: new Date().toISOString(),
        focus,
        stress,
      };
      
      const newData = [...wellbeingData, newEntry];
      setWellbeingData(newData);
      
      // Save to localStorage
      localStorage.setItem('wellbeingData', JSON.stringify(newData));
      
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
                <Button onClick={saveResponse}>
                  Done
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
