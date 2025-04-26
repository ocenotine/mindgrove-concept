
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as ShadcnThemeProvider } from './components/theme/theme-provider';
import { ThemeProvider } from './hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';

import LoadingScreen from '@/components/animations/LoadingScreen';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import DocumentsPage from '@/pages/DocumentsPage';
import DocumentView from '@/pages/DocumentView';
import DocumentUploadPage from '@/pages/DocumentUploadPage';
import ProfilePage from '@/pages/ProfilePage';
import EditProfile from '@/pages/EditProfile';
import FlashcardsPage from '@/pages/FlashcardsPage';
import AIChat from '@/pages/AIChat';
import InstitutionDashboard from '@/pages/InstitutionDashboard';
import Landing from '@/pages/LandingPage';
import Index from '@/pages/Index';

// Import TourGuide and CompanionAppBanner
import TourGuide from './components/onboarding/TourGuide';
import CompanionAppBanner from './components/landing/CompanionAppBanner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ShadcnThemeProvider defaultTheme="dark" storageKey="mindgrove-theme">
        <ThemeProvider>
          <HashRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/document/:id" element={<DocumentView />} />
                <Route path="/document/upload" element={<DocumentUploadPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfile />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/chat" element={<AIChat />} />
                <Route path="/institution/dashboard" element={<InstitutionDashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Suspense>
            <TourGuide />
            <CompanionAppBanner />
            <Toaster />
          </HashRouter>
        </ThemeProvider>
      </ShadcnThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
