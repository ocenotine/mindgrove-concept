import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  UserRound,
  LogOut,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  isCollapsed: boolean;
}

const Sidebar = ({ isCollapsed }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else if (isCollapsed !== undefined) {
      setIsOpen(!isCollapsed);
    } else {
      setIsOpen(true);
    }
  }, [location.pathname, isMobile, isCollapsed]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sidebarWidth = isOpen ? "w-64" : "w-16";
  const sidebarMobilePosition = isOpen ? "left-0" : "-left-full";

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      dataTour: "dashboard",
    },
    {
      name: "Documents",
      icon: <FileText className="h-5 w-5" />,
      path: "/documents",
      dataTour: "documents",
    },
    {
      name: "Flashcards",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/flashcards",
      dataTour: "flashcards",
    },
    {
      name: "AI Chat",
      icon: <MessageSquare className="h-5 w-5" />,
      path: "/chat",
      dataTour: "chat",
    },
  ];

  if (user?.account_type === 'institution' || user?.account_type === 'admin') {
    menuItems.push({
      name: "Institution",
      icon: <Building className="h-5 w-5" />,
      path: "/institution/dashboard",
      dataTour: "institution",
    });
  }

  return (
    <>
      {isOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 left-4 z-50"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      <motion.aside
        className={`h-full fixed ${
          isMobile ? sidebarMobilePosition : sidebarWidth
        } top-0 border-r bg-card z-40 transition-all duration-300 ease-in-out ${
          isMobile ? "top-0 bottom-0" : "pt-16"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-center">
            {isOpen ? (
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                MindGrove
              </h1>
            ) : (
              <span className="text-2xl font-bold text-primary">M</span>
            )}
          </div>

          <nav className="flex-1 px-2 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path} data-tour={item.dataTour}>
                    <Link to={item.path}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={`w-full justify-start ${
                          isOpen ? "" : "justify-center"
                        } mb-1`}
                      >
                        <span className={`${isOpen ? "mr-3" : ""}`}>
                          {item.icon}
                        </span>
                        {isOpen && <span>{item.name}</span>}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-2">
              {isOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-1">
              <Link to="/profile" data-tour="profile">
                <Button
                  variant={location.pathname === '/profile' ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    isOpen ? "" : "justify-center"
                  }`}
                >
                  <UserRound className={`h-5 w-5 ${isOpen ? "mr-3" : ""}`} />
                  {isOpen && <span>Profile</span>}
                </Button>
              </Link>
              
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  isOpen ? "" : "justify-center"
                }`}
                onClick={handleLogout}
              >
                <LogOut className={`h-5 w-5 ${isOpen ? "mr-3" : ""}`} />
                {isOpen && <span>Logout</span>}
              </Button>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
