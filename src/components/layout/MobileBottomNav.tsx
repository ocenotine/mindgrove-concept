
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Home, FileText, BookOpen, MessagesSquare, User, BarChart3, ShoppingBag, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Determine if this is an admin user
  const isAdmin = user?.account_type === 'admin' || user?.user_metadata?.account_type === 'institution';
  
  const navItems = [
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: '',
      href: '/profile',
      dataTour: 'profile',
      bgColor: 'bg-blue-600'
    },
    {
      icon: <Home className="h-5 w-5" />,
      label: '',
      href: isAdmin ? '/institution/dashboard' : '/dashboard',
      dataTour: 'dashboard',
      bgColor: 'bg-blue-500/50'
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: '',
      href: '/documents',
      dataTour: 'documents',
      bgColor: 'bg-blue-500/50'
    },
    {
      icon: <MessagesSquare className="h-5 w-5" />,
      label: '',
      href: isAdmin ? '/institution/ai-chat' : '/ai-chat',
      dataTour: 'chat',
      bgColor: 'bg-blue-500/50'
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: '',
      href: isAdmin ? '/institution/settings' : '/profile/edit',
      dataTour: 'settings',
      bgColor: 'bg-blue-500/50'
    }
  ];
  
  return (
    <motion.div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 h-14 bg-blue-900/50 backdrop-blur-lg rounded-full border border-blue-400/30 z-40 md:hidden px-2 shadow-lg shadow-blue-500/20"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      style={{ width: 'auto', maxWidth: '90%' }}
    >
      <nav className="h-full flex items-center justify-between space-x-1 px-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/profile' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center justify-center"
              data-tour={item.dataTour}
            >
              <motion.div 
                className={`relative p-2.5 rounded-full ${index === 0 ? 'bg-blue-600' : isActive ? 'bg-blue-500/80' : 'bg-transparent'}`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className={`text-white ${isActive ? 'text-opacity-100' : 'text-opacity-70'}`}>
                  {item.icon}
                </div>
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default MobileBottomNav;
