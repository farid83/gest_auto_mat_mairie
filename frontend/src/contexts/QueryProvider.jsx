import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configuration du client React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Délai avant qu'une requête soit considérée comme périmée (stale)
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Temps de cache avant suppression
      gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
      
      // Retry logic personnalisée
      retry: (failureCount, error) => {
        // Ne pas retry sur les erreurs 401 (non authentifié)
        if (error?.status === 401) return false;
        
        // Ne pas retry sur les erreurs 403 (non autorisé)
        if (error?.status === 403) return false;
        
        // Ne pas retry sur les erreurs 404 (non trouvé)
        if (error?.status === 404) return false;
        
        // Retry jusqu'à 3 fois pour les autres erreurs
        return failureCount < 3;
      },
      
      // Délai entre les retries (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch automatique quand la fenêtre reprend le focus
      refetchOnWindowFocus: true,
      
      // Refetch automatique lors de la reconnexion
      refetchOnReconnect: true,
    },
    
    mutations: {
      retry: (failureCount, error) => {
        // Ne jamais retry les mutations sur erreurs d'auth
        if (error?.status === 401 || error?.status === 403) return false;
        
        // Retry une seule fois pour les mutations
        return failureCount < 1;
      },
      
      // Délai pour les retries de mutations
      retryDelay: 1000,
    }
  }
});

const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;