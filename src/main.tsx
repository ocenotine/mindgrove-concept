
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAuth } from './store/authStore';

// Initialize auth
initializeAuth()
  .then(() => {
    console.log("Auth initialized successfully");
  })
  .catch(error => {
    console.error("Failed to initialize auth:", error);
  });

createRoot(document.getElementById("root")!).render(<App />);
