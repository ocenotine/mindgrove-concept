
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Zap, Brain, Settings, LogOut, BarChart, FileQuestion } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  // Menu items with their icons
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Flashcards', path: '/flashcards', icon: Zap },
    { name: 'AI Chat', path: '/ai-chat', icon: Brain },
    { name: 'Progress', path: '/progress', icon: BarChart },
    { name: 'Quiz', path: '/quiz', icon: FileQuestion },
  ];
  
  // Bottom menu items
  const bottomMenuItems = [
    { name: 'Profile Settings', path: '/profile', icon: Settings },
    { name: 'Log Out', path: '#', icon: LogOut, onClick: logout },
  ];
  
  return (
    <div className="h-full bg-background/80 flex flex-col w-16 min-w-16 md:w-64 md:min-w-64 transition-all duration-300 border-r border-border/40 shadow-sm">
      {/* Logo and Brand section */}
      <div className="py-5 px-4 flex flex-col items-center md:items-start border-b border-border/40">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xl">
            <img src="/mindgrove.png" alt="MindGrove" className="w-6 h-6" />
          </div>
          <span className="font-semibold text-lg hidden md:block">MindGrove</span>
        </Link>
      </div>
      
      {/* Main navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors relative",
                    active 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className="flex-shrink-0 flex items-center justify-center">
                    <Icon className={cn(
                      "h-5 w-5",
                      active ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className="hidden md:block">{item.name}</span>
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Bottom navigation */}
      <div className="border-t border-border/40 py-4 px-2">
        <ul className="space-y-1">
          {bottomMenuItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors w-full text-left",
                      active 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <Icon className={cn(
                        "h-5 w-5",
                        active ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className="hidden md:block">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                      active 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <Icon className={cn(
                        "h-5 w-5",
                        active ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <span className="hidden md:block">{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
