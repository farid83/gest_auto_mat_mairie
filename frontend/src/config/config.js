// src/config/config.js

/**
 * Configuration centralisée de l'application
 * Détecte automatiquement l'environnement et utilise la bonne URL
 */

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

// URL du backend selon l'environnement
const BACKEND_URL = isLocalhost
  ? 'http://127.0.0.1:8000'
  : (process.env.REACT_APP_BACKEND_URL || 'https://gest-auto-mat-mairie-backend.onrender.com');

// Configuration complète
const config = {
  // URL de base de l'API
  apiUrl: BACKEND_URL,
  
  // Endpoint d'API complet
  apiEndpoint: `${BACKEND_URL}/api`,
  
  // Informations sur l'environnement
  env: {
    isProduction: !isLocalhost,
    isDevelopment: isLocalhost,
    backendUrl: BACKEND_URL,
  },
  
  // Délais et timeouts
  timeouts: {
    apiRequest: 30000, // 30 secondes
    toast: 5000, // 5 secondes
  },
  
  // Configuration React Query
  reactQuery: {
    defaultStaleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // 1 minute
  },
};

// Log de configuration (seulement en dev)
if (config.env.isDevelopment) {
  console.log('🔧 Configuration de l\'application:');
  console.log('  - Environnement:', config.env.isDevelopment ? 'Développement' : 'Production');
  console.log('  - Backend URL:', config.apiUrl);
  console.log('  - API Endpoint:', config.apiEndpoint);
}

export default config;

// Export des valeurs individuelles pour faciliter l'import
export const { apiUrl, apiEndpoint } = config;
export const API_URL = BACKEND_URL;