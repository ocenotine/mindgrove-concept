import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { markNewAccount } from '@/utils/userOnboardingUtils';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Loader2, Shield, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuthStore();
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await signUp(email, password, name);
      
      // Mark as a new account to trigger the tour guide
      markNewAccount();
      
      toast({
        title: "Account created!",
        description: "Welcome to MindGrove. Let's get started!",
        variant: "success",
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to sign up',
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
      <Link 
        to="/landing" 
        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
      >
        <ArrowLeft className="h-6 w-6 text-white" />
      </Link>
      
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
                src="/mindgrove.png"
                alt="MindGrove"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300"
            variants={itemVariants}
          >
            Create your account
          </motion.h1>
          <motion.p 
            className="text-muted-foreground"
            variants={itemVariants}
          >
            Join MindGrove and organize your research materials
          </motion.p>
        </div>
        
        <motion.div variants={itemVariants}>
          <Card className="border border-white/10 shadow-xl backdrop-blur-md bg-white/5">
            <CardHeader>
              <CardTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">Sign Up</CardTitle>
              <CardDescription className="text-gray-400">Enter your information to create an account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>
                </div>
                
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
                  <Label htmlFor="password" className="text-gray-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary"
                    />
                  </div>
                  {password && (
                    <div className="flex items-center mt-1 gap-1">
                      <Shield className={`h-3 w-3 ${password.length >= 8 ? 'text-green-500' : 'text-gray-500'}`} />
                      <span className={`text-xs ${password.length >= 8 ? 'text-green-500' : 'text-gray-500'}`}>
                        At least 8 characters
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:border-primary ${
                        confirmPassword && password !== confirmPassword ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Sign Up
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t border-white/10 pt-5">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:text-primary/90 font-medium transition-colors">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.p
          variants={itemVariants}
          className="text-center mt-6 text-xs text-gray-500"
        >
          By signing up, you agree to our{' '}
          <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;
