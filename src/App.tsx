import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from 'react-error-boundary';
import { useEffect, useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from '@/hooks/useAuth';
import { AuthCallback } from '@/pages/AuthCallback';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import DocumentsPage from '@/pages/DocumentsPage';
import LectureDigestPage from '@/pages/LectureDigestPage';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

function App() {
  const { isLoading } = useAuth();
  const { toast } = useToast();
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return <div>Loading...</div>;
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
              
              {/* Add the new Lecture Digest route */}
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
