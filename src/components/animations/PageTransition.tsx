
import { motion } from 'framer-motion';
import { ReactNode, useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface PageTransitionProps {
  children: ReactNode;
}

export const PageTransition = ({ children }: PageTransitionProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate page loading with a longer delay (1.5 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center w-full max-w-lg"
        >
          <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center mb-6">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <BookOpen className="h-8 w-8 text-white" />
            </motion.div>
          </div>
          
          <div className="w-full space-y-4">
            <Skeleton className="h-8 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-full rounded-sm" />
            <Skeleton className="h-4 w-2/3 rounded-sm" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-10 w-1/2 rounded-md" />
              <Skeleton className="h-10 w-1/2 rounded-md" />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }} // Slower page transition
    >
      {children}
    </motion.div>
  );
};
