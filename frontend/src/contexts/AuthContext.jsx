import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case 'LOGIN_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isAuthenticated: false,
        user: null
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // démarrage en chargement
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérif session au montage
useEffect(() => {
  const initAuth = async () => {
    try {
      const user = await authService.getUser();
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (err) {
      dispatch({ type: 'LOGOUT' });
    }
  };
  initAuth();
}, []);

//   useEffect(() => {
//   const storedToken = localStorage.getItem('token');
//   const storedUser  = localStorage.getItem('user');

//   if (storedToken) {
//     setIsLoading(true);
//     axios.get('/api/me', {
//       headers: { Authorization: `Bearer ${storedToken}` }
//     })
//     .then(res => {
//       setUser(res.data);
//       setIsAuthenticated(true);
//     })
//     .catch(() => {
//       setIsAuthenticated(false);
//       setUser(null);
//     })
//     .finally(() => setIsLoading(false));
//   } else {
//     setIsAuthenticated(false);
//   }
// }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const result = await authService.login(email, password);

      // 🔹 Adaptation : ton back renvoie 'token'
      if (result.token) {
        localStorage.setItem('token', result.token); // garde le même nom interne
      }

      if (result.user) {
        // Patch temporaire si role absent (à corriger côté back)
        // if (!result.user.role) {
        //   console.warn("⚠ user sans role, valeur par défaut appliquée pour test");
        //   result.user.role = 'admin';
        // }
        localStorage.setItem('user', JSON.stringify(result.user));
      }

      dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
      return { success: true, message: result.message || 'Connexion réussie' };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (requiredRole) => state.user?.role === requiredRole;

  const hasAnyRole = (roles) => roles.includes(state.user?.role);

  const canAccess = (resource, action = 'read') => {
    if (!state.user) return false;
    const { role } = state.user;
    const permissions = {
      admin: {
        users: ['read', 'create', 'update', 'delete'],
        materials: ['read', 'create', 'update', 'delete'],
        requests: ['read', 'create', 'update', 'delete'],
        validations: ['read', 'create'],
        deliveries: ['read', 'create', 'update'],
        settings: ['read', 'update']
      },
      secretaire_executif: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'],
        deliveries: ['read'],
        settings: []
      },
      daaf: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'],
        deliveries: ['read'],
        settings: []
      },
      directeur: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'],
        deliveries: ['read'],
        settings: []
      },
      gestionnaire_stock: {
        users: ['read'],
        materials: ['read', 'create', 'update'],
        requests: ['read'],
        validations: ['read'],
        deliveries: ['read', 'create', 'update'],
        settings: []
      },
      agent: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read'],
        deliveries: ['read'],
        settings: []
      }
    };
    return (permissions[role] && permissions[role][resource] || []).includes(action);
  };

  const value = {
    ...state,
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole,
    canAccess
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;