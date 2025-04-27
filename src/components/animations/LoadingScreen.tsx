
import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
        }}
        className="w-16 h-16 mb-8"
      >
        <svg className="w-full h-full text-primary" viewBox="0 0 24 24">
          <motion.path
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </svg>
      </motion.div>
      
      <motion.h2 
        className="text-xl font-semibold text-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading MindGrove...
      </motion.h2>
      
      <motion.p 
        className="mt-2 text-sm text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Cultivating knowledge...
      </motion.p>
    </div>
  );
};

export default LoadingScreen;
