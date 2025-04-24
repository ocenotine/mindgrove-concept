
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import confetti from 'canvas-confetti';
import { hasCompletedTour, isNewAccount, clearNewAccountFlag, markTourCompleted } from '@/utils/userOnboardingUtils';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  icon?: React.ReactNode;
}

const tourSteps: TourStep[] = [
  {
    target: '.navbar',
    title: 'Welcome to MindGrove',
    content: 'Your AI-powered tutor and research assistant. Let me show you around!',
    position: 'bottom',
    icon: <Sparkles className="h-6 w-6 text-primary" />
  },
  {
    target: '.sidebar',
    title: 'Navigation',
    content: 'Use the sidebar to navigate between different sections of the app like Dashboard, Documents, and Flashcards.',
    position: 'right',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/><path d="M6 12h.01"/><path d="M10 12h.01"/></svg>
  },
  {
    target: '.document-upload-button',
    title: 'Upload Documents',
    content: 'Upload your PDFs, documents, and text files here. MindGrove will help you organize and learn from them.',
    position: 'bottom',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 12v6"/><path d="m15 15-3-3-3 3"/></svg>
  },
  {
    target: '.ai-tools',
    title: 'AI Tools',
    content: 'Generate summaries and flashcards from your documents to help you study more effectively.',
    position: 'top',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  },
  {
    target: '.dashboard-stats',
    title: 'Track Your Progress',
    content: 'Monitor your learning journey with streak counters, statistics, and personalized insights.',
    position: 'bottom',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
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
      } else {
        // If target not found, use fallback position
        setTargetElement(null);
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
    if (!targetElement) {
      // Fallback position if element not found
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
    
    const step = tourSteps[currentStep];
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let top, left, transform = '';
    
    switch (step.position) {
      case 'top':
        top = targetElement.top - 10 - 200 + window.scrollY;
        left = targetElement.left + targetElement.width / 2;
        transform = 'translateX(-50%)';
        break;
      case 'bottom':
        top = targetElement.bottom + 10 + window.scrollY;
        left = targetElement.left + targetElement.width / 2;
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = targetElement.top + targetElement.height / 2 + window.scrollY;
        left = targetElement.left - 420;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = targetElement.top + targetElement.height / 2 + window.scrollY;
        left = targetElement.right + 10;
        transform = 'translateY(-50%)';
        break;
      default:
        top = '50%';
        left = '50%';
        transform = 'translate(-50%, -50%)';
    } 
    
    // Ensure the tooltip stays within viewport
    const tooltipWidth = 400;
    const tooltipHeight = 250;
    
    top = Math.max(10, Math.min(windowHeight - tooltipHeight - 10, top));
    left = Math.max(10, Math.min(windowWidth - tooltipWidth - 10, left));
    
    return { top: `${top}px`, left: `${left}px`, transform };
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
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 w-[400px] max-w-[95vw]"
            style={position}
          >
            <div className="bg-card border shadow-lg rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  {step.icon || <Sparkles className="h-5 w-5 text-primary" />}
                  <h4 className="font-bold text-lg">{tourSteps[currentStep].title}</h4>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSkip} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground text-base">{tourSteps[currentStep].content}</p>
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {tourSteps.length}
                </div>
                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handlePrevious}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext} className="bg-primary hover:bg-primary/90">
                    {isLastStep ? 'Finish' : 'Next'}
                    {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              </div>
              
              {/* Progress indicators */}
              <div className="flex justify-center gap-1.5 p-2 bg-muted/20">
                {tourSteps.map((_, index) => (
                  <div 
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      currentStep === index ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TourGuide;
