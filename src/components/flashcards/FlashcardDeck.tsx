
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Flashcard } from '@/utils/mockData';
import FlashcardComponent from './Flashcard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, List, Layers, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

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

  const handleDeleteClick = (id: string) => {
    if (showConfirmDelete === id) {
      // Confirm delete
      if (onDelete) {
        onDelete(id);
      }
      setShowConfirmDelete(null);
    } else {
      // Show confirmation
      setShowConfirmDelete(id);
    }
  };

  if (flashcards.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-background/30 backdrop-blur-md border border-border/50 rounded-xl p-10 flex flex-col items-center justify-center h-64 shadow-md"
      >
        <Layers className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-center text-muted-foreground">No flashcards available.</p>
        <Button variant="outline" className="mt-4">Create your first flashcard</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          {documentTitle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-xl font-medium">{documentTitle}</h3>
              <p className="text-muted-foreground text-sm">
                {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
              </p>
            </motion.div>
          )}
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Button
            variant={showingAll ? "default" : "outline"}
            size="sm"
            onClick={() => setShowingAll(!showingAll)}
            className="gap-2"
          >
            {showingAll ? <Layers className="h-4 w-4" /> : <List className="h-4 w-4" />}
            {showingAll ? 'Card View' : 'List View'}
          </Button>
          
          <Badge variant="outline" className="bg-primary/10">
            {currentIndex + 1} / {flashcards.length}
          </Badge>
        </motion.div>
      </div>

      {showingAll ? (
        <motion.div 
          className="space-y-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {flashcards.map((flashcard, index) => (
            <motion.div
              key={flashcard.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.3 }}
              className="transition-all duration-300"
            >
              <Card className="overflow-hidden border border-border/60 hover:border-primary/20 hover:shadow-md transition-all duration-200">
                <CardHeader className="bg-background/50 backdrop-blur-sm">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{flashcard.question || flashcard.front_content}</CardTitle>
                    <Badge variant="outline" className="bg-primary/5">
                      {index + 1}/{flashcards.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  <CardDescription className="text-base text-foreground/90">
                    {flashcard.answer || flashcard.back_content}
                  </CardDescription>
                </CardContent>
                {onDelete && (
                  <CardFooter className="flex justify-end py-3 bg-background/50 border-t border-border/30">
                    <Button 
                      variant={showConfirmDelete === flashcard.id ? "destructive" : "ghost"} 
                      size="sm" 
                      onClick={() => handleDeleteClick(flashcard.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      {showConfirmDelete === flashcard.id ? 'Confirm' : 'Delete'}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={`flashcard-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <FlashcardComponent 
                flashcard={flashcards[currentIndex]}
                onComplete={handleComplete}
              />
            </motion.div>
          </AnimatePresence>
          
          <div className="flex justify-between items-center mt-8">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1], 
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              className="text-sm text-muted-foreground bg-background/50 px-3 py-1 rounded-full backdrop-blur-sm border border-border/30"
            >
              Swipe to navigate
            </motion.div>
            
            <Button 
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardDeck;
