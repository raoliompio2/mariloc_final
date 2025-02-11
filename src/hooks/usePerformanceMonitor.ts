import { useEffect, useRef } from 'react';
import { analytics } from '../services/analytics';

interface UsePerformanceMonitorOptions {
  componentName: string;
  threshold?: number; // em milissegundos
}

export function usePerformanceMonitor({
  componentName,
  threshold = 1000, // 1 segundo
}: UsePerformanceMonitorOptions) {
  const startTime = useRef(performance.now());

  useEffect(() => {
    // Mede tempo de montagem
    const mountTime = performance.now() - startTime.current;
    
    if (mountTime > threshold) {
      analytics.trackPerformance({
        name: `${componentName}_mount_time`,
        value: mountTime,
      });
    }

    // Observa o FID (First Input Delay)
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        analytics.trackPerformance({
          name: `${componentName}_fid`,
          value: entry.duration,
        });
      }
    });

    observer.observe({ entryTypes: ['first-input'] });

    // Observa o LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      analytics.trackPerformance({
        name: `${componentName}_lcp`,
        value: lastEntry.startTime,
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, [componentName, threshold]);
}
