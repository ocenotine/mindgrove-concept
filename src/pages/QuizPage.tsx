
import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import QuizGenerator from '@/components/quiz/QuizGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Book, ListChecks, Loader, Share2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
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
          const userDocIds = documents.filter(d => d.user_id === user?.id).map(d => d.id);
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
        
        toast({
          title: "Quiz deleted",
          description: "The quiz has been successfully deleted."
        });
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error deleting quiz",
        description: "There was a problem deleting the quiz.",
        variant: "destructive"
      });
    }
  };
  
  const handlePracticeQuiz = (quizId: string) => {
    navigate(`/quiz/practice/${quizId}`);
    
    // For now, just show a toast since we haven't implemented the practice page
    toast({
      title: "Practice mode",
      description: "Starting quiz practice session..."
    });
    
    // Update "last taken" timestamp
    try {
      const savedQuizzesStr = localStorage.getItem('savedQuizzes');
      if (savedQuizzesStr) {
        const parsedQuizzes = JSON.parse(savedQuizzesStr);
        const updatedQuizzes = parsedQuizzes.map(quiz => {
          if (quiz.id === quizId) {
            return {
              ...quiz,
              lastTaken: new Date().toISOString()
            };
          }
          return quiz;
        });
        
        localStorage.setItem('savedQuizzes', JSON.stringify(updatedQuizzes));
        
        // Refresh the quiz list
        const userDocIds = documents.filter(d => d.user_id === user?.id).map(d => d.id);
        const userQuizzes = updatedQuizzes
          .filter(quiz => userDocIds.includes(quiz.documentId))
          .map(quiz => ({
            id: quiz.id,
            documentId: quiz.documentId,
            name: quiz.name,
            questions: quiz.questions.length,
            lastTaken: quiz.lastTaken || 'Never'
          }));
          
        setSavedQuizzes(userQuizzes);
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };
  
  const handleEditQuiz = (quizId: string) => {
    navigate(`/quiz/edit/${quizId}`);
    
    // For now, just show a toast since we haven't implemented the edit page
    toast({
      title: "Edit mode",
      description: "Opening quiz editor..."
    });
  };
  
  const handleShareQuiz = (quiz: QuizInfo) => {
    // Create share URL or copy quiz data
    const shareText = `Check out my quiz: ${quiz.name} (${quiz.questions} questions)`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Quiz link copied",
        description: "Share link has been copied to clipboard"
      });
    }).catch(err => {
      console.error("Error copying to clipboard:", err);
      toast({
        title: "Could not copy link",
        description: "There was a problem creating the share link",
        variant: "destructive"
      });
    });
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
              <QuizGenerator onQuizGenerated={() => {
                // Refresh the quiz list when a new quiz is generated
                if (user?.id) {
                  setIsLoading(true);
                  setTimeout(() => {
                    const loadSavedQuizzes = () => {
                      try {
                        const savedQuizzesStr = localStorage.getItem('savedQuizzes');
                        if (savedQuizzesStr) {
                          const parsedQuizzes = JSON.parse(savedQuizzesStr);
                          const userDocIds = documents.filter(d => d.user_id === user?.id).map(d => d.id);
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
                        }
                      } catch (error) {
                        console.error("Error loading quizzes:", error);
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    
                    loadSavedQuizzes();
                  }, 500);
                }
              }} />
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
                      <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle>{quiz.name}</CardTitle>
                            <div className="p-1 bg-primary/10 rounded-full">
                              <ListChecks className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <CardDescription>
                            {quiz.questions} questions • Last taken: {typeof quiz.lastTaken === 'string' && quiz.lastTaken !== 'Never' 
                              ? new Date(quiz.lastTaken).toLocaleDateString() 
                              : quiz.lastTaken}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between gap-2 mt-2">
                            <button 
                              className="px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                              onClick={() => handlePracticeQuiz(quiz.id)}
                            >
                              Practice
                            </button>
                            <button 
                              className="px-3 py-1 text-sm bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-md transition-colors"
                              onClick={() => handleEditQuiz(quiz.id)}
                            >
                              Edit
                            </button>
                            <button 
                              className="px-3 py-1 text-sm bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 rounded-md transition-colors"
                              onClick={() => handleShareQuiz(quiz)}
                            >
                              <Share2 className="h-3 w-3 inline mr-1" />
                              Share
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
