
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider } from "./components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeAuth, useAuthStore } from './store/authStore';

// Initialize the auth state
initializeAuth().then(() => {
  console.log("Auth state initialized");
});

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

// Set up auth callback route for OAuth providers
const callbackUrl = '/auth/callback';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="mindgrove-ui-theme">
        <HashRouter>
          <App />
          <Toaster />
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
