
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import confetti from 'canvas-confetti';
import { hasCompletedTour, isNewAccount, clearNewAccountFlag, markTourCompleted } from '@/utils/userOnboardingUtils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.navbar',
    title: 'Welcome to MindGrove',
    content: 'This is your learning companion for organizing and understanding documents. Let me show you around!',
    position: 'bottom'
  },
  {
    target: '.sidebar',
    title: 'Navigation',
    content: 'Use the sidebar to navigate between different sections of the app like Dashboard, Documents, and Flashcards.',
    position: 'right'
  },
  {
    target: '.search-input',
    title: 'Search',
    content: 'Search through all your documents and find information across your library.',
    position: 'bottom'
  },
  {
    target: '.document-upload-button',
    title: 'Upload Documents',
    content: 'Upload your PDFs, documents, and text files here. MindGrove will help you organize and learn from them.',
    position: 'bottom'
  },
  {
    target: '.ai-tools',
    title: 'AI Tools',
    content: 'Generate summaries and flashcards from your documents to help you study more effectively.',
    position: 'top'
  }
];

const TourGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  const { user } = useAuthStore();

  // Check if user has completed the tour
  useEffect(() => {
    const tourCompleted = hasCompletedTour();
    const newAccount = isNewAccount();
    
    if (user && newAccount && !tourCompleted) {
      // Clear the new account flag
      clearNewAccountFlag();
      
      // Play notification sound
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(e => console.error('Error playing sound:', e));
      
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Show tour after a short delay
      setTimeout(() => {
        setVisible(true);
      }, 1000);
    }
  }, [user]);

  // Find target element and calculate its position
  useEffect(() => {
    if (visible) {
      const step = tourSteps[currentStep];
      const target = document.querySelector(step.target);
      
      if (target) {
        setTargetElement(target.getBoundingClientRect());
      }
    }
  }, [currentStep, visible]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setVisible(false);
    markTourCompleted();
    
    // Trigger confetti again when completing the tour
    confetti({
      particleCount: 200,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#9b87f5', '#7E69AB', '#33C3F0']
    });
  };

  const handleSkip = () => {
    setVisible(false);
    markTourCompleted();
  };

  const calculatePosition = () => {
    if (!targetElement) return { top: '50%', left: '50%' };
    
    const step = tourSteps[currentStep];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let top, left;
    
    switch (step.position) {
      case 'top':
        top = targetElement.top - 10 - 200 + window.scrollY;
        left = targetElement.left + targetElement.width / 2 - 200;
        break;
      case 'bottom':
        top = targetElement.bottom + 10 + window.scrollY;
        left = targetElement.left + targetElement.width / 2 - 200;
        break;
      case 'left':
        top = targetElement.top + targetElement.height / 2 - 100 + window.scrollY;
        left = targetElement.left - 400 - 10;
        break;
      case 'right':
        top = targetElement.top + targetElement.height / 2 - 100 + window.scrollY;
        left = targetElement.right + 10;
        break;
      default:
        top = '50%';
        left = '50%';
    } 
    
    top = Math.max(10, Math.min(windowHeight - 210, top));
    left = Math.max(10, Math.min(windowWidth - 410, left));
    
    return { top: `${top}px`, left: `${left}px` };
  };

  if (!visible) return null;

  const step = tourSteps[currentStep];
  const position = calculatePosition();
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Darkened overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50"
            style={calculatePosition()}
          >
            <div className="bg-card border shadow-lg rounded-lg w-[400px]">
              <div className="flex justify-between items-center p-4 border-b">
                <h4 className="font-bold text-lg">{tourSteps[currentStep].title}</h4>
                <Button variant="ghost" size="icon" onClick={handleSkip}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6">
                <p className="text-muted-foreground text-base">{tourSteps[currentStep].content}</p>
              </div>
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {currentStep + 1} / {tourSteps.length}
                </div>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext}>
                    {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                    {currentStep !== tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TourGuide;
