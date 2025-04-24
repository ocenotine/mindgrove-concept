
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, RotateCw } from 'lucide-react';
import type { Flashcard as FlashcardType } from '@/utils/mockData';

interface FlashcardProps {
  flashcard: FlashcardType;
  onComplete?: () => void;
}

const Flashcard = ({ flashcard, onComplete }: FlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitX, setExitX] = useState(0);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleDragEnd = (_e: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setExitX(info.offset.x);
      
      // Call onComplete after the card has been swiped
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 300);
    }
  };

  // Get content from either front_content/back_content or question/answer
  const getFrontContent = () => flashcard.front_content || flashcard.question;
  const getBackContent = () => flashcard.back_content || flashcard.answer;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={flashcard.id}
        className="relative w-full max-w-lg mx-auto h-64 perspective-1000 cursor-pointer group"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={exitX !== 0 ? { x: exitX, opacity: 0 } : {}}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <motion.div
          className={`w-full h-full rounded-xl shadow-lg transition-all duration-500 transform ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          } preserve-3d`}
          onClick={handleFlip}
          layout
        >
          {/* Front side */}
          <motion.div
            className="absolute w-full h-full rounded-xl bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/10 p-6 backface-hidden"
            initial={false}
            animate={{ 
              opacity: isFlipped ? 0 : 1,
              rotateY: isFlipped ? 180 : 0
            }}
            transition={{ duration: 0.5 }}
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-lg font-medium text-foreground mb-2">{getFrontContent()}</p>
              </div>
              <div className="flex items-center justify-center mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="h-6 w-6 animate-bounce" />
                <span className="text-sm ml-1">Tap to flip</span>
              </div>
            </div>
          </motion.div>
          
          {/* Back side */}
          <motion.div
            className="absolute w-full h-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 border border-primary/20 p-6 backface-hidden [transform:rotateY(180deg)]"
            initial={false}
            animate={{ 
              opacity: isFlipped ? 1 : 0,
              rotateY: isFlipped ? 0 : -180
            }}
            transition={{ duration: 0.5 }}
            style={{ 
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-foreground">{getBackContent()}</p>
              </div>
              <div className="flex items-center justify-center mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <RotateCw className="h-5 w-5 mr-1" />
                <span className="text-sm">Tap to flip back</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Swipe indicators */}
        <motion.div
          className="absolute top-1/2 left-2 -translate-y-1/2 opacity-0 group-hover:opacity-60"
          animate={{ x: [-5, 0, -5], opacity: exitX === 0 ? [0, 0.6, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="h-10 w-10 rounded-full bg-background/80 flex items-center justify-center shadow-md">
            <ArrowLeft className="h-5 w-5" />
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-60"
          animate={{ x: [5, 0, 5], opacity: exitX === 0 ? [0, 0.6, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <div className="h-10 w-10 rounded-full bg-background/80 flex items-center justify-center shadow-md">
            <ArrowRight className="h-5 w-5" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Need to import the arrow icons
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default Flashcard;
