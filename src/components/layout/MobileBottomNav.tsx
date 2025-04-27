
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Zap, Brain, User, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileBottomNav = () => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-background border-t border-border/40 py-2 px-6 md:hidden z-10">
      <div className="flex justify-between items-center">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center p-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </NavLink>

        <NavLink 
          to="/documents" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center p-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="text-xs mt-1">Docs</span>
        </NavLink>

        <NavLink 
          to="/ai-chat" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center p-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Brain className="h-5 w-5" />
          <span className="text-xs mt-1">AI Chat</span>
        </NavLink>

        <NavLink 
          to="/progress" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center p-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <BarChart className="h-5 w-5" />
          <span className="text-xs mt-1">Progress</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center p-2",
            isActive ? "text-primary" : "text-muted-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
