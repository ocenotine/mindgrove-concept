
import React, { Suspense, useEffect } from 'react';
import './App.css';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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
import LoadingScreen from './components/animations/LoadingScreen';
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

// Add BackToTop component
import BackToTop from './components/ui/BackToTop';
import { useAuthStore } from '@/store/authStore';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  // Ensure index route redirects correctly
  useEffect(() => {
    if (location.pathname === '/' && !location.hash.includes('#/')) {
      navigate('/landing', { replace: true });
    }
  }, [location, navigate]);
  
  // Handle redirection based on user account type
  useEffect(() => {
    if (isAuthenticated && user) {
      const accountType = user.user_metadata?.account_type || user.account_type;
      const currentPath = location.pathname;

      // Redirect to appropriate dashboard based on account type
      if (accountType === 'admin' && 
          currentPath === '/dashboard' || 
          currentPath === '/institution/dashboard') {
        navigate('/admin/dashboard', { replace: true });
      } else if (accountType === 'institution' && 
                currentPath === '/dashboard') {
        navigate('/institution/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, location.pathname, navigate]);
  
  return (
    <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center"><LoadingScreen /></div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
        <Route path="/admin/login" element={<AdminLogin />} />
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
  );
}

export default App;
