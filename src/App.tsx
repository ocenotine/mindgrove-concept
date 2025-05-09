
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useState } from 'react';
import { useToast } from "./components/ui/use-toast";
import { Toaster } from "./components/ui/toaster";
import { useAuth } from './hooks/useAuth';
import AuthCallback from './pages/AuthCallback';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import DocumentsPage from '@/pages/DocumentsPage';
import LectureDigestPage from '@/pages/LectureDigestPage';
import LoadingScreen from './components/animations/LoadingScreen';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 m-4 border border-destructive rounded bg-destructive/10 text-destructive">
      <p className="font-medium mb-2">Something went wrong:</p>
      <pre className="text-sm p-2 bg-background/50 rounded overflow-auto max-h-[300px]">{error.message}</pre>
      <button 
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}

function App() {
  const { isLoading } = useAuth();
  const { toast } = useToast();
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={(error, info) => {
            console.error("Caught an error: ", error, info);
            toast({
              title: "Error",
              description: error.message,
              variant: "destructive",
            });
          }}
        >
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/auth-callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/lecture-digest" element={<LectureDigestPage />} />
            </Routes>
          </Router>
        </ErrorBoundary>
        <Toaster />
      </ThemeProvider>
    </div>
  );
}

export default App;
