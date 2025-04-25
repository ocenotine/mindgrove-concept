
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import DocumentView from "./pages/DocumentView";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./hooks/useTheme";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";
import { PageTransition } from "./components/animations/PageTransition";
import DocumentsPage from "./pages/DocumentsPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import DocumentUploadPage from "./pages/DocumentUploadPage";
import ProfilePage from "./pages/ProfilePage";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TourGuide from "./components/onboarding/TourGuide";
import LoadingAnimation from "./components/animations/LoadingAnimation";
import AIChat from "./pages/AIChat";
import { markFirstVisit, markNewAccount } from "./utils/userOnboardingUtils";
import { Analytics } from '@vercel/analytics/react';

import * as THREE from 'three';
THREE.ColorManagement.enabled = true;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  useEffect(() => {
    if (isAuthenticated) {
      markNewAccount();
    }
  }, [isAuthenticated]);
  
  if (isLoading) {
    return <LoadingAnimation />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <PageTransition>{children}</PageTransition>;
};

// Public route that redirects to dashboard if already authenticated
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  
  if (isLoading) {
    return <LoadingAnimation />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return <PageTransition>{children}</PageTransition>;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Check for stored auth on first load and mark first visit for analytics
  useEffect(() => {
    markFirstVisit();
    
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/register-sw.js').then(
          registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
          },
          err => {
            console.log('ServiceWorker registration failed: ', err);
          }
        );
      });
    }
    
    // Check if the app can be installed as a PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event so it can be triggered later
      (window as any).deferredPrompt = e;
    });
  }, []);
  
  return (
    <>
      <TourGuide />
      <Analytics />
      
      <Routes>
        <Route path="/" element={<PageTransition><Navigate to={isAuthenticated ? "/dashboard" : "/landing"} /></PageTransition>} />
        <Route path="/landing" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/document/:id" element={
          <ProtectedRoute>
            <DocumentView />
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        } />
        <Route path="/flashcards" element={
          <ProtectedRoute>
            <FlashcardsPage />
          </ProtectedRoute>
        } />
        <Route path="/document/upload" element={
          <ProtectedRoute>
            <DocumentUploadPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        } />
        <Route path="/terms" element={<PageTransition><TermsOfService /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><PrivacyPolicy /></PageTransition>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
