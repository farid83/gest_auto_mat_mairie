import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const SessionTimer = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let countdownInterval;

    if (isActive && timeLeft > 0) {
      countdownInterval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSessionWarning = () => {
    setIsActive(true);
    setTimeLeft(60); // 60 secondes pour le compte à rebours
  };

  const extendSession = () => {
    setIsActive(false);
    setTimeLeft(null);
    toast({
      title: "Session prolongée",
      description: "Votre session a été prolongée de 10 minutes.",
    });
    // Ici, vous pourriez envoyer une requête au serveur pour prolonger la session
  };

  const logout = () => {
    setIsActive(false);
    setTimeLeft(null);
    // La déconnexion sera gérée par le bouton de déconnexion existant
  };

  // Écouter les événements d'avertissement de session
  useEffect(() => {
    const handleSessionWarning = () => {
      handleSessionWarning();
    };

    window.addEventListener('sessionWarning', handleSessionWarning);

    return () => {
      window.removeEventListener('sessionWarning', handleSessionWarning);
    };
  }, []);

  if (!isAuthenticated || !isActive || timeLeft === null) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="w-64">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Session en cours</CardTitle>
          <CardDescription>
            Temps restant: {formatTime(timeLeft)}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={extendSession}
              disabled={timeLeft <= 10}
            >
              Prolonger
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={logout}
            >
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionTimer;