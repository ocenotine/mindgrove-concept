
import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
  cursor?: boolean;
  soundEnabled?: boolean;
}

const Typewriter = ({ 
  text, 
  delay = 20, 
  onComplete, 
  className = '',
  cursor = false,
  soundEnabled = false
}: TypewriterProps) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Reset state when text prop changes
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        // Get the next character
        const nextChar = text[currentIndex];
        setCurrentText(prevText => prevText + nextChar);
        setCurrentIndex(prevIndex => prevIndex + 1);
        
        // Play typing sound if enabled (for special characters, simulate "thinking")
        if (soundEnabled && nextChar && nextChar.trim() !== '') {
          const audio = new Audio('/sounds/type.mp3');
          audio.volume = 0.05;
          audio.playbackRate = 2.5;
          audio.play().catch(() => {}); // Ignore errors (browsers may block autoplay)
        }
        
        // Pause briefly at punctuation
        if (['.', '!', '?', ',', ';', ':'].includes(nextChar)) {
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), delay * 10);
        }
      }, isPaused ? delay * 10 : delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete, isPaused, soundEnabled]);

  return (
    <span className={className}>
      {currentText}
      {cursor && currentIndex < text.length && (
        <span className="inline-block w-1 h-4 bg-primary ml-0.5 animate-pulse"></span>
      )}
    </span>
  );
};

export default Typewriter;
