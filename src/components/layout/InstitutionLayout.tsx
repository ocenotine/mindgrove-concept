
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { Moon, Sun, Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { Navigate, useLocation } from 'react-router-dom';
import ChatBot from '@/components/chat/ChatBot';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import InstitutionSidebar from '@/components/layout/InstitutionSidebar';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface InstitutionLayoutProps {
  children: React.ReactNode;
}

const InstitutionLayout = ({ children }: InstitutionLayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  const [institutionLogo, setInstitutionLogo] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInstitutionData = async () => {
      if (user?.institution_id) {
        try {
          const { data } = await supabase
            .from('institutions')
            .select('logo_url')
            .eq('id', user.institution_id)
            .single();
            
          if (data?.logo_url) {
            setInstitutionLogo(data.logo_url);
          }
        } catch (error) {
          console.error("Error fetching institution data:", error);
        }
      }
    };
    
    fetchInstitutionData();
  }, [user?.institution_id]);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Redirect non-institution users
  const isInstitutionUser = user?.user_metadata?.account_type === 'institution';
  if (!isInstitutionUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <InstitutionSidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div 
        className={`transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'}`}
        style={{ minHeight: '100vh', background: '#0D1117' }}
      >
        {/* Top Navigation Bar */}
        <header className="bg-[#191C27] border-b border-gray-800 h-16 flex items-center px-4 md:px-6">
          <div className="flex-1 flex items-center">
            <div className="relative max-w-md w-full mr-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search..." 
                className="pl-9 bg-[#131620] border-gray-700 text-gray-300 w-full focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Bell className="h-5 w-5" />
            </Button>
            
            <motion.button
              onClick={toggleTheme}
              className="flex items-center justify-center h-10 w-10 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
              aria-label="Toggle theme"
              initial={{ rotate: 0 }}
              animate={{ rotate: isDarkMode ? 180 : 0 }}
              transition={{ duration: 0.5, type: "tween" }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </motion.button>
            
            <div className="flex items-center">
              <Avatar>
                <AvatarImage src={institutionLogo || undefined} alt={user?.name || "User"} />
                <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="p-4 md:p-6">
          <motion.div 
            className="max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
          
          {/* ChatBot and Mobile Nav */}
          <div className="fixed bottom-20 right-4 z-50">
            <ChatBot />
          </div>
          
          {isMobile && (
            <div className="fixed bottom-0 inset-x-0">
              <MobileBottomNav />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default InstitutionLayout;
