
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in to MindGrove.",
        variant: "success",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Invalid email or password',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-opacity-80">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="rgrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3730A3" stopOpacity="0" />
              </radialGradient>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <rect width="50" height="50" fill="url(#rgrad)" />
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            className="flex justify-center mb-6"
            variants={itemVariants}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center p-0.5 shadow-lg shadow-primary/30">
              <img 
                src="/lovable-uploads/65960bde-d697-478f-82ae-b981a1ed9307.png"
                alt="MindGrove"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
            variants={itemVariants}
          >
            Welcome back
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            variants={itemVariants}
          >
            Sign in to continue your research journey
          </motion.p>
        </div>
        
        <motion.div variants={itemVariants}>
          <Card className="border border-white/10 shadow-xl backdrop-blur-md bg-white/5">
            <CardHeader>
              <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Sign In</CardTitle>
              <CardDescription className="text-gray-400">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-gray-300">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/90 transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-white/10 pt-5">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:text-primary/90 font-medium transition-colors">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.p
          variants={itemVariants}
          className="text-center mt-6 text-xs text-gray-500"
        >
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
