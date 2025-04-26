
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Navigate } from 'react-router-dom';
import ChatBot from '@/components/chat/ChatBot';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import CompanionAppAd from '@/components/CompanionAppAd';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuthStore();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <div className={isSidebarCollapsed ? "w-16" : "w-64"}>
            <Sidebar isCollapsed={isSidebarCollapsed} />
          </div>
        )}
        <motion.main 
          className="flex-1 overflow-y-auto p-4 md:p-6 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CompanionAppAd />
          <div className="fixed bottom-20 right-4 z-50">
            <ChatBot />
          </div>
          <div className="fixed bottom-4 right-4 z-40">
            <motion.button
              onClick={toggleTheme}
              className="flex items-center justify-center h-10 w-10 rounded-full glass-card text-primary shadow-lg hover:shadow-xl transition-all"
              aria-label="Toggle theme"
              initial={{ rotate: 0 }}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ 
                duration: 0.5, 
                type: "tween" 
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
          </div>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
          {isMobile && (
            <div className="fixed bottom-0 inset-x-0">
              <MobileBottomNav />
            </div>
          )}
        </motion.main>
      </div>
    </div>
  );
};

export default MainLayout;
