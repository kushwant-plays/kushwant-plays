import { useEffect } from 'react';

const Analytics = () => {
  useEffect(() => {
    // Track page load time
    const trackPerformance = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        // Log performance metrics
        console.log('Page Load Time:', loadTime + 'ms');
        
        // Track to localStorage for admin dashboard
        const perfData = JSON.parse(localStorage.getItem('kushwant_performance') || '[]');
        perfData.push({
          timestamp: new Date().toISOString(),
          loadTime,
          page: window.location.pathname,
          userAgent: navigator.userAgent
        });
        
        // Keep only last 100 entries
        if (perfData.length > 100) {
          perfData.splice(0, perfData.length - 100);
        }
        
        localStorage.setItem('kushwant_performance', JSON.stringify(perfData));
      }
    };

    // Track when page is fully loaded
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
      return () => window.removeEventListener('load', trackPerformance);
    }
  }, []);

  // Track user interactions
  useEffect(() => {
    const trackClick = (e) => {
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.closest('a') || target.closest('.gallery-item')) {
        const clickData = JSON.parse(localStorage.getItem('kushwant_clicks') || '[]');
        clickData.push({
          timestamp: new Date().toISOString(),
          element: target.tagName,
          text: target.textContent?.substring(0, 50) || '',
          page: window.location.pathname
        });
        
        // Keep only last 50 clicks
        if (clickData.length > 50) {
          clickData.splice(0, clickData.length - 50);
        }
        
        localStorage.setItem('kushwant_clicks', JSON.stringify(clickData));
      }
    };

    document.addEventListener('click', trackClick);
    return () => document.removeEventListener('click', trackClick);
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics;