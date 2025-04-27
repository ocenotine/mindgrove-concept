
import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

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
        <Card className="absolute w-full h-full backface-hidden p-6 flex flex-col justify-center items-center">
          <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Question</div>
          <div className="text-xl text-center font-medium">{question}</div>
        </Card>

        {/* Back side (Answer) */}
        <Card className="absolute w-full h-full backface-hidden p-6 rotate-y-180 flex flex-col justify-center items-center">
          <div className="text-sm uppercase tracking-wider text-muted-foreground mb-2">Answer</div>
          <div className="text-xl text-center font-medium">{answer}</div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Flashcard;
