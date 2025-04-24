
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, Star, Medal, Check } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  level?: number;
}

interface BadgeSystemProps {
  streakCount: number;
  documentsCount?: number;
}

const BadgeSystem = ({ streakCount, documentsCount = 0 }: BadgeSystemProps) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState<Badge | null>(null);
  
  const badges: Badge[] = [
    {
      id: 'streak-3',
      name: 'Consistency Champion',
      description: 'Logged in for 3 days in a row',
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      unlocked: streakCount >= 3,
      progress: streakCount >= 3 ? 100 : (streakCount / 3) * 100
    },
    {
      id: 'streak-7',
      name: 'Weekly Warrior',
      description: 'Maintained a 7-day login streak',
      icon: <Award className="w-8 h-8 text-blue-500" />,
      unlocked: streakCount >= 7,
      progress: streakCount >= 7 ? 100 : (streakCount / 7) * 100
    },
    {
      id: 'documents-5',
      name: 'Document Explorer',
      description: 'Uploaded 5 documents for analysis',
      icon: <Star className="w-8 h-8 text-purple-500" />,
      unlocked: documentsCount >= 5,
      progress: documentsCount >= 5 ? 100 : (documentsCount / 5) * 100
    },
    {
      id: 'documents-10',
      name: 'Research Scholar',
      description: 'Analyzed 10 research papers',
      icon: <Medal className="w-8 h-8 text-green-500" />,
      unlocked: documentsCount >= 10,
      progress: documentsCount >= 10 ? 100 : (documentsCount / 10) * 100
    }
  ];

  // Check for newly unlocked badge
  useEffect(() => {
    const checkNewBadges = () => {
      // Simulate badge unlocking based on current state
      if (streakCount === 3) {
        setUnlockedBadge(badges[0]);
        setShowAnimation(true);
      } else if (streakCount === 7) {
        setUnlockedBadge(badges[1]);
        setShowAnimation(true);
      } else if (documentsCount === 5) {
        setUnlockedBadge(badges[2]);
        setShowAnimation(true);
      } else if (documentsCount === 10) {
        setUnlockedBadge(badges[3]);
        setShowAnimation(true);
      }
    };
    
    checkNewBadges();
  }, [streakCount, documentsCount]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className={`relative ${!badge.unlocked && 'opacity-70'}`}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary/10 rounded-full">
                  {badge.icon}
                </div>
                {badge.unlocked && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Unlocked
                  </span>
                )}
              </div>
              <CardTitle className="mt-2 text-base">{badge.name}</CardTitle>
              <CardDescription>{badge.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${badge.progress}%` }}
                ></div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              {badge.unlocked ? 'Complete!' : `Progress: ${Math.round(badge.progress || 0)}%`}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Badge unlock animation */}
      <AnimatePresence>
        {showAnimation && unlockedBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
            onClick={() => setShowAnimation(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="bg-card rounded-lg shadow-lg p-8 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <motion.div
                  initial={{ rotate: 0, scale: 1 }}
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: 0 }}
                  className="mx-auto mb-4 p-4 bg-primary/10 rounded-full inline-block"
                >
                  {unlockedBadge.icon}
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Badge Unlocked!</h3>
                <p className="text-lg font-semibold mb-1">{unlockedBadge.name}</p>
                <p className="text-muted-foreground mb-6">{unlockedBadge.description}</p>
                <button
                  onClick={() => setShowAnimation(false)}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BadgeSystem;
