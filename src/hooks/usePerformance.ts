import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  routeChangeTime: number;
}

export const usePerformance = (pageName: string) => {
  const startTime = performance.now();

  const logMetrics = useCallback((metrics: Partial<PerformanceMetrics>) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${pageName}:`, metrics);
    }
    
    // In production, you could send to analytics service
    // analytics.track('page_performance', { page: pageName, ...metrics });
  }, [pageName]);

  useEffect(() => {
    const loadTime = performance.now() - startTime;
    
    // Log initial load time
    logMetrics({ loadTime });

    // Measure time to interactive
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure') {
          logMetrics({ renderTime: entry.duration });
        }
      });
    });

    observer.observe({ entryTypes: ['measure'] });

    // Mark render complete
    performance.mark(`${pageName}-render-start`);
    
    return () => {
      performance.mark(`${pageName}-render-end`);
      performance.measure(
        `${pageName}-render`, 
        `${pageName}-render-start`, 
        `${pageName}-render-end`
      );
      observer.disconnect();
    };
  }, [pageName, startTime, logMetrics]);

  const trackRouteChange = useCallback((newRoute: string) => {
    const routeChangeTime = performance.now() - startTime;
    logMetrics({ routeChangeTime });
    performance.mark(`route-change-${newRoute}`);
  }, [startTime, logMetrics]);

  return { trackRouteChange };
};