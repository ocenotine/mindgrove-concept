
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flashcard as FlashcardType } from '@/utils/mockData';
import MainLayout from '@/components/layout/MainLayout';
import FlashcardDeck from '@/components/flashcards/FlashcardDeck';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Layers, Sparkles, Book, Brain, Search, Tag, BarChart, ArrowRight } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useDocuments } from '@/hooks/useDocuments';
import { generateFlashcards } from '@/utils/nlpUtils';

interface StudySession {
  id: string;
  date: string;
  accuracy: number;
  timeSpent: number;
  cardsReviewed: number;
}

interface DeckStats {
  totalCards: number;
  masteredCards: number;
  nextReviewDate: Date | null;
  lastStudied: Date | null;
}

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'review'>('grid');
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [decks, setDecks] = useState<Record<string, FlashcardType[]>>({});
  const [deckStats, setDeckStats] = useState<Record<string, DeckStats>>({});
  const [studyHistory, setStudyHistory] = useState<StudySession[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  
  const { user } = useAuthStore();
  const { documents } = useDocuments();

  // Load flashcards from Supabase or local storage
  useEffect(() => {
    const loadFlashcards = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('flashcards')
            .select('*')
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          if (data && data.length > 0) {
            const cards = data.map(card => ({
              id: card.id,
              question: card.front_content,
              answer: card.back_content,
              front_content: card.front_content,
              back_content: card.back_content,
              documentId: card.document_id,
              createdAt: card.created_at,
              userId: card.user_id,
            }));
            
            setFlashcards(cards);
            
            // Group cards by document_id to create decks
            const deckMap: Record<string, FlashcardType[]> = {};
            cards.forEach(card => {
              const deckId = card.documentId || 'general';
              if (!deckMap[deckId]) {
                deckMap[deckId] = [];
              }
              deckMap[deckId].push(card);
            });
            setDecks(deckMap);
            
            // Create stats for each deck
            const statsMap: Record<string, DeckStats> = {};
            Object.keys(deckMap).forEach(deckId => {
              statsMap[deckId] = {
                totalCards: deckMap[deckId].length,
                masteredCards: Math.floor(Math.random() * deckMap[deckId].length),
                nextReviewDate: new Date(Date.now() + Math.random() * 86400000 * 3),
                lastStudied: new Date(Date.now() - Math.random() * 86400000 * 7)
              };
            });
            setDeckStats(statsMap);
            
            return;
          }
        } catch (err) {
          console.error('Error loading flashcards:', err);
        }
      }
      
      // Fallback to localStorage
      const storedFlashcards = localStorage.getItem('flashcards');
      if (storedFlashcards) {
        const cards = JSON.parse(storedFlashcards);
        setFlashcards(cards);
        
        // Group cards for decks
        const deckMap: Record<string, FlashcardType[]> = {};
        cards.forEach((card: FlashcardType) => {
          const deckId = card.documentId || 'general';
          if (!deckMap[deckId]) {
            deckMap[deckId] = [];
          }
          deckMap[deckId].push(card);
        });
        setDecks(deckMap);
      }
    };
    
    // Generate mock study history data
    const generateStudyHistory = () => {
      const history: StudySession[] = [];
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        
        history.push({
          id: `session-${i}`,
          date: date.toISOString(),
          accuracy: 40 + Math.random() * 60,
          timeSpent: 5 + Math.random() * 20,
          cardsReviewed: 5 + Math.floor(Math.random() * 20)
        });
      }
      
      setStudyHistory(history);
    };
    
    loadFlashcards();
    generateStudyHistory();
  }, [user?.id]);

  // Save flashcards to storage whenever they change
  useEffect(() => {
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = () => {
    if (newQuestion && newAnswer) {
      const newCard: FlashcardType = {
        id: String(Date.now()),
        question: newQuestion,
        answer: newAnswer,
        front_content: newQuestion,
        back_content: newAnswer,
        documentId: selectedDocument || 'general',
        createdAt: new Date().toISOString(),
        userId: user?.id || 'default-user', 
      };
      
      // Save to Supabase if user is logged in
      if (user?.id) {
        supabase
          .from('flashcards')
          .insert({
            front_content: newQuestion,
            back_content: newAnswer,
            document_id: selectedDocument,
            user_id: user.id
          })
          .then(({ error, data }) => {
            if (error) {
              console.error('Error saving flashcard:', error);
            } else if (data && data[0]) {
              newCard.id = data[0].id;
            }
          });
      }
      
      setFlashcards([...flashcards, newCard]);
      
      // Update the deck
      const deckId = selectedDocument || 'general';
      setDecks(prev => ({
        ...prev,
        [deckId]: [...(prev[deckId] || []), newCard]
      }));
      
      setNewQuestion('');
      setNewAnswer('');
      setIsAdding(false);
      
      toast({
        title: "Flashcard created",
        description: "Your new flashcard has been added to the deck",
      });
    }
  };

  const deleteFlashcard = (id: string) => {
    // Delete from Supabase if user is logged in
    if (user?.id) {
      supabase
        .from('flashcards')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Error deleting flashcard:', error);
          }
        });
    }
    
    const updatedCards = flashcards.filter(card => card.id !== id);
    setFlashcards(updatedCards);
    
    // Update decks
    const newDecks = { ...decks };
    Object.keys(newDecks).forEach(deckId => {
      newDecks[deckId] = newDecks[deckId].filter(card => card.id !== id);
    });
    setDecks(newDecks);
    
    toast({
      title: "Flashcard deleted",
      description: "The flashcard has been removed from your deck",
    });
  };
  
  const handleGenerateFlashcards = async () => {
    if (!selectedDocument) {
      toast({
        title: "No document selected",
        description: "Please select a document to generate flashcards from",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const document = documents.find(doc => doc.id === selectedDocument);
      
      if (!document || !document.content) {
        throw new Error("Document has no content to generate flashcards from");
      }
      
      const result = await generateFlashcards(document.id, document.content);
      
      if (!result.success || !result.flashcards || result.flashcards.length === 0) {
        throw new Error(result.error || "Failed to generate flashcards");
      }
      
      // Save generated flashcards
      const newFlashcards = result.flashcards.map(card => ({
        id: String(Date.now()) + Math.random().toString(36).substring(2, 9),
        question: card.question,
        answer: card.answer,
        front_content: card.question,
        back_content: card.answer,
        documentId: document.id,
        createdAt: new Date().toISOString(),
        userId: user?.id || 'default-user',
      }));
      
      // Save to Supabase if user is logged in
      if (user?.id) {
        const supabaseCards = newFlashcards.map(card => ({
          front_content: card.question,
          back_content: card.answer,
          document_id: document.id,
          user_id: user.id
        }));
        
        supabase
          .from('flashcards')
          .insert(supabaseCards)
          .then(({ error }) => {
            if (error) {
              console.error('Error saving generated flashcards:', error);
            }
          });
      }
      
      setFlashcards(prev => [...prev, ...newFlashcards]);
      
      // Update the deck
      setDecks(prev => ({
        ...prev,
        [document.id]: [...(prev[document.id] || []), ...newFlashcards]
      }));
      
      toast({
        title: "Flashcards generated",
        description: `${newFlashcards.length} flashcards created from your document`,
      });
      
      setShowAIGenerator(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
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

  const filteredDecks = Object.entries(decks).filter(([deckId, cards]) => {
    if (searchTerm === '') return true;
    
    // Find the document title if this is a document-based deck
    const document = documents.find(doc => doc.id === deckId);
    const deckTitle = document?.title || 'General Deck';
    
    return deckTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cards.some(card => 
        card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.answer.toLowerCase().includes(searchTerm.toLowerCase())
      );
  });

  // Handle deck selection
  const handleSelectDeck = (deckId: string) => {
    setSelectedDeck(deckId);
    setViewMode('review');
  };
  
  // Get deck title
  const getDeckTitle = (deckId: string) => {
    if (deckId === 'general') return 'General Deck';
    const document = documents.find(doc => doc.id === deckId);
    return document?.title || 'Untitled Deck';
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
              <h1 className="text-3xl font-bold mb-1">Study Hub</h1>
              <p className="text-muted-foreground">Create and study flashcards to boost your memory retention</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setShowAIGenerator(!showAIGenerator)} 
                className="flex items-center gap-2"
                variant={showAIGenerator ? "secondary" : "default"}
              >
                <Brain className="h-4 w-4" />
                AI Generate
              </Button>
              <Button 
                onClick={() => setIsAdding(!isAdding)} 
                className="flex items-center gap-2"
              >
                {isAdding ? 'Cancel' : (
                  <>
                    <PlusCircle className="h-4 w-4" />
                    Add Card
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
        
        <AnimatePresence>
          {showAIGenerator && (
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
                    AI Flashcard Generation
                  </CardTitle>
                  <CardDescription>Generate flashcards from your uploaded documents using AI</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="document">Select Document</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {documents.length === 0 ? (
                          <div className="col-span-3 text-center py-4">
                            <p className="text-muted-foreground">No documents found</p>
                            <p className="text-sm text-muted-foreground">Upload documents to generate flashcards</p>
                          </div>
                        ) : (
                          documents.map(doc => (
                            <Button
                              key={doc.id}
                              variant={selectedDocument === doc.id ? "default" : "outline"}
                              onClick={() => setSelectedDocument(doc.id)}
                              className="justify-start overflow-hidden"
                            >
                              <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{doc.title}</span>
                            </Button>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowAIGenerator(false)}>Cancel</Button>
                  <Button 
                    onClick={handleGenerateFlashcards} 
                    disabled={isGenerating || !selectedDocument}
                  >
                    {isGenerating ? "Generating..." : "Generate Flashcards"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        
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
                    <div className="space-y-2">
                      <Label htmlFor="deck">Assign to Document (Optional)</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        <Button
                          variant={selectedDocument === null ? "default" : "outline"}
                          onClick={() => setSelectedDocument(null)}
                          className="justify-start"
                        >
                          <Book className="h-4 w-4 mr-2" />
                          General Deck
                        </Button>
                        {documents.map(doc => (
                          <Button
                            key={doc.id}
                            variant={selectedDocument === doc.id ? "default" : "outline"}
                            onClick={() => setSelectedDocument(doc.id)}
                            className="justify-start overflow-hidden"
                          >
                            <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{doc.title}</span>
                          </Button>
                        ))}
                      </div>
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
        </AnimatePresence>
        
        {selectedDeck ? (
          <motion.div variants={itemVariants}>
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedDeck(null);
                  setViewMode('grid');
                }}
                className="mb-2"
              >
                Back to All Decks
              </Button>
              <h2 className="text-2xl font-bold">{getDeckTitle(selectedDeck)}</h2>
              <p className="text-muted-foreground">
                {decks[selectedDeck]?.length || 0} cards • 
                {deckStats[selectedDeck]?.lastStudied 
                  ? ` Last studied: ${new Date(deckStats[selectedDeck]?.lastStudied || '').toLocaleDateString()}`
                  : ' Never studied'}
              </p>
            </div>
            
            <Tabs defaultValue="review" className="space-y-4">
              <TabsList>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="quiz">Quiz Mode</TabsTrigger>
                <TabsTrigger value="spaced">Spaced Repetition</TabsTrigger>
                <TabsTrigger value="stats">Analytics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="review">
                <Card className="border border-border/40 bg-background/50 backdrop-blur-md p-6 shadow-md">
                  <FlashcardDeck 
                    flashcards={decks[selectedDeck] || []} 
                    onDelete={deleteFlashcard} 
                    documentTitle={getDeckTitle(selectedDeck)}
                  />
                </Card>
              </TabsContent>
              
              <TabsContent value="quiz">
                <Card className="border border-border/40 bg-background/50 backdrop-blur-md p-6 shadow-md">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Quiz Mode</h3>
                      <p className="text-muted-foreground">Test your knowledge by typing answers</p>
                    </div>
                    
                    {(decks[selectedDeck] || []).length > 0 ? (
                      <div className="space-y-6">
                        <div className="bg-muted/20 p-6 rounded-lg">
                          <h4 className="text-lg font-medium mb-4">{decks[selectedDeck]?.[0]?.question}</h4>
                          <Input placeholder="Type your answer..." />
                        </div>
                        
                        <div className="flex justify-between">
                          <Button variant="outline">Skip</Button>
                          <Button>Check Answer</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground">No flashcards available in this deck</p>
                    )}
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="spaced">
                <Card className="border border-border/40 bg-background/50 backdrop-blur-md p-6 shadow-md">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Spaced Repetition</h3>
                      <p className="text-muted-foreground">Study using an optimized review schedule</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">New Cards</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{Math.floor(decks[selectedDeck]?.length * 0.3) || 0}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Learning</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{Math.floor(decks[selectedDeck]?.length * 0.5) || 0}</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-2xl font-bold">{Math.floor(decks[selectedDeck]?.length * 0.2) || 0}</p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button>Start Study Session</Button>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Upcoming Reviews</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <span>Tomorrow</span>
                          <span className="font-medium">{Math.floor(decks[selectedDeck]?.length * 0.4) || 0} cards</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <span>In 3 days</span>
                          <span className="font-medium">{Math.floor(decks[selectedDeck]?.length * 0.3) || 0} cards</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                          <span>In 1 week</span>
                          <span className="font-medium">{Math.floor(decks[selectedDeck]?.length * 0.3) || 0} cards</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats">
                <Card className="border border-border/40 bg-background/50 backdrop-blur-md p-6 shadow-md">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">Study Analytics</h3>
                      <p className="text-muted-foreground">Track your progress over time</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Mastery Progress</h4>
                        <div className="space-y-4">
                          <Progress 
                            value={deckStats[selectedDeck]?.masteredCards / (deckStats[selectedDeck]?.totalCards || 1) * 100} 
                            className="h-2"
                          />
                          <p className="text-sm text-muted-foreground">
                            {deckStats[selectedDeck]?.masteredCards || 0} of {deckStats[selectedDeck]?.totalCards || 0} cards mastered
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recent Study Sessions</h4>
                        <div className="space-y-2">
                          {studyHistory.slice(0, 3).map(session => (
                            <div key={session.id} className="flex justify-between items-center p-2 bg-muted/20 rounded text-sm">
                              <span>{new Date(session.date).toLocaleDateString()}</span>
                              <span className="font-medium">{session.cardsReviewed} cards • {Math.round(session.accuracy)}% accuracy</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Area of Focus</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(decks[selectedDeck] || []).slice(0, 4).map((card, index) => (
                          <div key={index} className="p-2 bg-muted/20 rounded flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${index % 3 === 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            <span className="text-sm truncate">{card.question}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-center">
                      <Button variant="outline">Download Full Report</Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search flashcards and decks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="min-h-[400px]">
              {flashcards.length === 0 ? (
                <Card className="bg-background/50 backdrop-blur-md border border-border/40 p-10 flex flex-col items-center justify-center h-96 text-center shadow-md">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: [0, 10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 5 }}
                  >
                    <Brain className="h-24 w-24 text-muted-foreground mb-4 opacity-20" />
                  </motion.div>
                  <h3 className="text-2xl font-medium mb-2">Flashcards boost memory by 72%</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Start creating flashcards to improve your knowledge retention and recall
                  </p>
                  <div className="flex gap-4">
                    <Button onClick={() => setIsAdding(true)} className="gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create First Flashcard
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowAIGenerator(true)}
                      className="gap-2"
                    >
                      <Brain className="h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                </Card>
              ) : (
                <>
                  {viewMode === 'grid' && (
                    <div className="space-y-8">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Your Flashcard Decks</h2>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setViewMode('grid')} className="gap-1">
                            <Tag className="h-4 w-4" />
                            Decks
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setViewMode('review')} className="gap-1">
                            <BarChart className="h-4 w-4" />
                            Performance
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredDecks.length === 0 ? (
                          <p className="text-muted-foreground col-span-3 text-center py-4">
                            No decks match your search
                          </p>
                        ) : (
                          filteredDecks.map(([deckId, cards]) => {
                            const document = documents.find(doc => doc.id === deckId);
                            const deckTitle = getDeckTitle(deckId);
                            const stats = deckStats[deckId] || {
                              totalCards: cards.length,
                              masteredCards: 0,
                              nextReviewDate: null,
                              lastStudied: null
                            };
                            const masteryPercentage = (stats.masteredCards / stats.totalCards) * 100 || 0;
                            
                            return (
                              <motion.div 
                                key={deckId}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card className="h-full cursor-pointer overflow-hidden" onClick={() => handleSelectDeck(deckId)}>
                                  <div 
                                    className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center"
                                  >
                                    <Book className="h-10 w-10 text-primary/40" />
                                  </div>
                                  <CardHeader>
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <CardTitle className="line-clamp-1">{deckTitle}</CardTitle>
                                        <CardDescription>
                                          {cards.length} cards
                                        </CardDescription>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div>
                                      <div className="flex justify-between text-sm">
                                        <span>Mastery</span>
                                        <span>{Math.round(masteryPercentage)}%</span>
                                      </div>
                                      <Progress value={masteryPercentage} className="h-1 mt-1" />
                                    </div>
                                    
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                      <span>
                                        {stats.lastStudied
                                          ? `Last: ${new Date(stats.lastStudied).toLocaleDateString()}`
                                          : 'Never studied'}
                                      </span>
                                      <span className="flex items-center">
                                        <ArrowRight className="h-3 w-3 mr-1" />
                                        Study Now
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            );
                          })
                        )}
                        
                        {/* Create New Deck Button */}
                        <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.98 }}>
                          <Card className="h-full border-dashed cursor-pointer" onClick={() => setIsAdding(true)}>
                            <div className="h-full flex flex-col items-center justify-center p-6">
                              <div className="rounded-full bg-muted/50 p-3 mb-3">
                                <PlusCircle className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <h3 className="text-lg font-medium">Create New Deck</h3>
                              <p className="text-sm text-muted-foreground text-center mt-2">
                                Add flashcards to a new study deck
                              </p>
                            </div>
                          </Card>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </MainLayout>
  );
};

export default FlashcardsPage;
