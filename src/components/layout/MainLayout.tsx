
import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Navigate, useLocation } from 'react-router-dom';
import ChatBot from '@/components/chat/ChatBot';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import CompanionAppAd from '@/components/CompanionAppAd';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const isMobile = useIsMobile();
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Redirect institution users to institution dashboard if they try to access student pages
  // And redirect student users to student dashboard if they try to access institution pages
  const isInstitutionPage = location.pathname.startsWith('/institution');
  const isInstitutionUser = user?.user_metadata?.account_type === 'institution';
  
  if (isInstitutionUser && !isInstitutionPage && location.pathname !== '/profile' && location.pathname !== '/profile/edit') {
    return <Navigate to="/institution/dashboard" />;
  }
  
  if (!isInstitutionUser && isInstitutionPage) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Navbar is only shown for mobile */}
      {isMobile && <Navbar />}
      <div className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <div className="w-64">
            <Sidebar />
          </div>
        )}
        <motion.main 
          className="flex-1 overflow-y-auto px-4 py-6 md:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <CompanionAppAd />
          <div className="fixed bottom-20 right-4 z-50 md:bottom-4 md:right-6">
            <ChatBot />
          </div>
          <div className="fixed bottom-4 right-4 z-40 md:right-6">
            <motion.button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full glass-card text-primary shadow-lg hover:shadow-xl transition-all"
              aria-label="Toggle theme"
              initial={{ rotate: 0 }}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.5, type: "tween" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
          </div>
          <div className="mx-auto w-full max-w-[1400px]">
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
