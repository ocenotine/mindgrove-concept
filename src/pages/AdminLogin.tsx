
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, LogIn } from 'lucide-react';
import { supabase, ensureUserProfile } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setSession, setUser, cleanupAuthState } = useAuthStore();

  useEffect(() => {
    // Check if already logged in as admin
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Get profile to check if admin
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('account_type')
            .eq('id', session.user.id)
            .single();
          
          console.log("Checking admin status, profile:", profile);
          
          if (profile?.account_type === 'admin') {
            navigate('/admin/dashboard');
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
        }
      }
    };
    
    checkAdminStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log("Attempting admin login with:", email);
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Try global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
      }
      
      // First, try to log in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error("No user returned from auth");
        throw new Error('Login failed - no user returned');
      }
      
      console.log("Auth successful, checking if admin...");
      
      // Ensure profile exists
      await ensureUserProfile(authData.user.id, email, 'admin');
      
      // Check if the user is an admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', authData.user.id)
        .single();
      
      console.log("Profile data:", profileData, "Error:", profileError);
      
      // Special case for admin@mindgrove.com
      if (email === 'admin@mindgrove.com') {
        console.log("Admin login detected, setting admin session");
        
        // Update the profile to be admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ account_type: 'admin' })
          .eq('id', authData.user.id);
        
        if (updateError) {
          console.error("Admin update error:", updateError);
        } else {
          console.log("Admin profile updated successfully");
        }
        
        // Set session in auth store
        setSession(authData.session);
        setUser({
          ...authData.user,
          account_type: 'admin'
        });
        
        // Set admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        toast({
          title: "Admin login successful",
          description: "Welcome to the MindGrove admin dashboard",
        });
        
        navigate('/admin/dashboard');
        return;
      }
      
      if (profileData?.account_type !== 'admin') {
        // Log out the user if they're not an admin
        await supabase.auth.signOut();
        throw new Error('Access denied. Your account does not have administrator privileges.');
      }
      
      // Log successful admin login
      console.log('Admin login successful:', authData.user.email);
      
      // Set session in auth store
      setSession(authData.session);
      setUser({
        ...authData.user,
        account_type: 'admin'
      });
      
      // Set admin session
      localStorage.setItem('adminLoggedIn', 'true');
      localStorage.setItem('adminLoginTime', Date.now().toString());
      
      toast({
        title: "Admin login successful",
        description: "Welcome to the MindGrove admin dashboard",
      });
      
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      setError(error instanceof Error ? error.message : 'Invalid email or password');
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid admin credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login as Admin
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-sm"
            >
              Back to user login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;
