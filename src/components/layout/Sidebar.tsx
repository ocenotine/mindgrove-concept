
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Home,
  FileText,
  Upload,
  BookOpen,
  Settings,
  LogOut,
  MessageSquare,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar = ({ isCollapsed = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { signOut } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
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
      label: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      href: '/profile',
    },
  ];

  if (isMobile) {
    return null; // Don't render sidebar on mobile - it will be handled by MobileBottomNav
  }

  return (
    <div className={`h-screen ${isCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border shadow-sm flex flex-col`}>
      {/* Logo */}
      <div className="px-4 py-5 flex items-center">
        <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mr-3">
          <img
            src="/mindgrove.png"
            alt="MindGrove Logo"
            className="w-8 h-8"
          />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold text-foreground">MindGrove</h1>
            <p className="text-xs text-muted-foreground">Research Assistant</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={location.pathname === item.href ? 'secondary' : 'ghost'}
            className={`w-full justify-${isCollapsed ? 'center' : 'start'} ${
              location.pathname === item.href
                ? 'bg-muted'
                : ''
            }`}
            onClick={() => navigate(item.href)}
          >
            {item.icon}
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </Button>
        ))}
      </nav>

      <div className="p-4">
        <Button
          variant="outline"
          className={`w-full justify-${isCollapsed ? 'center' : 'start'} text-muted-foreground`}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
