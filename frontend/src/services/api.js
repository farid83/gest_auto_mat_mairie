import axios from 'axios';
import csrfClient from './csrfClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Configuration Axios pour Laravel Sanctum
const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Important pour Laravel Sanctum
});

// Callback pour refresh auto de la page matériels
// après création/modification/suppression 
let onMaterialsChange = null;

export const setMaterialsChangeCallback = (callback) => {
  onMaterialsChange = callback;
};


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
    const response = await api.post('/api/login', { email, password }); // ✅ corrige le chemin 'api/login'
    const { token, user, sessionId } = response.data;

    // 3. Stockage local (clé + valeur)
    if (token) localStorage.setItem('token', token); // 🔹 ne stocke que si token présent
    if (sessionId) localStorage.setItem('sessionId', sessionId);
    if (user) localStorage.setItem('user', JSON.stringify(user)); // 🔹 objet => JSON.stringify

    // 4. Retourner les infos pour usage immédiat
    return { token, user };
  },

  async logout() {
    // Révoquer côté serveur si besoin
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Erreur lors du logout côté serveur', err);
    }
    // Nettoyage local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
  },

  async getUser() {
    try {
      const { data } = await api.get('/api/auth/user');
      return data;
    } catch (err) {
      if (err.response && err.response.status === 401) {
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

      // Appel du callback pour rafraîchir la liste
  if (onMaterialsChange) onMaterialsChange();
    return response.data;
    console.log('Soumission du formulaire', form);
  },

  async updateMaterial(id, materialData) {
    const response = await api.put(`/api/materiels/${id}`, materialData);

     // Appel du callback pour rafraîchir la liste
  if (onMaterialsChange) onMaterialsChange();
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
    const response = await api.get('/api/livraisons', { params });
    return response.data;
  },

  async createDelivery(deliveryData) {
    const response = await api.post('/api/livraisons', deliveryData);
    return response.data;
  },

  async confirmReception(id, receptionData = {}) {
    const response = await api.post(`/api/livraisons/${id}/mark-delivered`, receptionData);
    return response.data;
  }
};

// Service notifications
// export const notificationsService = {
//   async getNotifications(params = {}) {
//     let url = '/api/notifications';
//     if (params.unread === true) {
//       url = '/api/notifications/unread';
//       delete params.unread;
//     }
//     const response = await api.get(url, { params });
//     return response.data;
//   },

//   async markAsRead(id) {
//     const response = await api.post(`/api/notifications/${id}/mark-as-read`);
//     return response.data;
//   },

//   async markAllAsRead() {
//     const response = await api.post('/api/notifications/mark-all-read');
//     return response.data;
//   },

//   // ✅ Supprimer une seule notification
//   async deleteNotification(id) {
//     const response = await api.delete(`/api/notifications/${id}`);
//     return response.data;
//   },

//   // ✅ Supprimer toutes les notifications
//   async clearAll() {
//     const response = await api.delete('/api/notifications');
//     return response.data;
//   }
// };


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

// 📌 Marquer TOUTES les notifications comme lues
// export const useMarkAllNotificationsAsRead = () => {
//   const queryClient = useQueryClient();

//   return useMutation(
//     async () => {
//       const { data } = await axios.post('/api/notifications/read-all');
//       return data;
//     },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries(['notifications']);
//         queryClient.invalidateQueries(['unreadNotifications']);
//       }
//     }
//   );
// };



// // 📌 Supprimer une notification
// export const useDeleteNotification = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     async (id) => {
//       await notificationsService.deleteNotification(id);
//     },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries(['notifications']);
//         queryClient.invalidateQueries(['unreadNotifications']);
//       }
//     }
//   );
// };

// // 📌 Supprimer toutes les notifications
// export const useClearAllNotifications = () => {
//   const queryClient = useQueryClient();
//   return useMutation(
//     async () => {
//       await notificationsService.clearAll();
//     },
//     {
//       onSuccess: () => {
//         queryClient.invalidateQueries(['notifications']);
//         queryClient.invalidateQueries(['unreadNotifications']);
//       }
//     }
//   );
// };


// Vérifier le session_id dans le localStorage
console.log('Session ID dans le localStorage:', localStorage.getItem('session_id'));

export default api;