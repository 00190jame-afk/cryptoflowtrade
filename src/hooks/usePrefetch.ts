import { useEffect } from 'react';

// Prefetch critical routes when user is likely to navigate
export const usePrefetch = () => {
  useEffect(() => {
    const prefetchRoute = (path: string) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
    };

    // Prefetch critical pages after initial load
    const timer = setTimeout(() => {
      // Most commonly visited pages
      prefetchRoute('/markets');
      prefetchRoute('/login');
      prefetchRoute('/register');
      prefetchRoute('/assets');
    }, 2000); // Wait 2 seconds after initial load

    return () => clearTimeout(timer);
  }, []);

  const prefetchOnHover = (path: string) => {
    return () => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = path;
      document.head.appendChild(link);
    };
  };

  return { prefetchOnHover };
};