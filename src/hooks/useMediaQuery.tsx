
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Set initial value
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    // Define callback function for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Clean up on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
