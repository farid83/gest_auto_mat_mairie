import axios from 'axios';
import csrfClient from './csrfClient';

// Détection de l'environnement
const isLocal = window.location.hostname === 'localhost';
const BACKEND_URL = isLocal 
  ? 'http://localhost:8000' 
  : process.env.REACT_APP_BACKEND_URL;

console.log('🔧 Configuration API:');
console.log('  - Environnement:', isLocal ? 'Local' : 'Production');
console.log('  - Backend URL:', BACKEND_URL);

// Créer l'instance axios principale
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true, // CRUCIAL pour les cookies
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

let onMaterialsChange = null;

export const setMaterialsChangeCallback = (callback) => {
  onMaterialsChange = callback;
};

// Intercepteur pour ajouter le token Bearer
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Erreur dans la requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log de l'erreur
    if (error.response) {
      console.error(`❌ Erreur ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ Pas de réponse du serveur:', error.message);
    } else {
      console.error('❌ Erreur de configuration:', error.message);
    }

    // Gestion du 401 (non authentifié)
    if (error.response?.status === 401) {
      console.warn("⚠️ 401 - Non authentifié, redirection...");
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      // Rediriger vers la page de login si nécessaire
      // window.location.href = '/login';
    }

    // Gestion du 419 (CSRF token expiré)
    if (error.response?.status === 419 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('🔄 Token CSRF expiré, rafraîchissement...');
      
      try {
        await authService.getCsrfToken();
        return api(originalRequest);
      } catch (csrfError) {
        console.error('❌ Impossible de rafraîchir le CSRF token:', csrfError);
      }
    }

    // Formater l'erreur pour l'application
    const apiError = {
      message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      errors: error.response?.data?.errors || {},
      status: error.response?.status || 500,
    };

    return Promise.reject(apiError);
  }
);

// Service d'authentification
export const authService = {
  // Supprimer getCsrfToken() pour l'authentification par token
  
  async login(email, password) {
    try {
      console.log('🔑 Tentative de connexion...');
      
      // PAS besoin de CSRF token pour l'auth par token API
      const response = await api.post('/api/login', { email, password });
      const { token, user, sessionId } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        console.log('✅ Token stocké');
      }
      if (sessionId) {
        localStorage.setItem('sessionId', sessionId);
        console.log('✅ Session ID stocké');
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        console.log('✅ Utilisateur stocké');
      }

      console.log('✅ Connexion réussie');
      return { token, user };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  },

  async logout() {
    try {
      console.log('🚪 Déconnexion...');
      await api.post('/api/auth/logout');
      console.log('✅ Déconnexion côté serveur réussie');
    } catch (err) {
      console.warn('⚠️ Erreur lors du logout côté serveur', err);
    }
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    console.log('✅ Données locales nettoyées');
  },

  async getUser() {
    try {
      const { data } = await api.get('/api/auth/user');
      return data;
    } catch (err) {
      if (err.status === 401) {
        return null;
      }
      throw err;
    }
  }
};


// Service utilisateurs
export const usersService = {
  async getUsers(params = {}) {
    const response = await api.get('/api/users', { params });
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/api/users', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },

  async updatePassword(id, password) {
    const response = await api.post(`/api/users/${id}/password`, { password });
    return response.data;
  },

  async updateMyPassword(payload) {
    const response = await api.post('/api/me/password', payload);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },

  async getUser(id) {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  async getRoles() {
    const response = await api.get('/api/users/roles');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/api/users/stats');
    return response.data;
  }
};

// Service directions
export const directionsService = {
  async getDirections() {
    const response = await api.get('/api/directions'); // Ajout de /api
    return response.data;
  }
};

// Service services
export const servicesService = {
  async getServices(params = {}) {
    const response = await api.get('/api/services', { params });
    return response.data;
  },

  async createService(serviceData) {
    const response = await api.post('/api/services', serviceData);
    return response.data;
  },

  async updateService(id, serviceData) {
    const response = await api.put(`/api/services/${id}`, serviceData);
    return response.data;
  },

  async deleteService(id) {
    const response = await api.delete(`/api/services/${id}`);
    return response.data;
  },

  async getService(id) {
    const response = await api.get(`/api/services/${id}`);
    return response.data;
  },

  async getServicesByDirection(directionId) {
    const response = await api.get(`/api/services/direction/${directionId}`);
    return response.data;
  }
};

// Service matériels
export const materialsService = {
  async getMaterials(params = {}) {
    const response = await api.get('/api/materiels', { params });
    return response.data;
  },

  async createMaterial(materialData) {
    const response = await api.post('/api/materiels', materialData);
    if (onMaterialsChange) onMaterialsChange();
    return response.data;
  },

  async updateMaterial(id, materialData) {
    const response = await api.put(`/api/materiels/${id}`, materialData);
    if (onMaterialsChange) onMaterialsChange();
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/api/materiels/${id}`);
    if (onMaterialsChange) onMaterialsChange();
    return response.data;
  }
};

// Service demandes
export const requestsService = {
  async getRequests(params = {}) {
    const response = await api.get('/api/demandes/', { params });
    return response.data;
  },

  async getRequest(id) {
    const response = await api.get(`/api/demandes/${id}`);
    return response.data;
  },

  async createRequest(requestData) {
    const response = await api.post('/api/demandes/', requestData);
    return response.data;
  },

  async validateRequest(id, validationData) {
    const response = await api.post(`/api/demandes/${id}/validate`, validationData);
    return response.data;
  }
};

// Service validations
export const validationsService = {
  async getPendingValidations() {
    const response = await api.get('/api/validations/pending'); // Ajout de /api
    return response.data;
  }
};

// Service mouvements de stock
export const mouvementStockService = {
  async getMouvements(params = {}) {
    const response = await api.get('/api/mouvements-stock', { params });
    return response.data;
  },

  async createMouvement(mouvementData) {
    const response = await api.post('/api/mouvements-stock', mouvementData);
    return response.data;
  }
};

// Service dashboard
export const dashboardService = {
  async getStats() {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  }
};

// Initialisation de l'API
export const initializeApi = async () => {
  try {
    console.log('🚀 Initialisation de l\'API...');
    await authService.getCsrfToken();
    console.log('✅ API initialisée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Échec de l\'initialisation de l\'API:', error);
    return false;
  }
};

export default api;