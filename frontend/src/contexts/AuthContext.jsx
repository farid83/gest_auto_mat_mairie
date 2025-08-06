import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { mockUsers, mockApiDelay } from '../services/mock';

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
  isLoading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulation de vérification de session au démarrage
  useEffect(() => {
    const checkSession = async () => {
      dispatch({ type: 'LOGIN_START' });
      
      try {
        // Simuler la vérification d'une session cookie
        await mockApiDelay(1000);
        
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        dispatch({ type: 'LOGIN_ERROR', payload: 'Erreur de session' });
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      await mockApiDelay(800);
      
      // Simulation de l'authentification
      const user = mockUsers.find(u => u.email === email && u.active);
      
      if (!user) {
        throw new Error('Identifiants incorrects');
      }

      // Simuler la création d'une session cookie côté serveur
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await mockApiDelay(300);
      
      // Simuler la destruction de la session cookie
      localStorage.removeItem('currentUser');
      
      dispatch({ type: 'LOGOUT' });
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
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

  const value = {
    ...state,
    login,
    logout,
    clearError,
    hasRole,
    hasAnyRole
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