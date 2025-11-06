import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';

export const SessionWarning = () => {
  const { isAuthenticated, logout, showWarning, countdown, hideWarning } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    let countdownInterval;

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
                hideWarning();
                // L'activité de clic va automatiquement réinitialiser le timer dans AuthContext
              }}
            >
              Rester connecté
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                logout();
              }}
            >
              Se déconnecter
            </Button>
          </div>
        ),
      });

      // Compte à rebours
      countdownInterval = setInterval(() => {
        // Le countdown est géré dans le hook, on met juste à jour l'affichage
        if (countdown <= 0) {
          clearInterval(countdownInterval);
          logout();
        }
      }, 1000);

      return () => {
        if (countdownInterval) {
          clearInterval(countdownInterval);
        }
      };
    }
  }, [showWarning, countdown, isAuthenticated, logout, hideWarning, toast]);

  return null; // Ce composant ne rend rien directement
};

export default SessionWarning;