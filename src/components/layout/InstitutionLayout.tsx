
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Users, BarChart3, Mail, Settings, LogOut, Menu, X, FileText, MessageSquare, CreditCard, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/integrations/supabase/client';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface InstitutionLayoutProps {
  children: React.ReactNode;
}

const InstitutionLayout: React.FC<InstitutionLayoutProps> = ({ children }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [institutionName, setInstitutionName] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  
  useEffect(() => {
    // Get institution data
    const getInstitutionData = async () => {
      if (!user?.user_metadata?.institution_id && !user?.institution_id) return;
      
      try {
        const institutionId = user?.user_metadata?.institution_id || user?.institution_id;
        
        const { data, error } = await supabase
          .from('institutions')
          .select('name, is_premium')
          .eq('id', institutionId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setInstitutionName(data.name);
          setIsPremium(data.is_premium);
        }
      } catch (error) {
        console.error("Error fetching institution data:", error);
      }
    };
    
    getInstitutionData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationLinks = [
    { 
      name: 'Dashboard', 
      href: '/institution/dashboard',
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      name: 'Users', 
      href: '/institution/users',
      icon: <Users className="h-5 w-5" />,
      premium: true
    },
    { 
      name: 'Documents', 
      href: '/documents',
      icon: <FileText className="h-5 w-5" />
    },
    { 
      name: 'AI Chat', 
      href: '/institution/ai-chat',
      icon: <MessageSquare className="h-5 w-5" />
    },
    { 
      name: 'Subscription', 
      href: '/institution/subscription',
      icon: <CreditCard className="h-5 w-5" />
    },
    { 
      name: 'Settings', 
      href: '/institution/settings',
      icon: <Settings className="h-5 w-5" />
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-4 border-b font-semibold flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <span>{institutionName || 'Institution Portal'}</span>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {navigationLinks.map((link) => (
                    <li key={link.href}>
                      {(!link.premium || (link.premium && isPremium)) && (
                        <Button
                          variant={isActive(link.href) ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          asChild
                        >
                          <Link to={link.href} className="flex items-center gap-3">
                            {link.icon}
                            {link.name}
                            {link.premium && !isPremium && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Premium</span>
                            )}
                          </Link>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/institution/dashboard" className="flex items-center gap-2 font-semibold">
            <Building className="h-5 w-5 text-primary" />
            <span>{institutionName || 'Institution Portal'}</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate('/profile')}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.email || ''} />
              <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-col w-64 border-r">
          <div className="p-4 border-b font-semibold flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            <span>{institutionName || 'Institution Portal'}</span>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  {(!link.premium || (link.premium && isPremium)) && (
                    <Button
                      variant={isActive(link.href) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to={link.href} className="flex items-center gap-3">
                        {link.icon}
                        {link.name}
                        {link.premium && !isPremium && (
                          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Premium</span>
                        )}
                      </Link>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="flex items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.email || ''} />
                  <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium truncate max-w-[120px]">{user?.email}</span>
              </Button>
              <ThemeToggle variant="ghost" size="sm" />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center gap-2" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default InstitutionLayout;
