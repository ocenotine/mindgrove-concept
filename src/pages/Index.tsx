
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/animations/LoadingAnimation';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, initialize } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    initialize: state.initialize
  }));
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Initialize auth store first
        await initialize();
        
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          navigate('/dashboard');
        } else {
          navigate('/landing');
        }
      } catch (error) {
        console.error("Auth check error:", error);
        navigate('/landing');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate, initialize]);
  
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-screen">
        {isChecking && <LoadingAnimation />}
      </div>
    </PageTransition>
  );
};

export default Index;
