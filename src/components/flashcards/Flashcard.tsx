
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
          className={`w-full h-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}
          onClick={handleFlip}
          layout
        >
          {/* Front side */}
          <motion.div
            className="absolute w-full h-full rounded-xl bg-gradient-to-br from-primary/5 to-primary/20 border border-primary/10 p-6 backface-hidden"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ opacity: isFlipped ? 0 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <p className="text-lg font-medium text-foreground mb-2">{getFrontContent()}</p>
              </div>
              <div className="flex items-center justify-center mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="h-6 w-6 animate-bounce" />
                <span className="text-sm">Tap to flip</span>
              </div>
            </div>
          </motion.div>
          
          {/* Back side */}
          <motion.div
            className="absolute w-full h-full rounded-xl bg-gradient-to-br from-primary/10 to-primary/30 border border-primary/20 p-6 backface-hidden rotate-y-180"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ duration: 0.2 }}
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
      </motion.div>
    </AnimatePresence>
  );
};

export default Flashcard;
