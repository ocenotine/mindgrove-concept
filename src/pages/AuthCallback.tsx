
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/animations/PageTransition';
import LoadingAnimation from '@/components/animations/LoadingAnimation';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, setSession } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session data
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (data.session) {
          // Process user metadata
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
          
          // Set user and session in store
          setSession(data.session);
          setUser(user);
          
          // Redirect based on user type
          if (user?.user_metadata?.account_type === 'institution') {
            navigate('/institution/dashboard');
          } else {
            navigate('/dashboard');
          }
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${user?.name || 'User'}!`,
          });
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast({
          title: "Authentication error",
          description: "There was a problem signing you in. Please try again.",
          variant: "destructive"
        });
        navigate('/login');
      }
    };
    
    handleAuthCallback();
  }, [navigate, setSession, setUser]);

  return (
    <PageTransition>
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation />
        <p className="text-center text-muted-foreground mt-4">Completing authentication...</p>
      </div>
    </PageTransition>
  );
};

export default AuthCallback;
