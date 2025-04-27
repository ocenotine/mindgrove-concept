
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { PageTransition } from '@/components/animations/PageTransition';
import { Mail, Lock, ArrowRight, LogIn, Github, ArrowLeft } from 'lucide-react';
import ParallaxScroll from '@/components/animations/ParallaxScroll';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    // Redirect based on account type
    if (user?.user_metadata?.account_type === 'institution') {
      navigate('/institution/dashboard');
    } else {
      navigate('/dashboard');
    }
    return null;
  }

  const handleBackToLanding = () => {
    navigate('/landing');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      
      toast({
        title: "Login successful",
        description: "Welcome back to MindGrove!",
        variant: "default"
      });
      
      // Redirect will happen via the isAuthenticated check above on the next render
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToLanding}
            className="hover:bg-muted/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Left side - Form */}
          <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground mt-2">
                  Sign in to your MindGrove account
                </p>
              </div>
              
              <Card className="p-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="email" 
                        placeholder="Email" 
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
                        type="password" 
                        placeholder="Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                    <div className="text-right">
                      <Link 
                        to="/forgot-password" 
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign in
                      </span>
                    )}
                  </Button>
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGoogleLogin}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                  </div>
                </form>
              </Card>
              
              <p className="text-center mt-6 text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
          
          {/* Right side - Decoration with custom image */}
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary/20 to-primary/30 p-12">
            <div className="h-full flex flex-col justify-center">
              <ParallaxScroll direction="up" speed={0.3}>
                <div className="text-center">
                  <img 
                    src="//mindgrove.png/d501d0da-a7b8-48c8-82f1-fea9624331d3.png" 
                    alt="MindGrove AI Research" 
                    className="mx-auto max-w-full h-auto mb-6"
                  />
                  
                  <div className="max-w-sm mx-auto p-6 mt-6 rounded-lg bg-card/90 backdrop-blur-sm border shadow-lg">
                    <p className="text-base font-medium">
                      "MindGrove has transformed my study habits completely. I've gone from struggling to maintain focus to establishing a consistent study streak for over 30 days!"
                    </p>
                    <div className="mt-4 flex items-center justify-center">
                      <div className="relative w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-semibold">JK</span>
                      </div>
                      <div className="ml-3 text-left">
                        <p className="font-medium text-sm">John K.</p>
                        <p className="text-xs text-muted-foreground">Computer Science Student</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ParallaxScroll>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
