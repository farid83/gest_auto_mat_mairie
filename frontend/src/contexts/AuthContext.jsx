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
  isLoading: true, // Démarrer en état de chargement pour vérifier la session
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Vérification de session au démarrage avec Laravel Sanctum
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Tentative de récupération de l'utilisateur authentifié
        const user = await authService.getUser();
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (error) {
        // Si erreur 401/403, l'utilisateur n'est pas authentifié
        if (error.status === 401 || error.status === 403) {
          dispatch({ type: 'LOGOUT' });
        } else {
          dispatch({ type: 'LOGIN_ERROR', payload: 'Erreur de vérification de session' });
        }
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const result = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
      return { success: true, message: result.message };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      return { success: true };
    } catch (error) {
      // Même en cas d'erreur, on déconnecte côté client
      dispatch({ type: 'LOGOUT' });
      console.error('Erreur lors de la déconnexion:', error);
      return { success: true }; // On considère comme réussi côté UX
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasRole = (requiredRole) => {
    if (!state.user) return false;
    return state.user.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    if (!state.user) return false;
    return roles.includes(state.user.role);
  };

  // Fonction utilitaire pour vérifier les permissions
  const canAccess = (resource, action = 'read') => {
    if (!state.user) return false;

    const { role } = state.user;
    
    // Matrice des permissions par rôle
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
        validations: ['read', 'create'], // Peut valider
        deliveries: ['read'],
        settings: []
      },
      daaf: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'], // Peut valider
        deliveries: ['read'],
        settings: []
      },
      directeur: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'], // Peut valider
        deliveries: ['read'],
        settings: []
      },
      gestionnaire_stock: {
        users: ['read'],
        materials: ['read', 'create', 'update'],
        requests: ['read'],
        validations: ['read'],
        deliveries: ['read', 'create', 'update'], // Gestion des livraisons
        settings: []
      },
      agent: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'], // Peut créer des demandes
        validations: ['read'],
        deliveries: ['read'], // Peut voir ses livraisons
        settings: []
      }
    };

    const userPermissions = permissions[role]?.[resource] || [];
    return userPermissions.includes(action);
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