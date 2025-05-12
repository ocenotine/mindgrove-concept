
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LightbulbIcon } from 'lucide-react';

export interface FlashcardProps {
  question: string;
  answer: string;
  flipped: boolean;
  onFlip: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer, flipped, onFlip }) => {
  return (
    <div 
      className="relative w-full h-full perspective-1000 cursor-pointer" 
      onClick={onFlip}
    >
      <motion.div
        className={`w-full h-full duration-500 preserve-3d relative ${flipped ? 'rotate-y-180' : ''}`}
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Front side (Question) */}
        <Card className="absolute w-full h-full backface-hidden p-8 flex flex-col justify-center items-center shadow-md hover:shadow-lg transition-shadow border-2 border-gray-100 dark:border-gray-800">
          <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-medium">Question</div>
          <div className="text-2xl text-center font-bold leading-relaxed">{question}</div>
          <div className="mt-6 text-sm text-muted-foreground">Click to flip</div>
        </Card>

        {/* Back side (Answer) */}
        <Card className="absolute w-full h-full backface-hidden p-8 rotate-y-180 flex flex-col justify-center items-center bg-primary/5 shadow-md hover:shadow-lg transition-shadow border-2 border-primary/20 dark:border-primary/30">
          <div className="flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground mb-4 font-medium">
            <LightbulbIcon className="h-5 w-5 text-primary" />
            <span>Answer</span>
          </div>
          <div className="text-xl text-center font-medium leading-relaxed">{answer}</div>
          <div className="mt-6 text-sm text-muted-foreground">Click to flip back</div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Flashcard;
