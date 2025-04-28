
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface UserStats {
  documentCount: number;
  flashcardCount: number;
  streakCount: number;
}

export default function ProfileStats() {
  const [stats, setStats] = useState<UserStats>({
    documentCount: 0,
    flashcardCount: 0,
    streakCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('document_count, flashcard_count, streak_count')
        .eq('id', user?.id)
        .single();
        
      // Count documents directly
      const { count: docCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      // Count flashcards directly
      const { count: cardCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);
      
      // Use counts from DB or direct counts as fallback
      setStats({
        documentCount: profileData?.document_count || docCount || 0,
        flashcardCount: profileData?.flashcard_count || cardCount || 0,
        streakCount: profileData?.streak_count || 0
      });
      
      // Update profile with correct counts if needed
      if (profileData && (docCount !== profileData.document_count || cardCount !== profileData.flashcard_count)) {
        await supabase
          .from('profiles')
          .update({
            document_count: docCount,
            flashcard_count: cardCount
          })
          .eq('id', user?.id);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
      <Card className="bg-blue-50/50 dark:bg-blue-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-500" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-blue-100 dark:bg-blue-800/20 rounded animate-pulse"></div>
            ) : (
              stats.documentCount
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Total documents created</p>
        </CardContent>
      </Card>
      
      <Card className="bg-purple-50/50 dark:bg-purple-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <BookOpen className="h-4 w-4 mr-2 text-purple-500" />
            Flashcards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-purple-100 dark:bg-purple-800/20 rounded animate-pulse"></div>
            ) : (
              stats.flashcardCount
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Flashcards created</p>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50/50 dark:bg-green-900/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-green-500" />
            Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-16 bg-green-100 dark:bg-green-800/20 rounded animate-pulse"></div>
            ) : (
              stats.streakCount
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Days studied in a row</p>
        </CardContent>
      </Card>
    </div>
  );
}
