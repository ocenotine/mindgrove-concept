
import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
}

const Typewriter = ({ text, delay = 20, onComplete }: TypewriterProps) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset state when text prop changes
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  return <>{currentText}</>;
};

export default Typewriter;
