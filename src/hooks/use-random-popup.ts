
import { useState, useEffect } from 'react';

interface UseRandomPopupOptions {
  minDelay?: number;  // Minimum delay in ms
  maxDelay?: number;  // Maximum delay in ms
  enabled?: boolean;  // Whether the popup is enabled
  showOnce?: boolean; // Whether to show only once per session
  weeklyLimit?: boolean; // Whether to limit to once per week
}

export const useRandomPopup = ({
  minDelay = 30000,   // Default: 30 seconds
  maxDelay = 60000,   // Default: 60 seconds
  enabled = true,     // Default: enabled
  showOnce = false,   // Default: can show multiple times
  weeklyLimit = false // Default: no weekly limit
}: UseRandomPopupOptions = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Don't set timer if disabled
    if (!enabled) return;
    
    // Check for weekly limit
    if (weeklyLimit) {
      const lastSpinTime = localStorage.getItem('lastSpinTime');
      if (lastSpinTime) {
        const lastSpinDate = new Date(parseInt(lastSpinTime));
        const currentDate = new Date();
        const daysDifference = Math.floor((currentDate.getTime() - lastSpinDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference < 7) {
          return; // Don't show if it's been less than 7 days
        }
      }
    }
    
    // Check if we should show the popup (for showOnce option)
    const hasShown = showOnce && sessionStorage.getItem('popupShown') === 'true';
    if (hasShown) return;
    
    // Calculate random delay between min and max
    const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
    
    // Set timer to show popup
    const timer = setTimeout(() => {
      setIsOpen(true);
      
      if (showOnce) {
        sessionStorage.setItem('popupShown', 'true');
      }
      
      if (weeklyLimit) {
        localStorage.setItem('lastSpinTime', Date.now().toString());
      }
    }, delay);
    
    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [enabled, minDelay, maxDelay, showOnce, weeklyLimit]);
  
  const closePopup = () => {
    setIsOpen(false);
  };
  
  return { isOpen, closePopup };
};
