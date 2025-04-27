
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoadingAnimation = () => {
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);

  // Set a timeout to ensure the loading animation doesn't display too long
  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
      
      // Force redirect to landing page if loading takes too long
      if (window.location.pathname === '/') {
        navigate('/landing', { replace: true });
      }
    }, 2000); // Reduced to 2 seconds for faster feedback

    return () => {
      clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative mb-8">
        <svg className="stroke-primary" viewBox="0 0 57 57" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          <motion.g
            fill="none"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity }}
          >
            <path d="M28.5,1.5 L28.5,55.5" />
            <path d="M1.5,28.5 L55.5,28.5" />
            <motion.circle cx="28.5" cy="28.5" r="27" />
          </motion.g>
        </svg>
        
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            rotate: [0, 0, 270, 270, 0],
            scale: [1, 1.2, 1.2, 1, 1],
          }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
        >
          <span className="text-xl font-bold text-primary">M</span>
        </motion.div>
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-2">
          <span className="text-primary">Mind</span>Grove
        </h2>
        
        <motion.div
          className="relative h-1 w-32 bg-gray-200 rounded-full overflow-hidden mx-auto"
        >
          <motion.div
            className="absolute left-0 top-0 h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
        
        <p className="mt-4 text-muted-foreground text-sm">
          {timedOut 
            ? "Taking longer than expected... Redirecting you now." 
            : "Cultivating knowledge..."}
        </p>
        
        {timedOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-4"
          >
            <button 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
              onClick={() => navigate('/landing', { replace: true })}
            >
              Go to Landing Page
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation;
