
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, ensureUserProfile } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession, setUser } = useAuthStore();
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("AuthCallback: Processing auth callback");
        // Get the URL parameters
        const params = new URLSearchParams(location.search);
        const hash = location.hash || window.location.hash;
        const autoLogin = params.get('autoLogin') === 'true';
        
        // Try to extract parameters from the URL hash
        let hashParams;
        if (hash && hash.includes('access_token')) {
          const hashString = hash.substring(1);
          hashParams = Object.fromEntries(new URLSearchParams(hashString));
        }
        
        // Check if this is a password reset callback
        if (location.hash?.includes('type=recovery')) {
          setMessage('Redirecting to password reset...');
          navigate('/reset-password');
          return;
        }
        
        console.log("AuthCallback: Getting session");
        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (data?.session) {
          // We have a session, process it
          console.log("AuthCallback: Session found", data.session.user?.email);
          setSession(data.session);
          setUser(data.session.user);
          
          // Create profile if needed
          if (data.session.user) {
            console.log("Creating profile if needed for:", data.session.user.email);
            try {
              await ensureUserProfile(
                data.session.user.id, 
                data.session.user.email || '', 
                data.session.user.email === 'admin@mindgrove.com' ? 'admin' : 'student'
              );
            } catch (profileErr) {
              console.error("Error ensuring user profile:", profileErr);
            }
          }
          
          // If this was an email confirmation/verification
          if (autoLogin || hashParams?.type === 'signup') {
            setMessage('Email verified! Logging you in...');
            toast({
              title: "Email verified",
              description: "Your email has been verified. Welcome to MindGrove!",
            });
            
            // Redirect based on account type after a short delay
            setTimeout(async () => {
              try {
                // Get account type
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('account_type')
                  .eq('id', data.session?.user?.id)
                  .single();
                
                console.log("Profile data:", profileData);
                
                const accountType = profileData?.account_type || 
                                  data.session?.user?.user_metadata?.account_type || 
                                  'student';
                
                console.log("Account type:", accountType);
                
                if (accountType === 'admin') {
                  navigate('/admin/dashboard');
                } else if (accountType === 'institution') {
                  navigate('/institution/dashboard');
                } else {
                  navigate('/dashboard');
                }
              } catch (err) {
                console.error("Error getting profile:", err);
                // If there's an error getting the profile, default to student dashboard
                navigate('/dashboard');
              }
            }, 1500);
          } else {
            // Get account type for routing
            try {
              const { data: profileData } = await supabase
                .from('profiles')
                .select('account_type')
                .eq('id', data.session?.user?.id)
                .single();
              
              console.log("Profile data for routing:", profileData);
              
              const accountType = profileData?.account_type || 
                                data.session?.user?.user_metadata?.account_type || 
                                'student';
              
              console.log("Routing based on account type:", accountType);
              
              if (accountType === 'admin') {
                navigate('/admin/dashboard');
              } else if (accountType === 'institution') {
                navigate('/institution/dashboard');
              } else {
                navigate('/dashboard');
              }
            } catch (err) {
              console.error("Error routing user:", err);
              // If there's an error getting the profile, default to student dashboard
              navigate('/dashboard');
            }
          }
        } else {
          // No session found
          setMessage('Authentication failed. Redirecting to login...');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        setMessage('Authentication error. Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleAuthCallback();
  }, [location, navigate, setSession, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
        <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Authentication in progress</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
