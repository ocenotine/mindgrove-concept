
import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import LoadingScreen from './components/animations/LoadingScreen';
import BackToTop from './components/ui/BackToTop';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import all pages
import Home from './pages/Home';
import Index from './pages/Index';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import EditProfile from './pages/EditProfile';
import NotFound from './pages/NotFound';
import DocumentsPage from './pages/DocumentsPage';
import DocumentView from './pages/DocumentView';
import DocumentUploadPage from './pages/DocumentUploadPage';
import AIChat from './pages/AIChat';
import FlashcardsPage from './pages/FlashcardsPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import InstitutionDashboard from './pages/InstitutionDashboard';
import InstitutionSettings from './pages/InstitutionSettings';
import InstitutionSubscription from './pages/InstitutionSubscription';
import InstitutionUsers from './pages/InstitutionUsers';
import InstitutionAIChat from './pages/InstitutionAIChat';
import AuthCallback from './pages/AuthCallback';
import ProgressPage from './pages/ProgressPage';
import QuizPage from './pages/QuizPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import QuizPractice from './pages/QuizPractice';
import QuizEdit from './pages/QuizEdit';

// Define page groups for error boundary isolation
const AuthPages = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
    </Routes>
  </ErrorBoundary>
);

const StudentPages = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/documents" element={<DocumentsPage />} />
      <Route path="/document/:id" element={<DocumentView />} />
      <Route path="/documents/view/:id" element={<DocumentView />} />
      <Route path="/documents/upload" element={<DocumentUploadPage />} />
      <Route path="/ai-chat" element={<AIChat />} />
      <Route path="/flashcards" element={<FlashcardsPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/quiz/practice/:id" element={<QuizPractice />} />
      <Route path="/quiz/edit/:id" element={<QuizEdit />} />
    </Routes>
  </ErrorBoundary>
);

const InstitutionPages = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
      <Route path="/institution/settings" element={<InstitutionSettings />} />
      <Route path="/institution/subscription" element={<InstitutionSubscription />} />
      <Route path="/institution/users" element={<InstitutionUsers />} />
      <Route path="/institution/ai-chat" element={<InstitutionAIChat />} />
    </Routes>
  </ErrorBoundary>
);

const AdminPages = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  </ErrorBoundary>
);

const ProfilePages = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfile />} />
    </Routes>
  </ErrorBoundary>
);

const StaticPages = () => (
  <ErrorBoundary>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/index" element={<Index />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </ErrorBoundary>
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
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <LoadingScreen />
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><LoadingScreen /></div>}>
        <Routes>
          {/* Root route now goes to the Home component */}
          <Route path="/" element={<Home />} />
          
          {/* Group routes by sections for better error isolation */}
          <Route path="/index" element={<Index />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/document/:id" element={<DocumentView />} />
          <Route path="/documents/view/:id" element={<DocumentView />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/quiz/practice/:id" element={<QuizPractice />} />
          <Route path="/quiz/edit/:id" element={<QuizEdit />} />
          
          {/* Institution Routes */}
          <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
          <Route path="/institution/settings" element={<InstitutionSettings />} />
          <Route path="/institution/subscription" element={<InstitutionSubscription />} />
          <Route path="/institution/users" element={<InstitutionUsers />} />
          <Route path="/institution/ai-chat" element={<InstitutionAIChat />} />
          
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Common Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          
          {/* 404 Route - MUST be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Global BackToTop component */}
        <BackToTop />
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
