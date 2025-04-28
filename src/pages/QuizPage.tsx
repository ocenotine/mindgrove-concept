import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Book, ListChecks, Loader } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';

interface QuizInfo {
  id: string; 
  documentId: string;
  name: string; 
  questions: number;
  lastTaken: string;
}

export default function QuizPage() {
  const [savedQuizzes, setSavedQuizzes] = useState<QuizInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { documents } = useDocuments();
  
  useEffect(() => {
    const loadSavedQuizzes = () => {
      setIsLoading(true);
      // Load quizzes from localStorage for now (would be from database in production)
      try {
        const savedQuizzesStr = localStorage.getItem('savedQuizzes');
        if (savedQuizzesStr) {
          const parsedQuizzes = JSON.parse(savedQuizzesStr);
          // Map to the quiz info format expected by the UI
          // Only show quizzes for this user (using document ownership as proxy)
          const userDocIds = documents.filter(d => d.userId === user?.id).map(d => d.id);
          const userQuizzes = parsedQuizzes
            .filter(quiz => userDocIds.includes(quiz.documentId))
            .map(quiz => ({
              id: quiz.id,
              documentId: quiz.documentId,
              name: quiz.name,
              questions: quiz.questions.length,
              lastTaken: quiz.lastTaken || 'Never'
            }));
            
          setSavedQuizzes(userQuizzes);
        } else {
          setSavedQuizzes([]);
        }
      } catch (error) {
        console.error("Error loading quizzes:", error);
        setSavedQuizzes([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user?.id) {
      loadSavedQuizzes();
    }
  }, [user?.id, documents]);

  const handleDeleteQuiz = (id: string) => {
    try {
      const savedQuizzesStr = localStorage.getItem('savedQuizzes');
      if (savedQuizzesStr) {
        const parsedQuizzes = JSON.parse(savedQuizzesStr);
        const updatedQuizzes = parsedQuizzes.filter(quiz => quiz.id !== id);
        localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
        
        // Update the UI
        setSavedQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== id));
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
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
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
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
                            {quiz.questions} questions • Last taken: {quiz.lastTaken}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between gap-2 mt-2">
                            <button className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors">
                              Practice
                            </button>
                            <button className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-md transition-colors">
                              Edit
                            </button>
                            <button 
                              className="px-3 py-1 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors"
                              onClick={() => handleDeleteQuiz(quiz.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="col-span-3 border-dashed">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-muted-foreground">No Saved Quizzes</CardTitle>
                          <div className="p-1 bg-muted rounded-full">
                            <Book className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                        <CardDescription>
                          Generate and save quizzes from your documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-center py-4 text-muted-foreground">
                          You haven't saved any quizzes yet. Go to the "Generate Quiz" tab to create your first quiz.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  <Card className="border-dashed">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-muted-foreground">Create New Quiz</CardTitle>
                        <div className="p-1 bg-muted rounded-full">
                          <Book className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      <CardDescription>
                        Generate a quiz from your documents
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <button 
                        className="w-full px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors"
                        onClick={() => document.querySelector('[value="generate"]')?.dispatchEvent(new Event('click'))}
                      >
                        Generate New Quiz
                      </button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
