
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Book, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase, StoredQuiz, QuizQuestion } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { generateQuizQuestions } from '@/utils/nlpUtils';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: string;
  title: string;
  content: string | null;
}

interface QuizGeneratorProps {
  onQuizGenerated?: () => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onQuizGenerated }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedQuizzes, setSavedQuizzes] = useState<StoredQuiz[]>([]);
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // Form values
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>('');
  const [quizName, setQuizName] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  
  // Load user's documents and quizzes
  useEffect(() => {
    if (user) {
      fetchUserDocuments();
      fetchUserQuizzes();
    }
  }, [user]);

  const fetchUserDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, content')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error loading documents",
        description: "Failed to load your documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchUserQuizzes = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Convert data types to match our interface
      const quizzes: StoredQuiz[] = data?.map(quiz => ({
        id: quiz.id,
        user_id: quiz.user_id,
        document_id: quiz.document_id,
        name: quiz.name,
        // Properly cast the JSONB questions array to QuizQuestion[]
        questions: quiz.questions as unknown as QuizQuestion[],
        difficulty: quiz.difficulty,
        last_taken: quiz.last_taken,
        created_at: quiz.created_at,
        updated_at: quiz.updated_at
      })) || [];
      
      setSavedQuizzes(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedDocumentId || !quizName) {
      toast({
        title: "Missing information",
        description: "Please select a document and enter a quiz name.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate quizzes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      // Find the selected document
      const selectedDocument = documents.find(doc => doc.id === selectedDocumentId);
      if (!selectedDocument) {
        throw new Error("Selected document not found");
      }
      
      if (!selectedDocument.content) {
        throw new Error("Document has no content");
      }
      
      console.log("Generating quiz for document:", selectedDocument.title);
      console.log("Document content length:", selectedDocument.content.length);
      
      // Generate quiz using OpenRouter API via nlpUtils
      const result = await generateQuizQuestions(
        selectedDocument.id,
        selectedDocument.content,
        numQuestions,
        difficulty
      );
      
      if (!result.success || !result.questions || result.questions.length === 0) {
        throw new Error(result.error || "Failed to generate quiz questions");
      }
      
      console.log("Generated quiz questions:", result.questions.length);
      
      // Save the quiz to Supabase
      const { error } = await supabase
        .from('quizzes')
        .insert({
          user_id: user.id,
          document_id: selectedDocumentId,
          name: quizName,
          questions: result.questions,
          difficulty: difficulty
        });
        
      if (error) {
        throw error;
      }
      
      // Refresh quizzes
      await fetchUserQuizzes();
      
      toast({
        title: "Quiz generated successfully",
        description: `Your quiz "${quizName}" has been created with ${result.questions.length} questions.`,
      });
      
      // Call the callback function to notify parent component
      if (onQuizGenerated) {
        onQuizGenerated();
      }
      
      // Reset form
      setQuizName('');
      setSelectedDocumentId('');
      
      // Navigate to the saved quizzes tab
      setTimeout(() => {
        document.querySelector('[value="saved"]')?.dispatchEvent(new Event('click'));
      }, 500);
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Quiz generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="border-border/40 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Book className="h-5 w-5 text-primary" />
          Create New Quiz
        </CardTitle>
        <CardDescription>
          Generate a quiz from your documents to test your knowledge
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              You don't have any documents yet. Upload or create a document first to generate a quiz.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="document">Select Document</Label>
              <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                <SelectTrigger id="document">
                  <SelectValue placeholder="Choose a document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quiz-name">Quiz Name</Label>
              <Input 
                id="quiz-name" 
                placeholder="Enter a name for your quiz" 
                value={quizName}
                onChange={(e) => setQuizName(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num-questions">Number of Questions</Label>
                <Select 
                  value={numQuestions.toString()} 
                  onValueChange={(value) => setNumQuestions(Number(value))}
                >
                  <SelectTrigger id="num-questions">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Questions</SelectItem>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          onClick={handleGenerateQuiz}
          disabled={isGenerating || documents.length === 0 || !selectedDocumentId || !quizName}
          className="flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Generate Quiz
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizGenerator;
