
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  id: string;
  name: string | null;
  avatar_url: string | null;
  streak_count: number;
}

const LeaderboardCard = () => {
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, avatar_url, streak_count')
          .eq('account_type', 'student')
          .gt('streak_count', 0)
          .order('streak_count', { ascending: false })
          .limit(10);
          
        if (error) {
          throw error;
        }
        
        setLeaderboardUsers(data || []);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
    
    // Set up real-time subscription for profiles updates
    const profileSubscription = supabase
      .channel('public:profiles:streak_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles',
          filter: 'account_type=eq.student'
        }, 
        fetchLeaderboard
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, []);
  
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const getRankClass = (rank: number) => {
    switch (rank) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 2:
        return 'bg-gradient-to-r from-amber-600 to-amber-800';
      default:
        return 'bg-muted';
    }
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${rank + 1}`;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="text-lg">Study Streak Leaderboard</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ) : leaderboardUsers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No streak data available yet. Start studying to get on the leaderboard!
          </div>
        ) : (
          <div className="divide-y">
            {leaderboardUsers.map((user, index) => (
              <motion.div 
                key={user.id}
                className={`flex items-center p-3 ${index < 3 ? 'bg-muted/40' : ''}`}
                initial={index < 3 ? { opacity: 0, y: 10 } : { opacity: 0 }}
                animate={index < 3 ? { opacity: 1, y: 0 } : { opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
              >
                <div className={`flex items-center justify-center h-8 w-8 rounded-full ${getRankClass(index)} text-white mr-3`}>
                  {getRankIcon(index)}
                </div>
                
                <Avatar className="h-8 w-8 mr-3">
                  {user.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.name || 'User'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.name || 'Anonymous User'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-sm font-medium">
                  <span className="hidden sm:inline text-muted-foreground mr-1">Streak:</span>
                  <span className="text-primary font-semibold">{user.streak_count}</span>
                  <span className="text-muted-foreground">days</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaderboardCard;
