
import { Link, useNavigate } from 'react-router-dom';
import { Search, User } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useDocuments } from '@/hooks/useDocuments';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user } = useAuthStore();
  const { handleSearch } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const { isDarkMode } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
      navigate('/documents'); // Redirect to documents page with search results
    }
  };

  return (
    <header className="sticky top-0 z-40">
      <motion.div 
        className="backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/10"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <img 
                    src="/mindgrove.png"
                    alt="MindGrove"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </div>
                <span className="text-xl font-brand hidden sm:inline-block">MindGrove</span>
              </Link>
            </div>
            
            <div className="flex-1 mx-4 max-w-xl">
              <form onSubmit={handleSearchSubmit} className="w-full search-input">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </form>
            </div>
            
            <Link to="/profile" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-primary bg-white/40 dark:bg-black/20 backdrop-blur-md shadow-lg overflow-hidden border border-white/30 dark:border-white/10">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 object-cover" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline-block">{user?.name}</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </header>
  );
};

export default Navbar;
