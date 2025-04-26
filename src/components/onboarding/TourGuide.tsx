
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

interface Step {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const TourGuide: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tourActive, setTourActive] = useState<boolean>(false);
  const [tourCompleted, setTourCompleted] = useState<boolean>(false);
  const location = useLocation();
  const { user } = useAuthStore();
  
  const steps: Step[] = [
    {
      target: '[data-tour="dashboard"]',
      title: 'Welcome to MindGrove',
      content: 'This is your dashboard where you can see your progress and recent activities.',
      position: 'bottom'
    },
    {
      target: '[data-tour="documents"]',
      title: 'Document Management',
      content: 'Upload and manage your academic papers and documents here.',
      position: 'bottom'
    },
    {
      target: '[data-tour="flashcards"]',
      title: 'Learn with Flashcards',
      content: 'Create and study with AI-generated flashcards based on your documents.',
      position: 'bottom'
    },
    {
      target: '[data-tour="chat"]',
      title: 'AI Research Assistant',
      content: 'Ask questions about your documents or get help with your research.',
      position: 'bottom'
    },
    {
      target: '[data-tour="profile"]',
      title: 'Your Profile',
      content: 'Manage your account settings and track your learning progress.',
      position: 'bottom'
    }
  ];

  // Add a step for institution dashboard if user is an admin
  if (user?.account_type === 'admin') {
    steps.push({
      target: '[data-tour="institution"]',
      title: 'Institution Dashboard',
      content: 'Access analytics and manage your institution\'s research portal.',
      position: 'bottom'
    });
  }
  
  useEffect(() => {
    if (!user) return;
    
    // Check if user has completed the tour
    const checkTourStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('tour_completed')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No record found, create one
            await supabase
              .from('user_preferences')
              .insert([{ user_id: user.id, tour_completed: false }]);
            
            // Only start tour on dashboard page
            if (location.pathname === '/dashboard') {
              setTourActive(true);
            }
          } else {
            console.error('Error fetching tour status:', error);
          }
          return;
        }
        
        if (data) {
          setTourCompleted(data.tour_completed);
          if (!data.tour_completed && location.pathname === '/dashboard') {
            setTourActive(true);
          }
        }
      } catch (error) {
        console.error('Error checking tour status:', error);
      }
    };
    
    checkTourStatus();
  }, [user, location.pathname]);
  
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };
  
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const dismissTour = () => {
    setTourActive(false);
  };
  
  const completeTour = async () => {
    setTourActive(false);
    setTourCompleted(true);
    
    try {
      if (user) {
        await supabase
          .from('user_preferences')
          .update({ tour_completed: true })
          .eq('user_id', user.id);
        
        toast({
          title: 'Tour completed',
          description: 'You can restart the tour anytime from your profile settings.',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error completing tour:', error);
    }
  };
  
  useEffect(() => {
    if (!tourActive || !steps[currentStep]) return;
    
    const targetElement = document.querySelector(steps[currentStep].target);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentStep, tourActive, steps]);
  
  if (!tourActive || !steps[currentStep]) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50 inset-0 pointer-events-none bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0" onClick={dismissTour} />
      </motion.div>
      
      <motion.div
        className="fixed z-50 bg-card border rounded-lg shadow-lg p-4 w-[90%] max-w-md pointer-events-auto"
        style={{
          // Position near the target element
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-lg">{steps[currentStep].title}</h3>
          <Button
            size="icon"
            variant="ghost"
            onClick={dismissTour}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="mb-4">{steps[currentStep].content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-5 rounded-full transition-colors ${
                  index === currentStep
                    ? 'bg-primary'
                    : index < currentStep
                    ? 'bg-primary/40'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevStep}
              >
                Back
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNextStep}
              className="gap-1"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Finish
                  <Check className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TourGuide;
