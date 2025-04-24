
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { Sun, Moon, Sunset } from 'lucide-react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader = ({
  title,
  subtitle
}: DashboardHeaderProps) => {
  const { user } = useAuthStore();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Get icon based on time of day
  const getGreetingIcon = () => {
    const hours = new Date().getHours();
    if (hours < 12) return <Sun className="h-5 w-5 text-yellow-500" />;
    if (hours < 18) return <Sun className="h-5 w-5 text-orange-500" />;
    return <Moon className="h-5 w-5 text-indigo-400" />;
  };

  return (
    <header className="mb-8">
      {user && (
        <motion.div 
          className="flex items-center mb-1" 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="mr-2"
            animate={{
              rotate: [0, 10, 0, 10, 0],
              scale: [1, 1.2, 1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              repeatDelay: 5
            }}
          >
            {getGreetingIcon()}
          </motion.div>
          <motion.p className="text-sm">
            <motion.span 
              className="font-bold text-foreground"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {getGreeting()},
            </motion.span>{' '}
            <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user.name}</span>
          </motion.p>
        </motion.div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary/90 to-secondary/90 bg-clip-text text-transparent">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </motion.div>
    </header>
  );
};

export default DashboardHeader;
