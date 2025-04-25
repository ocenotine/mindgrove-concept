
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Upload,
  BookOpen,
  User,
  MessageSquare
} from 'lucide-react';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: 'Home',
      icon: <Home className="h-5 w-5" />,
      href: '/dashboard',
    },
    {
      label: 'Documents',
      icon: <FileText className="h-5 w-5" />,
      href: '/documents',
    },
    {
      label: 'Upload',
      icon: <Upload className="h-5 w-5" />,
      href: '/document/upload',
    },
    {
      label: 'Flashcards',
      icon: <BookOpen className="h-5 w-5" />,
      href: '/flashcards',
    },
    {
      label: 'AI Chat',
      icon: <MessageSquare className="h-5 w-5" />,
      href: '/chat',
    },
    {
      label: 'Profile',
      icon: <User className="h-5 w-5" />,
      href: '/profile',
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative"
              onClick={() => navigate(item.href)}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -inset-1 bg-primary/10 rounded-full"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <div className={`${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.icon}
                </div>
              </div>
              <span className={`text-xs mt-0.5 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
