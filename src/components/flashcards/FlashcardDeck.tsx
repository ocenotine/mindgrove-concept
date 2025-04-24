
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard } from '@/utils/mockData';
import FlashcardComponent from './Flashcard';

interface FlashcardDeckProps {
  flashcards: Flashcard[];
  onSave?: (updatedFlashcards: Flashcard[]) => void;
  onDelete?: (flashcardId: string) => void;
  documentTitle?: string;
}

const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ 
  flashcards, 
  onSave, 
  onDelete,
  documentTitle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingAll, setShowingAll] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleComplete = () => {
    handleNext();
  };

  if (flashcards.length === 0) {
    return (
      <Card className="flex items-center justify-center h-64">
        <CardContent>
          <p className="text-center text-muted-foreground">No flashcards available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {documentTitle && (
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium">{documentTitle}</h3>
          <Button
            variant="outline"
            onClick={() => setShowingAll(!showingAll)}
          >
            {showingAll ? 'Show One at a Time' : 'Show All Cards'}
          </Button>
        </div>
      )}

      {showingAll ? (
        <div className="space-y-6">
          {flashcards.map((flashcard) => (
            <Card key={flashcard.id} className="mb-4">
              <CardHeader>
                <CardTitle>{flashcard.question || flashcard.front_content}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {flashcard.answer || flashcard.back_content}
                </CardDescription>
              </CardContent>
              {(onSave || onDelete) && (
                <CardFooter className="flex justify-end">
                  {onDelete && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => onDelete(flashcard.id)}
                    >
                      Delete
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <FlashcardComponent 
              flashcard={flashcards[currentIndex]}
              onComplete={handleComplete}
            />
          </div>
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {flashcards.length}
            </div>
            <Button 
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
