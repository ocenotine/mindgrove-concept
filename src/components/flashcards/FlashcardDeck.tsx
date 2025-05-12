
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import Flashcard from './Flashcard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export interface Flashcard {
  id?: string;
  question: string;
  answer: string;
  document_id?: string;
}

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  onDelete?: (id: string) => void;
  documentTitle?: string; // Added documentTitle prop
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards, onDelete, documentTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    setFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleDelete = () => {
    if (onDelete && flashcards[currentIndex]?.id) {
      onDelete(flashcards[currentIndex].id!);
    }
  };

  if (flashcards.length === 0) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <p className="text-muted-foreground">No flashcards available</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {documentTitle && (
        <div className="text-sm text-muted-foreground">
          From document: {documentTitle}
        </div>
      )}
      <div className="h-80">
        <Flashcard
          question={flashcards[currentIndex].question}
          answer={flashcards[currentIndex].answer}
          flipped={flipped}
          onFlip={handleFlip}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <div className="flex gap-2">
          {onDelete && (
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive">
              Delete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDeck;
