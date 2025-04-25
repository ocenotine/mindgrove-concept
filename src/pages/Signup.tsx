
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Key, Mail, Check, Loader } from 'lucide-react';
import { PageTransition } from '@/components/animations/PageTransition';
import confetti from 'canvas-confetti';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signUp(email, password, name);
      
      // Show success toast
      toast({
        title: "Account created!",
        description: "Welcome to MindGrove! Your account has been created successfully.",
      });

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Signup Failed",
        description: error instanceof Error ? error.message : "There was an error creating your account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/landing')} 
            className="mb-8 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src="/mindgrove.png" alt="MindGrove Logo" className="h-16 w-16" />
            </div>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">Join MindGrove and start your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="name"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Free 30-day trial</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>No credit card required</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Account
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
          
          <div className="mt-8 text-center text-xs text-muted-foreground">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline">Terms of Service</Link> and{' '}
            <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Signup;
