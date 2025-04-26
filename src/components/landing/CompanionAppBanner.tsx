
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';

const LOCAL_STORAGE_KEY = 'mindgrove_companion_banner_dismissed';

const CompanionAppBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { user } = useAuthStore();
  
  // Check if banner should be shown based on user type and last show time
  useEffect(() => {
    const checkBannerStatus = async () => {
      // Only show for student accounts that are logged in
      if (!user || user.account_type !== 'student') {
        setIsVisible(false);
        return;
      }
      
      // Check local storage first (for quick response)
      const lastDismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (lastDismissed) {
        const dismissedTime = new Date(lastDismissed).getTime();
        const currentTime = new Date().getTime();
        const hoursPassed = (currentTime - dismissedTime) / (1000 * 60 * 60);
        
        // If less than 24 hours passed, don't show
        if (hoursPassed < 24) {
          setIsVisible(false);
          return;
        }
      }

      try {
        // Check user preferences for last_prompt_shown
        const { data, error } = await supabase
          .from('user_preferences')
          .select('last_prompt_shown')
          .eq('user_id', user.id)
          .single();

        if (error) {
          // Create preference if it doesn't exist
          if (error.code === 'PGRST116') {
            await supabase
              .from('user_preferences')
              .insert([{ 
                user_id: user.id, 
                last_prompt_shown: null 
              }]);
            setIsVisible(true);
          } else {
            console.error('Error fetching banner status:', error);
            setIsVisible(true); // Show by default if there's an error
          }
          return;
        }

        if (data) {
          if (!data.last_prompt_shown) {
            // First time, show banner
            setIsVisible(true);
          } else {
            const lastPrompt = new Date(data.last_prompt_shown).getTime();
            const currentTime = new Date().getTime();
            const hoursPassed = (currentTime - lastPrompt) / (1000 * 60 * 60);
            
            // Show banner if 24 hours have passed since last shown
            setIsVisible(hoursPassed >= 24);
          }
        } else {
          // No data, show banner
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Error checking banner status:', error);
        setIsVisible(true);
      }
    };
    
    checkBannerStatus();
  }, [user]);
  
  const dismissBanner = async () => {
    // Record dismissal time in localStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, new Date().toISOString());
    
    // Also record in Supabase if user is logged in
    if (user) {
      try {
        await supabase
          .from('user_preferences')
          .update({ last_prompt_shown: new Date().toISOString() })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating banner status:', error);
      }
    }
    
    setIsVisible(false);
  };
  
  const toggleQR = () => {
    setShowQR(!showQR);
  };
  
  const handleDownload = () => {
    // In a real app, this would link to actual app stores
    // For now, we'll point to a fictitious download page
    const downloadUrl = 'https://mindgrove.app/download';
    
    // Open in new tab
    window.open(downloadUrl, '_blank');
    
    // Mark as dismissed after clicking download
    dismissBanner();
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-40 max-w-[90vw] sm:max-w-[360px]"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="bg-card border rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/70 p-4 text-primary-foreground relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-6 w-6 text-primary-foreground hover:bg-primary/20 hover:text-primary-foreground"
              onClick={dismissBanner}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <h3 className="font-bold text-lg">Take Your Research On The Go! 🚀</h3>
          </div>
          
          <div className="p-4">
            <p className="text-sm text-foreground mb-4">
              Get instant access to papers, summaries, and your saved research—anytime, anywhere. Try the MindGrove Companion App today!
            </p>
            
            <AnimatePresence>
              {showQR && (
                <motion.div
                  className="mb-4 flex justify-center"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  <div className="bg-white p-2 rounded-md">
                    {/* Placeholder QR code - in a real app, generate a real QR code */}
                    <div className="w-32 h-32 grid grid-cols-5 grid-rows-5 gap-1">
                      {Array(25).fill(0).map((_, i) => (
                        <div 
                          key={i}
                          className={`
                            ${Math.random() > 0.7 ? 'bg-black' : 'bg-transparent'}
                            ${(i < 5 || i > 19 || i % 5 === 0 || i % 5 === 4) ? 'bg-black' : ''}
                          `}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                size="sm"
                onClick={toggleQR}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQR ? 'Hide QR' : 'Show QR'}
              </Button>
              
              <Button 
                className="flex-1"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Now
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CompanionAppBanner;
