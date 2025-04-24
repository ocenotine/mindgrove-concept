
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        navigate('/dashboard');
      } else {
        navigate('/landing');
      }
    };
    
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/landing');
      }
    } else {
      checkAuth();
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  return (
    <PageTransition>
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse">
          <p className="text-xl font-medium text-foreground">Redirecting...</p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
