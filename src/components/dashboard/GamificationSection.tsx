
import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BadgeSystem from '@/components/gamification/BadgeSystem';

interface GamificationSectionProps {
  streakCount: number;
  documentsCount: number;
}

const GamificationSection = ({ streakCount, documentsCount }: GamificationSectionProps) => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4">Your Achievements</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Streak Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Login Streak</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Keep up the daily momentum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{streakCount} days</div>
              <div className="text-xs text-muted-foreground mt-1">
                {streakCount > 0 ? `You're on a roll! Last login was today.` : `Start your streak today!`}
              </div>
            </CardContent>
          </Card>
          
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Research Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Documents analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentsCount}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {documentsCount > 0 ? `Great work! Keep building your library.` : `Upload your first document to get started.`}
              </div>
            </CardContent>
          </Card>
          
          {/* Achievements Card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Badges</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Your earned achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[streakCount >= 3, streakCount >= 7, documentsCount >= 5, documentsCount >= 10].filter(Boolean).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Unlock more badges as you use MindGrove
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Badge System */}
        <BadgeSystem streakCount={streakCount} documentsCount={documentsCount} />
      </motion.div>
    </div>
  );
};

export default GamificationSection;
