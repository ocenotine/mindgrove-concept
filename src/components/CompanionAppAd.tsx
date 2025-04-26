
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import QRCodeGenerator from '@/components/common/QRCodeGenerator';
import { toast } from '@/components/ui/use-toast';

const CompanionAppAd: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const checkAdEligibility = async () => {
      if (!user || user.account_type !== 'student') return;

      try {
        // Check user preferences for last_prompt_shown
        const { data, error } = await supabase
          .from('user_preferences')
          .select('last_prompt_shown')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            // No record exists, create one and show the ad
            await supabase
              .from('user_preferences')
              .insert([{ 
                user_id: user.id,
                last_prompt_shown: null
              }]);
            setIsVisible(true);
          } else {
            console.error('Error checking ad eligibility:', error);
          }
          return;
        }
        
        const now = new Date();
        const lastPromptShown = data.last_prompt_shown ? new Date(data.last_prompt_shown) : null;
        
        if (!lastPromptShown || (now.getTime() - lastPromptShown.getTime()) > 24 * 60 * 60 * 1000) {
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking ad eligibility:', error);
        
        // Fallback to localStorage
        const lastShown = localStorage.getItem(`mindgrove_last_ad_shown_${user.id}`);
        if (!lastShown) {
          setIsVisible(true);
          return;
        }
        
        const now = new Date();
        const lastShownDate = new Date(lastShown);
        if ((now.getTime() - lastShownDate.getTime()) > 24 * 60 * 60 * 1000) {
          setIsVisible(true);
        }
      }
    };

    checkAdEligibility();
  }, [user]);

  const dismissAd = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_preferences')
        .update({ last_prompt_shown: new Date().toISOString() })
        .eq('user_id', user.id);
      
      setIsVisible(false);
    } catch (error) {
      console.error('Error updating last_prompt_shown:', error);
      // Fallback to localStorage
      localStorage.setItem(`mindgrove_last_ad_shown_${user.id}`, new Date().toISOString());
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50 w-80 bg-card border rounded-lg shadow-lg p-4"
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={dismissAd}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 bg-primary/10 p-3 rounded-full">
            <Download className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-xl font-semibold mb-2">Take Your Research On The Go! 🚀</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get instant access to papers, summaries, and your saved research—anytime, anywhere. 
            Try the MindGrove Companion App today!
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              className="flex-1"
              onClick={() => window.open('https://mindgrove.app/download', '_blank')}
            >
              Download Now
            </Button>
            
            <div className="border p-2 rounded">
              <QRCodeGenerator 
                value="https://mindgrove.app/download" 
                size={80} 
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanionAppAd;
