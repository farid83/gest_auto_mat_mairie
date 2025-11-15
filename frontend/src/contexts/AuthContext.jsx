import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';
import { useSessionWarning } from '../hooks/useSessionWarning';

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

  const { triggerWarning } = useSessionWarning();

  // Vérif session au montage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      // Si pas de token → on sort direct
      if (!storedToken) {
        dispatch({ type: 'LOGOUT' });
        return;
      }

      // Sinon → on vérifie côté serveur que le token est toujours valide
      try {
        const user = await authService.getUser();
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } catch (err) {
        if (err.status === 401) {
          // Token invalide ou expiré → on déconnecte
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        } else {
          console.error("Erreur initAuth:", err);
          // Pour une erreur réseau, on essaie d'utiliser les données en cache
          if (storedUser) {
            try {
              dispatch({ type: 'LOGIN_SUCCESS', payload: JSON.parse(storedUser) });
            } catch (e) {
              console.warn("Erreur parsing localStorage user", e);
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        }
      }
    };

    initAuth();
  }, []);

  // Gestion de la déconnexion automatique après 10 minutes d'inactivité
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let inactivityTimeout;
    let warningTimeout;
    const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutes
    const WARNING_TIME = 9 * 60 * 1000; // 9 minutes (avertissement 1 minute avant)


    const logout = () => {
      console.log("Déconnexion automatique après 10 minutes d'inactivité");
      // Effacer le localStorage pour éviter la reconnexion auto
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    };

    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);

      // Avertissement après 9 minutes
      warningTimeout = setTimeout(() => {
        console.log("⚠️ Votre session va expirer dans 1 minute");
        triggerWarning();
      }, WARNING_TIME);

      // Déconnexion après 10 minutes
      inactivityTimeout = setTimeout(logout, INACTIVITY_TIME);
    };

    // Événements qui indiquent une activité utilisateur
    const activityEvents = [
      'mousedown', 'mousemove', 'keypress',
      'scroll', 'touchstart', 'click'
    ];

    // Ajouter les écouteurs d'événements
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Initialiser le timer
    resetInactivityTimer();

    // Nettoyage des écouteurs au démontage ou lors de la déconnexion
    return () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [state.isAuthenticated]);

  // Gestion de la fermeture/rafraîchissement de la page
  // useEffect(() => {
  //   const handleBeforeUnload = (event) => {
  //     if (state.isAuthenticated) {
  //       console.log("Déconnexion automatique lors de la fermeture/rafraîchissement de la page");
  //       // On ne peut pas appeler logout() directement car la page se ferme
  //       // On marque simplement la session comme expirée
  //       localStorage.removeItem('token');
  //       localStorage.removeItem('user');
  //       localStorage.removeItem('sessionId');
  //     }
  //   };

  //   window.addEventListener('beforeunload', handleBeforeUnload);

  //   return () => {
  //     window.removeEventListener('beforeunload', handleBeforeUnload);
  //   };
  // }, [state.isAuthenticated]);


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
      localStorage.removeItem('token');
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
        // deliveries: ['read', 'create', 'update'],
        settings: ['read', 'update']
      },
      secretaire_executif: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'],
        // deliveries: ['read'],
        settings: []
      },
      daaf: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'],
        // deliveries: ['read'],
        settings: []
      },
      directeur: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read', 'create'],
        // deliveries: ['read'],
        settings: []
      },
      gestionnaire_stock: {
        users: ['read'],
        materials: ['read', 'create', 'update'],
        requests: ['read'],
        validations: ['read'],
        // deliveries: ['read', 'create', 'update'],
        settings: []
      },
      user: {
        users: ['read'],
        materials: ['read'],
        requests: ['read', 'create'],
        validations: ['read'],
        // deliveries: ['read'],
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