
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center max-w-3xl mx-auto">
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to MindGrove
        </motion.h1>
        
        <motion.p 
          className="text-xl mb-8 text-muted-foreground"
          initial={{ y: -10 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Your AI-powered learning companion for smarter study and knowledge management
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button size="lg" onClick={() => navigate('/login')}>
            Log In
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Home;
