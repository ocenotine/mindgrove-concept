
import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from './components/animations/LoadingScreen';
import BackToTop from './components/ui/BackToTop';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/Home';

// Lazy load components for better performance
const LazyIndex = React.lazy(() => import('./pages/Index'));
const LazyLandingPage = React.lazy(() => import('./pages/LandingPage'));
const LazyLogin = React.lazy(() => import('./pages/Login'));
const LazySignup = React.lazy(() => import('./pages/Signup'));
const LazyDashboard = React.lazy(() => import('./pages/Dashboard'));
const LazyProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const LazyEditProfile = React.lazy(() => import('./pages/EditProfile'));
const LazyNotFound = React.lazy(() => import('./pages/NotFound'));
const LazyDocumentsPage = React.lazy(() => import('./pages/DocumentsPage'));
const LazyDocumentView = React.lazy(() => import('./pages/DocumentView'));
const LazyDocumentUploadPage = React.lazy(() => import('./pages/DocumentUploadPage'));
const LazyAIChat = React.lazy(() => import('./pages/AIChat'));
const LazyFlashcardsPage = React.lazy(() => import('./pages/FlashcardsPage'));
const LazyPrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const LazyTermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const LazyInstitutionDashboard = React.lazy(() => import('./pages/InstitutionDashboard'));
const LazyInstitutionSettings = React.lazy(() => import('./pages/InstitutionSettings'));
const LazyInstitutionSubscription = React.lazy(() => import('./pages/InstitutionSubscription'));
const LazyInstitutionUsers = React.lazy(() => import('./pages/InstitutionUsers'));
const LazyInstitutionAIChat = React.lazy(() => import('./pages/InstitutionAIChat'));
const LazyAuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const LazyProgressPage = React.lazy(() => import('./pages/ProgressPage'));
const LazyQuizPage = React.lazy(() => import('./pages/QuizPage'));
const LazyAdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const LazyAdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const LazyQuizPractice = React.lazy(() => import('./pages/QuizPractice'));
const LazyQuizEdit = React.lazy(() => import('./pages/QuizEdit'));

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center">
    <LoadingScreen />
  </div>
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, initialize, loading } = useAuthStore();
  
  // Initialize auth on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
        console.log("Auth initialized successfully");
      } catch (error) {
        console.error("Error initializing auth:", error);
      }
    };
    
    initAuth();
  }, [initialize]);
  
  // Handle redirection based on user account type
  useEffect(() => {
    if (isAuthenticated && user) {
      const accountType = user.user_metadata?.account_type || user.account_type;
      console.log("App.tsx: User authenticated with account type:", accountType);
      const currentPath = location.pathname;

      // Redirect to appropriate dashboard based on account type
      if (accountType === 'admin' && 
          (currentPath === '/dashboard' || 
          currentPath === '/institution/dashboard')) {
        navigate('/admin/dashboard', { replace: true });
      } else if (accountType === 'institution' && 
                currentPath === '/dashboard') {
        navigate('/institution/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  if (loading) {
    return <PageLoader />;
  }
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Static pages */}
          <Route path="/" element={<Home />} />
          <Route path="/index" element={<LazyIndex />} />
          <Route path="/landing" element={<LazyLandingPage />} />
          <Route path="/privacy" element={<LazyPrivacyPolicy />} />
          <Route path="/terms" element={<LazyTermsOfService />} />
          
          {/* Auth pages */}
          <Route path="/login" element={<LazyLogin />} />
          <Route path="/signup" element={<LazySignup />} />
          <Route path="/admin/login" element={<LazyAdminLogin />} />
          <Route path="/auth/callback" element={<LazyAuthCallback />} />
          
          {/* Student pages */}
          <Route path="/dashboard" element={<LazyDashboard />} />
          <Route path="/documents" element={<LazyDocumentsPage />} />
          <Route path="/document/:id" element={<LazyDocumentView />} />
          <Route path="/documents/view/:id" element={<LazyDocumentView />} />
          <Route path="/documents/upload" element={<LazyDocumentUploadPage />} />
          <Route path="/ai-chat" element={<LazyAIChat />} />
          <Route path="/flashcards" element={<LazyFlashcardsPage />} />
          <Route path="/progress" element={<LazyProgressPage />} />
          <Route path="/quiz" element={<LazyQuizPage />} />
          <Route path="/quiz/practice/:id" element={<LazyQuizPractice />} />
          <Route path="/quiz/edit/:id" element={<LazyQuizEdit />} />
          
          {/* Institution pages */}
          <Route path="/institution/dashboard" element={<LazyInstitutionDashboard />} />
          <Route path="/institution/settings" element={<LazyInstitutionSettings />} />
          <Route path="/institution/subscription" element={<LazyInstitutionSubscription />} />
          <Route path="/institution/users" element={<LazyInstitutionUsers />} />
          <Route path="/institution/ai-chat" element={<LazyInstitutionAIChat />} />
          
          {/* Admin pages */}
          <Route path="/admin/dashboard" element={<LazyAdminDashboard />} />
          
          {/* Profile pages */}
          <Route path="/profile" element={<LazyProfilePage />} />
          <Route path="/profile/edit" element={<LazyEditProfile />} />
          
          {/* 404 Route - MUST be last */}
          <Route path="*" element={<LazyNotFound />} />
        </Routes>
        
        {/* Global BackToTop component */}
        <BackToTop />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
