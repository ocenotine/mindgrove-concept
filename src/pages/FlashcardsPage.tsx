
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Flashcard } from '@/utils/mockData';
import MainLayout from '@/components/layout/MainLayout';
import FlashcardDeck from '@/components/flashcards/FlashcardDeck';

const FlashcardsPage = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  useEffect(() => {
    // Load flashcards from local storage or an API
    const storedFlashcards = localStorage.getItem('flashcards');
    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    }
  }, []);

  useEffect(() => {
    // Save flashcards to local storage whenever they change
    localStorage.setItem('flashcards', JSON.stringify(flashcards));
  }, [flashcards]);

  const addFlashcard = () => {
    if (newQuestion && newAnswer) {
      const newCard: Flashcard = {
        id: String(Date.now()), // Generate a unique ID
        question: newQuestion,
        answer: newAnswer,
        front_content: newQuestion,
        back_content: newAnswer,
        documentId: 'default',
        createdAt: new Date().toISOString(),
        userId: 'default-user', 
      };
      setFlashcards([...flashcards, newCard]);
      setNewQuestion('');
      setNewAnswer('');
    }
  };

  const deleteFlashcard = (id: string) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Flashcards</CardTitle>
            <CardDescription>Create and manage your flashcards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  type="text"
                  placeholder="Enter question"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="answer">Answer</Label>
                <Input
                  id="answer"
                  type="text"
                  placeholder="Enter answer"
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={addFlashcard}>Add Flashcard</Button>

            {flashcards.length > 0 && (
              <FlashcardDeck 
                flashcards={flashcards} 
                onDelete={deleteFlashcard} 
              />
            )}
          </CardContent>
          <CardFooter>
            {flashcards.length === 0 && <p>No flashcards yet. Add some!</p>}
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default FlashcardsPage;
