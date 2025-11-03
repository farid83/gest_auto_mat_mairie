import axios from 'axios';
import csrfClient from './csrfClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: true 
});

let onMaterialsChange = null;

export const setMaterialsChangeCallback = (callback) => {
  onMaterialsChange = callback;
};


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
export const authService = {
  async getCsrfToken() {
    return csrfClient.get('/sanctum/csrf-cookie'); 
  },

  async login(email, password) {
    await this.getCsrfToken();

    const response = await api.post('/api/login', { email, password }); 
    const { token, user, sessionId } = response.data;

    if (token) localStorage.setItem('token', token);
    if (sessionId) localStorage.setItem('sessionId', sessionId);
    if (user) localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  },

  async logout() {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      console.warn('Erreur lors du logout côté serveur', err);
    }
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
        return null; 
      }
      throw err;
    }
  }
};



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

export const directionsService = {
  async getDirections() {
    const response = await api.get('/directions');
    return response.data;
  }
};

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

export const materialsService = {
  async getMaterials(params = {}) {
    const response = await api.get('/api/materiels', { params });
    return response.data;
  },



  async createMaterial(materialData) {
    const response = await api.post('/api/materiels', materialData);

  if (onMaterialsChange) onMaterialsChange();
    return response.data;
    console.log('Soumission du formulaire', form);
  },

  async updateMaterial(id, materialData) {
    const response = await api.put(`/api/materiels/${id}`, materialData);

  if (onMaterialsChange) onMaterialsChange();
    return response.data;
  },

  async deleteMaterial(id) {
    const response = await api.delete(`/api/materiels/${id}`);
    return response.data;
  }
};

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

export const validationsService = {
  async getPendingValidations() {
    const response = await api.get('/validations/pending');
    return response.data;
  }
};

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

export const dashboardService = {
  async getStats() {
    const response = await api.get('/api/dashboard/stats')
    return response.data;
  }
};
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

console.log('Session ID dans le localStorage:', localStorage.getItem('session_id'));

export default api;