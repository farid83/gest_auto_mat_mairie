import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';

export const SessionWarning = () => {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  let countdownInterval;

  // Écouter l'événement de déconnexion automatique
  useEffect(() => {
    const handleSessionWarning = () => {
      setShowWarning(true);
      setCountdown(60);
    };

    window.addEventListener('sessionWarning', handleSessionWarning);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
    };
  }, []);

  useEffect(() => {
    if (showWarning && isAuthenticated) {
      // Afficher le toast d'avertissement
      const toastId = toast({
        title: "⚠️ Session sur le point d'expirer",
        description: `Votre session va expirer dans ${countdown} secondes. Voulez-vous rester connecté ?`,
        duration: Infinity, // Ne pas fermer automatiquement
        action: (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setShowWarning(false);
                // Déclencher une activité pour réinitialiser le timer
                window.dispatchEvent(new Event('mousemove'));
              }}
            >
              Rester connecté
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={async () => {
                setShowWarning(false);
                await logout();
              }}
            >
              Se déconnecter
            </Button>
          </div>
        ),
      });

      // Compte à rebours
      countdownInterval = setInterval(() => {
        setCountdown(prev => {
          const newCountdown = prev - 1;
          if (newCountdown <= 0) {
            clearInterval(countdownInterval);
            logout();
            setShowWarning(false);
            return 0;
          }
          return newCountdown;
        });
      }, 1000);

      return () => {
        if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      };
    }
  }, [showWarning, countdown, isAuthenticated, logout, toast]);

  return null; // Ce composant ne rend rien directement
};

export default SessionWarning;