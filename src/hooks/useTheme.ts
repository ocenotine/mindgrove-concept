
import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

export function useTheme() {
  const { theme, setTheme } = useNextTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Wait until component is mounted to avoid hydration mismatch
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (mounted) {
      // Set initial state based on current theme
      setIsDarkMode(theme === 'dark');
    }
  }, [theme, mounted]);
  
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setTheme(newTheme);
    setIsDarkMode(!isDarkMode);
    
    // Save preference to localStorage as well for backup
    localStorage.setItem('theme-preference', newTheme);
  };
  
  return { isDarkMode, toggleTheme, theme, setTheme };
}

export default useTheme;
