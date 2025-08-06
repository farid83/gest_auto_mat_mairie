import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Configuration Axios pour Laravel Sanctum
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true // Important pour Laravel Sanctum
});

// Intercepteur pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection vers login ou clear auth state
      window.location.href = '/login';
    }
    
    // Format d'erreur standardisé
    const apiError = {
      message: error.response?.data?.message || 'Une erreur est survenue',
      errors: error.response?.data?.errors || {},
      status: error.response?.status || 500
    };
    
    return Promise.reject(apiError);
  }
);

// Service d'authentification
export const authService = {
  // Récupérer le token CSRF avant login
  async getCsrfToken() {
    return api.get('/sanctum/csrf-cookie');
  },

  async login(email, password) {
    await this.getCsrfToken();
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  async getUser() {
    const response = await api.get('/auth/user');
    return response.data.user;
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
    const response = await api.get('/materials', { params });
    return response.data;
  },

  async createMaterial(materialData) {
    const response = await api.post('/materials', materialData);
    return response.data;
  },

  async updateMaterial(id, materialData) {
    const response = await api.put(`/materials/${id}`, materialData);
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/materials/${id}`);
    return response.data;
  }
};

// Service demandes
export const requestsService = {
  async getRequests(params = {}) {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  async getRequest(id) {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  async createRequest(requestData) {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  async validateRequest(id, validationData) {
    const response = await api.post(`/requests/${id}/validate`, validationData);
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

// Service dashboard
export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  }
};

export default api;