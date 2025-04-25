
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { isNewAccount, markTourComplete } from '@/utils/userOnboardingUtils';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface TourStep {
  title: string;
  description: string;
  targetId: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route: string;
}

const TourGuide = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const location = useLocation();
  const { user } = useAuthStore();

  // Define tour steps for different pages
  const tourSteps: TourStep[] = [
    {
      title: "Welcome to MindGrove!",
      description: "Let's take a quick tour to help you get started with our AI-powered research assistant.",
      targetId: "body",
      position: "center",
      route: "/dashboard"
    },
    {
      title: "Dashboard Overview",
      description: "Your dashboard gives you a quick overview of your documents and research stats.",
      targetId: "dashboard-header",
      position: "bottom",
      route: "/dashboard"
    },
    {
      title: "Upload Documents",
      description: "Click here to upload your research papers, PDFs, and academic documents.",
      targetId: "upload-button",
      position: "bottom",
      route: "/dashboard"
    },
    {
      title: "AI Insights",
      description: "Our AI will analyze your documents to create summaries and generate flashcards for effective studying.",
      targetId: "ai-tools-section",
      position: "top",
      route: "/dashboard"
    },
    {
      title: "Need Help?",
      description: "Click the chat bubble anytime to get help from our AI assistant.",
      targetId: "chat-button",
      position: "left",
      route: "/dashboard"
    }
  ];

  useEffect(() => {
    // Only check for new user status if we have a user logged in
    const checkNewUserStatus = async () => {
      if (!user) return;

      try {
        // Check if the user has completed the tour before
        const { data: userPrefs } = await supabase
          .from('user_preferences')
          .select('tour_completed')
          .eq('user_id', user.id)
          .single();

        // If there's no record or tour_completed is false, show the tour
        if (!userPrefs || !userPrefs.tour_completed) {
          // Show the tour for new users on dashboard
          if (location.pathname === '/dashboard') {
            setTimeout(() => setIsVisible(true), 1000);
          }
        }
      } catch (error) {
        console.error("Error checking tour status:", error);
      }
    };

    checkNewUserStatus();
  }, [user, location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isVisible && tourSteps[currentStep]) {
      const step = tourSteps[currentStep];
      
      if (step.targetId === 'body') {
        // Center in viewport for intro steps
        setTargetElement(null);
        return;
      }
      
      const element = document.getElementById(step.targetId);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetElement(rect);
      } else {
        setTargetElement(null);
      }
    }
  }, [currentStep, isVisible, windowSize]);

  const closeTour = async () => {
    setIsVisible(false);
    markTourComplete();

    // Also mark tour as completed in the database
    if (user) {
      try {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            tour_completed: true,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error("Error saving tour completion status:", error);
      }
    }
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prevStep => prevStep + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prevStep => prevStep - 1);
    }
  };

  // Calculate tooltip position based on target element
  const getPosition = () => {
    if (!targetElement) {
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const step = tourSteps[currentStep];
    const padding = 20; // Space between target and tooltip

    switch (step.position) {
      case 'top':
        return {
          left: `${targetElement.left + targetElement.width / 2}px`,
          top: `${targetElement.top - padding}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          left: `${targetElement.left + targetElement.width / 2}px`,
          top: `${targetElement.bottom + padding}px`,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          left: `${targetElement.left - padding}px`,
          top: `${targetElement.top + targetElement.height / 2}px`,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          left: `${targetElement.right + padding}px`,
          top: `${targetElement.top + targetElement.height / 2}px`,
          transform: 'translate(0, -50%)'
        };
      case 'center':
      default:
        return {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }
  };

  // For spotlight effect
  const getSpotlightPath = () => {
    if (!targetElement || tourSteps[currentStep].position === 'center') {
      return `M0,0 L${windowSize.width},0 L${windowSize.width},${windowSize.height} L0,${windowSize.height}Z`;
    }

    const padding = 10; // Padding around the spotlighted element
    const x = targetElement.left - padding;
    const y = targetElement.top - padding;
    const width = targetElement.width + (padding * 2);
    const height = targetElement.height + (padding * 2);

    return `
      M0,0 L${windowSize.width},0 L${windowSize.width},${windowSize.height} L0,${windowSize.height}Z
      M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height}Z
    `;
  };

  if (!isVisible) return null;

  const position = getPosition();

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Backdrop with spotlight */}
      <svg width="100%" height="100%" className="pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect
              x={targetElement ? targetElement.left - 10 : windowSize.width / 2 - 150}
              y={targetElement ? targetElement.top - 10 : windowSize.height / 2 - 150}
              width={targetElement ? targetElement.width + 20 : 300}
              height={targetElement ? targetElement.height + 20 : 300}
              rx="4"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#spotlight-mask)"
          className="pointer-events-auto"
          onClick={closeTour}
        />
      </svg>

      {/* Tour tooltip */}
      <AnimatePresence>
        <motion.div
          key={`tour-step-${currentStep}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute pointer-events-auto bg-card border rounded-lg shadow-lg w-[90vw] max-w-sm p-5"
          style={{
            left: position.left,
            top: position.top,
            transform: position.transform,
            zIndex: 101
          }}
        >
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-2 h-8 w-8 p-0"
            onClick={closeTour}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-1 text-primary">{tourSteps[currentStep]?.title}</h3>
            <p className="text-sm text-muted-foreground">{tourSteps[currentStep]?.description}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex space-x-1">
              {tourSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full ${
                    idx === currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button size="sm" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
              )}
              <Button size="sm" onClick={nextStep}>
                {currentStep < tourSteps.length - 1 ? 'Next' : 'Finish'} 
                {currentStep < tourSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TourGuide;
