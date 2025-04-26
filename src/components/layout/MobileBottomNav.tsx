
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Home, FileText, BookOpen, MessagesSquare, User, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  
  // Determine if this is an admin user
  const isAdmin = user?.account_type === 'admin';
  
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: 'Home',
      href: '/dashboard',
      dataTour: 'dashboard'
    },
    {
      icon: <FileText className="h-5 w-5" />,
      label: 'Docs',
      href: '/documents',
      dataTour: 'documents'
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      label: 'Cards',
      href: '/flashcards',
      dataTour: 'flashcards'
    },
    {
      icon: <MessagesSquare className="h-5 w-5" />,
      label: 'Chat',
      href: '/chat',
      dataTour: 'chat'
    }
  ];
  
  // Add institution dashboard for admins
  if (isAdmin) {
    navItems.push({
      icon: <BarChart3 className="h-5 w-5" />,
      label: 'Institution',
      href: '/institution/dashboard',
      dataTour: 'institution'
    });
  }
  
  // Add profile link at the end
  navItems.push({
    icon: <User className="h-5 w-5" />,
    label: 'Profile',
    href: '/profile',
    dataTour: 'profile'
  });
  
  // Only show 5 items max
  const displayItems = navItems.slice(0, 5);
  
  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-md border-t z-40 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <nav className="h-full max-w-md mx-auto grid grid-cols-5 gap-1">
        {displayItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center text-xs ${
                isActive ? 'text-primary font-medium' : 'text-muted-foreground'
              }`}
              data-tour={item.dataTour}
            >
              <motion.div 
                className={`relative p-1.5 rounded-full ${isActive ? 'bg-primary/10' : ''}`}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
                {isActive && (
                  <motion.div
                    className="absolute -bottom-3 left-1/2 w-1.5 h-1.5 bg-primary rounded-full"
                    layoutId="navIndicator"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    style={{ x: '-50%' }}
                  />
                )}
              </motion.div>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </motion.div>
  );
};

export default MobileBottomNav;
