import axios from 'axios';
import csrfClient from './csrfClient';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Configuration Axios pour Laravel Sanctum
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Important pour Laravel Sanctum
});



// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // On ne redirige pas direct ici → on laisse AuthContext gérer
      console.warn("401 - Token invalide ou expiré");
    }

    const res = error.response;
    const apiError = {
      message: res?.data?.message || error.message || 'Une erreur est survenue',
      errors: res?.data?.errors || {},
      status: res?.status || 500,
    };
    return Promise.reject(apiError);
  }
);
// Service d'authentification
export const authService = {
  // Récupérer le token CSRF avant login
  async getCsrfToken() {
    return csrfClient.get('/sanctum/csrf-cookie'); // ✅ bon client, bon chemin
  },

  async login(email, password) {
    // 1. CSRF cookie
    await this.getCsrfToken();

    // 2. Requête de login
    const response = await api.post('api/login', { email, password });
    const { token, user, sessionId } = response.data;

    // 3. Stockage local (clé + valeur !)
    localStorage.setItem('token', token); // 🔹 2 arguments obligatoires
    if (sessionId) {
      localStorage.setItem('sessionId', sessionId);
    }

    localStorage.setItem('user', JSON.stringify(user)); // 🔹 objet => JSON.stringify

    // 4. Retourner les infos pour usage immédiat
    return { token, user };
  },

  async logout() {
    // Si tu veux révoquer côté serveur, adapte l’URL/méthode
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Erreur lors du logout côté serveur', err);
    }
    // Nettoyage local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

async getUser() {
  try {
    const { data } = await api.get('/api/auth/user');
    return data;
  } catch (err) {
    if (err.status === 401) {
      return null; // pas connecté
    }
    throw err;
  }
}
};


// Service utilisateurs
export const usersService = {
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  async updateUser(id, userData) {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
};

// Service directions
export const directionsService = {
  async getDirections() {
    const response = await api.get('/directions');
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
    return response.data;
  },

  async updateMaterial(id, materialData) {
    const response = await api.put(`/api/materiels/${id}`, materialData);
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/api/materiels/${id}`);
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
    const response = await api.get('/validations/pending');
    return response.data;
  }
};

// Service livraisons
export const deliveriesService = {
  async getDeliveries(params = {}) {
    const response = await api.get('/deliveries', { params });
    return response.data;
  },

  async createDelivery(deliveryData) {
    const response = await api.post('/deliveries', deliveryData);
    return response.data;
  },

  async confirmReception(id, receptionData = {}) {
    const response = await api.post(`/deliveries/${id}/receive`, receptionData);
    return response.data;
  }
};

// Service notifications
export const notificationsService = {
  async getNotifications(params = {}) {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
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
    const response = await api.get('/api/dashboard/stats')
    return response.data;
  }
};
// Intercepteur requête → ajoute le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});




// Vérifier le session_id dans le localStorage
console.log('Session ID dans le localStorage:', localStorage.getItem('session_id'));

export default api;