
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import FlashcardDeck from '@/components/flashcards/FlashcardDeck';
import { motion } from 'framer-motion';
import { PlusCircle, Layers, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

// Define a consistent Flashcard interface across the app
export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  documentId?: string;
  document_id?: string;
  createdAt?: string;
  created_at?: string;
  userId?: string;
  user_id?: string;
  front_content?: string;
  back_content?: string;
}

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchFlashcards();
    } else {
      // If not logged in, try to use localStorage as fallback
      const storedFlashcards = localStorage.getItem('flashcards');
      if (storedFlashcards) {
        setFlashcards(JSON.parse(storedFlashcards));
      }
      setIsLoading(false);
    }
  }, [user]);

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Map database fields to our flashcard interface
      const formattedFlashcards = data.map(card => ({
        id: card.id,
        question: card.front_content || '',
        answer: card.back_content || '',
        front_content: card.front_content || '',
        back_content: card.back_content || '',
        documentId: card.document_id || '',
        createdAt: card.created_at || '',
        userId: card.user_id || ''
      }));
      
      setFlashcards(formattedFlashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      toast({
        title: "Error loading flashcards",
        description: "There was a problem fetching your flashcards.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addFlashcard = async () => {
    if (newQuestion && newAnswer) {
      try {
        const newCard: Omit<Flashcard, 'id'> = {
          question: newQuestion,
          answer: newAnswer,
          front_content: newQuestion,
          back_content: newAnswer,
          userId: user?.id,
          createdAt: new Date().toISOString()
        };
        
        if (user) {
          // Add to database if user is logged in
          const { data, error } = await supabase
            .from('flashcards')
            .insert({
              front_content: newQuestion,
              back_content: newAnswer,
              user_id: user.id
            })
            .select()
            .single();
            
          if (error) throw error;
          
          // Add to state with database id
          setFlashcards(prev => [{
            id: data.id,
            question: data.front_content,
            answer: data.back_content,
            documentId: data.document_id,
            createdAt: data.created_at,
            userId: data.user_id
          }, ...prev]);
        } else {
          // Add to local state with generated id
          const localCard = {
            ...newCard,
            id: `local_${Date.now()}`
          };
          setFlashcards(prev => [localCard, ...prev]);
          
          // Save to localStorage
          const updatedFlashcards = [localCard, ...flashcards];
          localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
        }
        
        setNewQuestion('');
        setNewAnswer('');
        setIsAdding(false);
        
        toast({
          title: "Flashcard created",
          description: "Your new flashcard has been added to the deck",
        });
      } catch (error) {
        console.error('Error creating flashcard:', error);
        toast({
          title: "Error creating flashcard",
          description: "There was a problem creating your flashcard.",
          variant: "destructive"
        });
      }
    }
  };

  const deleteFlashcard = async (id: string) => {
    try {
      if (user && !id.startsWith('local_')) {
        // Delete from database
        const { error } = await supabase
          .from('flashcards')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
      }
      
      // Remove from state
      setFlashcards(flashcards.filter(card => card.id !== id));
      
      // Update localStorage if using it
      if (!user) {
        const updatedFlashcards = flashcards.filter(card => card.id !== id);
        localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
      }
      
      toast({
        title: "Flashcard deleted",
        description: "The flashcard has been removed from your deck",
      });
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast({
        title: "Error deleting flashcard",
        description: "There was a problem removing your flashcard.",
        variant: "destructive"
      });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <MainLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto py-8 space-y-8"
      >
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Flashcards</h1>
              <p className="text-muted-foreground">Create and study flashcards to improve your learning</p>
            </div>
            
            <Button 
              onClick={() => setIsAdding(!isAdding)} 
              className="flex items-center gap-2"
            >
              {isAdding ? 'Cancel' : (
                <>
                  <PlusCircle className="h-4 w-4" />
                  Add Flashcard
                </>
              )}
            </Button>
          </div>
        </motion.div>
        
        {isAdding && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border border-primary/20 bg-background/50 backdrop-blur-sm shadow-lg mb-8">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Create New Flashcard
                </CardTitle>
                <CardDescription>Add question and answer to create a new flashcard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      type="text"
                      placeholder="Enter your question"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="answer">Answer</Label>
                    <Input
                      id="answer"
                      type="text"
                      placeholder="Enter the answer"
                      value={newAnswer}
                      onChange={(e) => setNewAnswer(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button onClick={addFlashcard} disabled={!newQuestion || !newAnswer}>Create Flashcard</Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="min-h-[400px]">
          {isLoading ? (
            <Card className="bg-background/50 backdrop-blur-md border border-border/40 p-10 flex flex-col items-center justify-center h-64 text-center shadow-md">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-lg font-medium mb-2">Loading flashcards...</h3>
            </Card>
          ) : flashcards.length === 0 ? (
            <Card className="bg-background/50 backdrop-blur-md border border-border/40 p-10 flex flex-col items-center justify-center h-64 text-center shadow-md">
              <Layers className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No flashcards yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create your first flashcard to start studying and improving your knowledge retention
              </p>
              <Button onClick={() => setIsAdding(true)}>Create Your First Flashcard</Button>
            </Card>
          ) : (
            <Card className="border border-border/40 bg-background/50 backdrop-blur-md p-6 shadow-md">
              <FlashcardDeck 
                flashcards={flashcards} 
                onDelete={deleteFlashcard} 
              />
            </Card>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
};

export default FlashcardsPage;
