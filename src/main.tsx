
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import './index.css';
import { initializeAuth } from './store/authStore';

// Initialize auth with activity tracking but don't block rendering
initializeAuth().then(() => {
  console.log("Auth initialization complete");
}).catch(error => {
  console.error("Failed to initialize auth:", error);
});

// Ensure the root element exists
const rootElement = document.getElementById('root');
if (!rootElement) {
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
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
