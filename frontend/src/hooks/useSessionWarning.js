import { useState, useCallback } from 'react';

export const useSessionWarning = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const triggerWarning = useCallback(() => {
    setShowWarning(true);
    setCountdown(60); // Réinitialiser le compte à rebours
  }, []);

  const hideWarning = useCallback(() => {
    setShowWarning(false);
    setCountdown(60);
  }, []);

  const decrementCountdown = useCallback(() => {
    setCountdown(prev => Math.max(0, prev - 1));
  }, []);

  return {
    showWarning,
    countdown,
    triggerWarning,
    hideWarning,
    decrementCountdown,
  };
};