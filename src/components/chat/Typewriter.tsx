
import React, { useState, useEffect, useRef } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  cursor?: boolean;
  isActive?: boolean; // To control if typing should be active
}

const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  delay = 25, 
  onComplete, 
  cursor = true,
  isActive = true
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const stopTyping = () => {
    if (intervalRef.current !== null) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Display full text immediately when isActive becomes false
  useEffect(() => {
    if (!isActive && displayText !== text) {
      stopTyping();
      setDisplayText(text);
      setCurrentIndex(text.length);
      if (onComplete) onComplete();
    }
  }, [isActive, text, displayText, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setCurrentIndex(0);
    stopTyping();
  }, [text]);

  useEffect(() => {
    if (!isActive) return;

    if (currentIndex < text.length) {
      intervalRef.current = window.setTimeout(() => {
        setDisplayText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => stopTyping();
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, onComplete, text, isActive]);

  return (
    <span className="whitespace-pre-wrap break-words">
      {displayText}
      {cursor && currentIndex < text.length && isActive && (
        <span className="animate-pulse">▌</span>
      )}
    </span>
  );
};

export default Typewriter;
