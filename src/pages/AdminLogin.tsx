
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already logged in as admin
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.account_type === 'admin') {
          navigate('/admin/dashboard');
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
      
      // Check if the user exists in the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', authData.user.id)
        .single();
      
      // If profile doesn't exist yet, create it for admin
      if (profileError && profileError.code === 'PGRST116') {
        console.log("Profile doesn't exist, creating admin profile...");
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: 'Admin',
            account_type: 'admin'
          });
        
        if (insertError) {
          console.error("Error creating profile:", insertError);
          throw new Error('Failed to create admin profile');
        }
        
        // Set admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        toast({
          title: "Admin profile created",
          description: "Welcome to the MindGrove admin dashboard",
        });
        
        navigate('/admin/dashboard');
        return;
      }
      
      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }
      
      // If user exists but is not an admin, make them an admin if they're using admin credentials
      if (email === 'admin@mindgrove.com' && !profileData?.account_type) {
        console.log("Setting user as admin...");
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ account_type: 'admin' })
          .eq('id', authData.user.id);
        
        if (updateError) {
          console.error("Update error:", updateError);
          throw updateError;
        }
        
        // Set admin session
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        
        toast({
          title: "Admin access granted",
          description: "Welcome to the MindGrove admin dashboard",
        });
        
        navigate('/admin/dashboard');
        return;
      }
      
      if (profileData?.account_type !== 'admin') {
        // If user exists but is not an admin, force them to be an admin if using correct credentials
        if (email === 'admin@mindgrove.com') {
          console.log("Updating to admin account_type...");
          
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ account_type: 'admin' })
            .eq('id', authData.user.id);
          
          if (updateError) {
            console.error("Admin update error:", updateError);
            throw updateError;
          }
          
          // Set admin session
          localStorage.setItem('adminLoggedIn', 'true');
          localStorage.setItem('adminLoginTime', Date.now().toString());
          
          toast({
            title: "Admin access granted",
            description: "Welcome to the MindGrove admin dashboard",
          });
          
          navigate('/admin/dashboard');
          return;
        } else {
          // Log out the user if they're not an admin
          await supabase.auth.signOut();
          throw new Error('Access denied. Your account does not have administrator privileges.');
        }
      }
      
      // Log successful admin login
      console.log('Admin login successful:', authData.user.email);
      
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
