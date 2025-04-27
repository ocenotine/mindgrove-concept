
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  Settings, 
  Users, 
  BadgeDollarSign,
  MessageSquare,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BrandingColors } from '@/types/institution';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const InstitutionSidebar = ({ isCollapsed, toggleCollapse }: SidebarProps) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [primaryColor, setPrimaryColor] = useState('#6C72CB');
  const [secondaryColor, setSecondaryColor] = useState('#CB69C1');
  
  useEffect(() => {
    // Function to fetch institution branding colors
    const fetchBrandingColors = async () => {
      if (user?.institution_id) {
        try {
          const { data, error } = await supabase
            .from('institutions')
            .select('branding_colors')
            .eq('id', user.institution_id)
            .single();
            
          if (data?.branding_colors) {
            // Safely handle the branding_colors
            let brandingColors: BrandingColors = { primary: '#6C72CB', secondary: '#CB69C1' };
            
            if (typeof data.branding_colors === 'object') {
              const colors = data.branding_colors as any;
              if (colors.primary) brandingColors.primary = colors.primary;
              if (colors.secondary) brandingColors.secondary = colors.secondary;
            }
            
            setPrimaryColor(brandingColors.primary);
            setSecondaryColor(brandingColors.secondary);
          }
        } catch (error) {
          console.error("Error fetching branding colors:", error);
        }
      }
    };
    
    fetchBrandingColors();
  }, [user?.institution_id]);

  const institutionName = user?.user_metadata?.institution_name || 'Institution';

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/institution/dashboard',
    },
    {
      title: 'AI Chat',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/institution/ai-chat',
    },
    {
      title: 'User Management',
      icon: <Users className="w-5 h-5" />,
      path: '/institution/users',
    },
    {
      title: 'Subscription',
      icon: <BadgeDollarSign className="w-5 h-5" />,
      path: '/institution/subscription',
    },
    {
      title: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/institution/settings',
    },
    {
      title: 'Profile',
      icon: <User className="w-5 h-5" />,
      path: '/profile',
    },
  ];

  const gradientStyle = {
    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
  };

  return (
    <div className={cn(
      "h-screen fixed top-0 left-0 z-40 bg-sidebar-background text-sidebar-foreground flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )} 
    style={{ background: '#191C27' }}>
      <div className="relative p-4 flex justify-between items-center">
        <div className={isCollapsed ? "justify-center w-full" : "flex items-center space-x-2"}>
          {isCollapsed ? (
            <div className="w-8 h-8 rounded-full" style={gradientStyle}></div>
          ) : (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full mr-2" style={gradientStyle}></div>
              <h1 className="text-lg font-semibold truncate" style={gradientStyle}>
                {institutionName}
              </h1>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "p-0 w-8 h-8 absolute -right-4 top-10 rounded-full bg-primary shadow-md text-primary-foreground",
            isCollapsed ? "-right-4" : "-right-4"
          )}
          onClick={toggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              to={item.path}
              key={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                isActive 
                  ? "bg-primary/15 text-primary" 
                  : "text-sidebar-foreground hover:bg-primary/10",
                isCollapsed && "justify-center"
              )}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="p-2 border-t border-sidebar-border/10">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
            isCollapsed && "justify-center"
          )}
          onClick={logout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          {!isCollapsed && "Sign out"}
        </Button>
      </div>
    </div>
  );
};

export default InstitutionSidebar;
