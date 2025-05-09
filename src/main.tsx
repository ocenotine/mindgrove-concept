
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import './index.css';
import { setOpenRouterApiKey } from './utils/openRouterUtils';

// Initialize the API key if not yet set
// Note: In production, you should have users set their own API keys
// This is just for demonstration purposes
const hardcodedApiKey = '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';
if (!localStorage.getItem('openRouterApiKey') && hardcodedApiKey) {
  setOpenRouterApiKey(hardcodedApiKey);
}

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
