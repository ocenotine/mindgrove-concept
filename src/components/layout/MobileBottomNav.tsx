
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FileText, Book, User, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  label: string;
}

const NavItem = ({ href, icon, isActive, label }: NavItemProps) => {
  return (
    <Link 
      to={href} 
      className={cn(
        "relative p-2 rounded-full transition-all duration-200 flex flex-col items-center justify-center",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
      aria-label={label}
    >
      <div className="w-5 h-5 relative z-10">{icon}</div>
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary/10 rounded-full -z-10 shadow-[0_0_15px_rgba(155,135,245,0.4)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

const MobileBottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center px-10 w-full pb-4"
    >
      <div className="w-full max-w-md backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-full shadow-lg transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-around p-3">
          <NavItem 
            href="/dashboard" 
            icon={<Home className="h-5 w-5" />} 
            isActive={isActive("/dashboard")} 
            label="Home"
          />
          <NavItem 
            href="/documents" 
            icon={<FileText className="h-5 w-5" />} 
            isActive={isActive("/documents")} 
            label="Docs"
          />
          <NavItem 
            href="/document/upload" 
            icon={<PlusCircle className="h-5 w-5" />} 
            isActive={isActive("/document/upload")} 
            label="Add"
          />
          <NavItem 
            href="/flashcards" 
            icon={<Book className="h-5 w-5" />} 
            isActive={isActive("/flashcards")} 
            label="Cards"
          />
          <NavItem 
            href="/profile" 
            icon={<User className="h-5 w-5" />} 
            isActive={isActive("/profile")} 
            label="Profile"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
