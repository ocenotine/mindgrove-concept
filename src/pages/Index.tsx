
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/animations/PageTransition';
import { supabase } from '@/integrations/supabase/client';
import LoadingAnimation from '@/components/animations/LoadingAnimation';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading, setUser, setSession } = useAuthStore(state => ({
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    setUser: state.setUser,
    setSession: state.setSession
  }));
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session directly
        const { data } = await supabase.auth.getSession();
        
        if (data.session) {
          // Process user metadata from session
          const user = data.session?.user ? {
            ...data.session.user,
            name: data.session.user.user_metadata?.name || data.session.user.user_metadata?.full_name,
            account_type: data.session.user.user_metadata?.account_type || 'student',
            avatarUrl: data.session.user.user_metadata?.avatar_url,
            institution_id: data.session.user.user_metadata?.institution_id || 'default_institution',
            subscription_tier: 'free',
            subscription_expiry: null,
            is_first_login: false
          } : null;
          
          // Set user and session in the store
          setSession(data.session);
          setUser(user);
          
          // Direct to appropriate dashboard based on account type
          if (user?.user_metadata?.account_type === 'institution') {
            navigate('/institution/dashboard');
          } else {
            navigate('/dashboard');
          }
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
  }, [navigate, setUser, setSession]);
  
  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-screen">
        {isChecking && <LoadingAnimation />}
      </div>
    </PageTransition>
  );
};

export default Index;
