
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  Book, 
  User, 
  Settings, 
  ChevronRight,
  PlusCircle,
  BookOpen
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  hasSubItems?: boolean;
  isCollapsed?: boolean;
}

const SidebarItem = ({ 
  icon, 
  label, 
  href, 
  isActive = false,
  hasSubItems = false,
  isCollapsed = false 
}: SidebarItemProps) => {
  return (
    <Link
      to={href}
      className={cn(
        'sidebar-item relative',
        isActive ? 'active' : '',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}
    >
      <div className="flex items-center gap-3 relative z-10">
        <span className={isActive ? "text-white" : ""}>
          {icon}
        </span>
        {!isCollapsed && <span className={isActive ? "text-white" : ""}>{label}</span>}
      </div>
      {hasSubItems && !isCollapsed && (
        <ChevronRight className="h-4 w-4" />
      )}
      
      {isActive && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-primary/20 rounded-xl -z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div 
      className={cn(
        "flex flex-col h-full bg-sidebar rounded-r-xl",
        isCollapsed ? "w-16" : "w-64"
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Sidebar header */}
      <div className="py-6 px-3 border-b border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-brand text-sidebar-foreground">MindGrove</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar content */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          label="Dashboard"
          href="/dashboard"
          isActive={isActive("/dashboard")}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          icon={<FileText className="h-5 w-5" />}
          label="My Documents"
          href="/documents"
          isActive={isActive("/documents")}
          isCollapsed={isCollapsed}
        />
        <SidebarItem
          icon={<Book className="h-5 w-5" />}
          label="Flashcards"
          href="/flashcards"
          isActive={isActive("/flashcards")}
          isCollapsed={isCollapsed}
        />
        
        <SidebarItem
          icon={<User className="h-5 w-5" />}
          label="Profile"
          href="/profile"
          isActive={isActive("/profile")}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Sidebar footer */}
      <div className="mt-auto border-t border-sidebar-border/50 p-4">
        {!isCollapsed ? (
          <Link
            to="/document/upload"
            className="flex items-center justify-center gap-2 w-full p-3 bg-primary/20 hover:bg-primary/30 text-white rounded-xl transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Upload Document</span>
          </Link>
        ) : (
          <Link
            to="/document/upload"
            className="flex items-center justify-center w-full p-3 bg-primary/20 hover:bg-primary/30 text-white rounded-xl transition-all duration-200"
          >
            <PlusCircle className="h-4 w-4" />
          </Link>
        )}
      </div>
    </motion.div>
  );
};

export default Sidebar;
