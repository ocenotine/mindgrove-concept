
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import './index.css';
import { initializeAuth } from './store/authStore';

// Initialize auth with activity tracking
initializeAuth().then(() => {
  console.log("Auth initialization complete");
}).catch(error => {
  console.error("Failed to initialize auth:", error);
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
