
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import { useTheme } from '@/components/theme/theme-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/landing' || location.pathname === '/';
  const isStudentDashboard = user?.account_type === 'student' && !isLandingPage;

  // Don't show search and profile on landing page
  const showFullNav = !isLandingPage;

  const { handleSearch } = useDocuments();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      navigate('/documents');
    }
  };

  return (
    <header className="sticky top-0 z-40">
      <motion.div 
        className="backdrop-blur-md bg-background/80 border-b border-border"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-[120px]">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <img 
                    src="/mindgrove.png"
                    alt="MindGrove"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-lg font-semibold hidden sm:inline-block">MindGrove</span>
              </Link>
            </div>
            
            {showFullNav && (
              <>
                {!isStudentDashboard && !isLandingPage && (
                  <div className="flex-1 max-w-2xl">
                    <form onSubmit={handleSearchSubmit} className="w-full">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search documents..."
                          className="w-full h-9 pl-9 pr-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-muted/50 border-0"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </form>
                  </div>
                )}
                <Link to="/profile" className="flex items-center gap-2 min-w-[40px]">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center bg-muted/50 overflow-hidden border border-border">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-foreground" />
                    )}
                  </div>
                  {!isMobile && (
                    <span className="text-sm font-medium hidden sm:inline-block">{user?.name}</span>
                  )}
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;
