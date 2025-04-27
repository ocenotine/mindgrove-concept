
import MainLayout from '@/components/layout/MainLayout';
import { PageTransition } from '@/components/animations/PageTransition';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Book, ListChecks } from 'lucide-react';

export default function QuizPage() {
  // Mock saved quizzes
  const savedQuizzes = [
    { id: '1', title: 'Physics Fundamentals', questions: 10, lastTaken: '2 days ago' },
    { id: '2', title: 'History Mid-term Prep', questions: 15, lastTaken: '1 week ago' },
    { id: '3', title: 'Computer Science Basics', questions: 8, lastTaken: 'Never' },
  ];

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
                {savedQuizzes.map((quiz) => (
                  <Card key={quiz.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle>{quiz.title}</CardTitle>
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
                        <button className="px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors">
                          Share
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Empty state card */}
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
                    <button className="w-full px-3 py-1 text-sm bg-muted hover:bg-muted/80 rounded-md transition-colors">
                      Generate New Quiz
                    </button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PageTransition>
    </MainLayout>
  );
}
