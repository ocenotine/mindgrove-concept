
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

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Ensure index route redirects correctly
  useEffect(() => {
    if (location.pathname === '/' && !location.hash.includes('#/')) {
      navigate('/landing', { replace: true });
    }
  }, [location, navigate]);
  
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
        
        {/* Institution Routes */}
        <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
        <Route path="/institution/settings" element={<InstitutionSettings />} />
        <Route path="/institution/subscription" element={<InstitutionSubscription />} />
        <Route path="/institution/users" element={<InstitutionUsers />} />
        <Route path="/institution/ai-chat" element={<InstitutionAIChat />} />
        
        {/* Common Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        
        {/* 404 Route - MUST be last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
