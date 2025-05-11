
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition } from '@/components/animations/PageTransition';
import { toast } from '@/hooks/use-toast';
import { Lock, Mail, LogIn } from 'lucide-react';
import { supabase, getUserProfile, cleanupAuthState, ensureUserProfile } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/authStore';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setSession } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    emailInput?.setCustomValidity('');
    passwordInput?.setCustomValidity('');
    
    // Basic validation
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      emailInput?.setCustomValidity('Please enter a valid email');
      emailInput?.reportValidity();
      return;
    }
    
    if (!password || password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      passwordInput?.setCustomValidity('Password must be at least 6 characters');
      passwordInput?.reportValidity();
      return;
    }
    
    setLoading(true);
    
    try {
      // Clear local storage to prevent conflicts
      await cleanupAuthState();
      
      console.log("Attempting admin login with email:", email);
      
      // Sign in with credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Admin login error:", error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login failed",
            description: error.message,
            variant: "destructive",
          });
        }
        
        return;
      }
      
      if (!data || !data.user) {
        throw new Error("No user data returned after authentication");
      }
      
      const authData = data;
      
      if (email !== 'admin@mindgrove.com') {
        toast({
          title: "Access denied",
          description: "This login is reserved for administrators only.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }
      
      console.log("Admin auth successful, user:", authData.user);
      
      // Ensure user profile exists (critical step that was missing before)
      try {
        await ensureUserProfile(authData.user.id, authData.user.email || "", "admin");
      } catch (profileErr) {
        console.error("Error ensuring profile exists:", profileErr);
        // Continue anyway as the login was successful
      }
      
      // Get the profile to verify admin status
      const profile = await getUserProfile(authData.user.id);
      console.log("Admin profile:", profile);
      
      if (!profile || profile.account_type !== 'admin') {
        console.log("Updating profile to admin type");
        // Update the profile to ensure admin status
        await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: authData.user.email,
            account_type: 'admin',
            updated_at: new Date().toISOString()
          });
      }
      
      // Set auth store
      setSession(authData.session);
      setUser({
        ...authData.user,
        account_type: 'admin',
        name: authData.user.user_metadata?.full_name || authData.user.email || 'Admin',
        avatarUrl: authData.user.user_metadata?.avatar_url,
        user_metadata: {
          ...authData.user.user_metadata,
          account_type: 'admin'
        }
      });
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel!",
      });
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
      
    } catch (err) {
      console.error("Error during admin login:", err);
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-[420px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center">
              <Lock className="mr-2 h-5 w-5" /> Admin Login
            </CardTitle>
            <CardDescription>
              Enter your credentials to access the admin panel
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </span>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;
