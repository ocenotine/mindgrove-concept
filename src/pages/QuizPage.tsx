
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Book, Edit, Play, Share, Trash } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDocuments } from '@/hooks/useDocuments';

interface Question {
  id: string;
  type: 'mcq' | 'truefalse' | 'shortanswer';
  text: string;
  options?: string[];
  correctAnswer: string | boolean;
}

interface SavedQuiz {
  id: string;
  documentId?: string;
  name: string;
  questions: Question[];
  createdAt: string;
  lastTaken?: string;
}

export default function QuizPage() {
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([]);
  const { user } = useAuthStore();
  const { documents } = useDocuments();
  
  useEffect(() => {
    const fetchSavedQuizzes = async () => {
      if (!user?.id) return;
      
      try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('quizzes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching quizzes:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          setSavedQuizzes(data.map(quiz => ({
            id: quiz.id,
            documentId: quiz.document_id || undefined,
            name: quiz.name,
            questions: quiz.questions as Question[],
            createdAt: quiz.created_at,
            lastTaken: quiz.last_taken || 'Never'
          })));
          return;
        }
      } catch (err) {
        console.error('Error loading quizzes from Supabase:', err);
      }
      
      // Fallback to localStorage
      try {
        const localQuizzes = localStorage.getItem('savedQuizzes');
        if (localQuizzes) {
          setSavedQuizzes(JSON.parse(localQuizzes));
        }
      } catch (err) {
        console.error('Error loading quizzes from localStorage:', err);
      }
    };
    
    fetchSavedQuizzes();
  }, [user?.id]);
  
  const handleDeleteQuiz = async (id: string) => {
    try {
      // Try to delete from Supabase
      if (user?.id) {
        const { error } = await supabase
          .from('quizzes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error deleting quiz:', error);
          throw error;
        }
      }
      
      // Update local state
      setSavedQuizzes(prev => prev.filter(quiz => quiz.id !== id));
      
      // Also update localStorage
      const localQuizzes = JSON.parse(localStorage.getItem('savedQuizzes') || '[]');
      localStorage.setItem('savedQuizzes', JSON.stringify(localQuizzes.filter((quiz: SavedQuiz) => quiz.id !== id)));
      
      toast({
        title: 'Quiz deleted',
        description: 'The quiz has been removed'
      });
    } catch (err) {
      console.error('Error deleting quiz:', err);
      toast({
        title: 'Failed to delete quiz',
        description: 'Please try again later',
        variant: 'destructive'
      });
    }
  };
  
  const getDocumentTitle = (documentId: string | undefined) => {
    if (!documentId) return 'Unknown Document';
    const document = documents.find(doc => doc.id === documentId);
    return document?.title || 'Unknown Document';
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Quiz Generator</h1>
            <p className="text-muted-foreground">
              Create, save, and practice with AI-generated quizzes from your study materials
            </p>
          </div>
          
          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList className="mb-4">
              <TabsTrigger value="generate">Generate Quiz</TabsTrigger>
              <TabsTrigger value="saved">My Quizzes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate">
              <QuizGenerator />
            </TabsContent>
            
            <TabsContent value="saved">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {savedQuizzes.length > 0 ? (
                  savedQuizzes.map((quiz) => (
                    <Card key={quiz.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle>{quiz.name}</CardTitle>
                          <div className="p-1 bg-primary/10 rounded-full">
                            <ListChecks className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <CardDescription>
                          {quiz.questions.length} questions • Last taken: {quiz.lastTaken || 'Never'}<br/>
                          <span className="text-xs">From: {getDocumentTitle(quiz.documentId)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between gap-2 mt-2">
                          <Button className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors gap-1">
                            <Play className="h-4 w-4" />
                            Practice
                          </Button>
                          <Button className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-md transition-colors gap-1">
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors gap-1">
                            <Share className="h-4 w-4" />
                            Share
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="px-2 py-1 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-3 border-dashed">
                    <CardHeader className="text-center pb-2">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-3 bg-muted rounded-full">
                          <Book className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                      <CardTitle className="text-xl text-muted-foreground">No Quizzes Yet</CardTitle>
                      <CardDescription className="max-w-md mx-auto">
                        Create your first quiz by selecting a document in the "Generate Quiz" tab.
                        AI will help you create study questions based on your documents.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center pb-6">
                      <Button onClick={() => document.querySelector('[data-value="generate"]')?.dispatchEvent(new Event('click'))}>
                        Generate Your First Quiz
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
