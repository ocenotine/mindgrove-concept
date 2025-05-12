
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '@/hooks/useDocuments';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import BackgroundAnimation from '@/components/animations/BackgroundAnimation';
import LoadingAnimation from '@/components/animations/LoadingAnimation';
import useAuth from '@/hooks/useAuth';

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { refreshDocuments } = useDocuments();

  useEffect(() => {
    console.log("Index page: authLoading:", authLoading, "isAuthenticated:", isAuthenticated);
    
    // Prevent premature redirects - only redirect after auth is confirmed
    if (!authLoading) {
      if (isAuthenticated) {
        refreshDocuments();
        navigate('/dashboard', { replace: true });
      } else {
        // Only navigate to landing if we've confirmed user is not authenticated
        navigate('/landing', { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, navigate, refreshDocuments]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  // Only show this page if the user is not authenticated
  // Otherwise they'll be redirected to dashboard by the effect above
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 relative">
        <BackgroundAnimation />
        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to MindGrove</h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Your AI-powered learning companion for smarter study and knowledge management
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
