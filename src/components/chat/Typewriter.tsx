
import React, { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  cursor?: boolean;
}

const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  delay = 25, 
  onComplete, 
  cursor = false 
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, onComplete, text]);

  return (
    <span>
      {displayText}
      {cursor && currentIndex < text.length && (
        <span className="animate-pulse">▌</span>
      )}
    </span>
  );
};

export default Typewriter;
