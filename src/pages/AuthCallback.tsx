
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { PageTransition } from '@/components/animations/PageTransition';
import LoadingAnimation from '@/components/animations/LoadingAnimation';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { setUser, setSession } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is a redirect from OAuth
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        // If we have tokens in the URL, set the session
        if (accessToken && refreshToken) {
          console.log("Found OAuth tokens in URL, setting session");
          
          // Exchange the tokens for a session
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (sessionError) {
            throw sessionError;
          }
          
          if (data.session) {
            // Process user metadata
            const user = data.session?.user ? {
              ...data.session.user,
              name: data.session.user.user_metadata?.name || 
                    data.session.user.user_metadata?.full_name ||
                    data.session.user.email?.split('@')[0],
              account_type: data.session.user.user_metadata?.account_type || 'student',
              avatarUrl: data.session.user.user_metadata?.avatar_url,
              institution_id: data.session.user.user_metadata?.institution_id,
              subscription_tier: 'free',
              subscription_expiry: null,
              is_first_login: false
            } : null;
            
            // Set user and session in store
            setSession(data.session);
            setUser(user);
            
            // Redirect based on user type
            if (user?.user_metadata?.account_type === 'institution') {
              navigate('/institution/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${user?.name || 'User'}!`,
            });
            
            return;
          }
        }
        
        // Fallback to getting current session
        const { data, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          throw getSessionError;
        }
        
        if (data.session) {
          // Process user metadata
          const user = data.session?.user ? {
            ...data.session.user,
            name: data.session.user.user_metadata?.name || 
                  data.session.user.user_metadata?.full_name ||
                  data.session.user.email?.split('@')[0],
            account_type: data.session.user.user_metadata?.account_type || 'student',
            avatarUrl: data.session.user.user_metadata?.avatar_url,
            institution_id: data.session.user.user_metadata?.institution_id,
            subscription_tier: 'free',
            subscription_expiry: null,
            is_first_login: false
          } : null;
          
          // Set user and session in store
          setSession(data.session);
          setUser(user);
          
          // Redirect based on user type
          if (user?.user_metadata?.account_type === 'institution') {
            navigate('/institution/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          
          toast({
            title: "Login successful",
            description: `Welcome back, ${user?.name || 'User'}!`,
          });
        } else {
          navigate('/login', { replace: true });
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setError(error.message || "There was a problem signing you in");
        toast({
          title: "Authentication error",
          description: error.message || "There was a problem signing you in. Please try again.",
          variant: "destructive"
        });
        
        // Wait a moment before redirecting to ensure the toast is visible
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };
    
    handleAuthCallback();
  }, [navigate, setSession, setUser]);

  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {error ? (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Authentication Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm">Redirecting to login page...</p>
          </div>
        ) : (
          <>
            <LoadingAnimation />
            <p className="text-center text-muted-foreground mt-4">Completing authentication...</p>
            <p className="text-center text-sm mt-2">Please wait while we sign you in</p>
          </>
        )}
      </div>
    </PageTransition>
  );
};

export default AuthCallback;
