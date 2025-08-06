import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  useInfiniteQuery 
} from '@tanstack/react-query';
import { 
  authService,
  usersService, 
  directionsService,
  materialsService,
  requestsService,
  validationsService,
  deliveriesService,
  notificationsService,
  dashboardService
} from '../services/api';

// Keys pour le cache React Query
export const queryKeys = {
  users: ['users'],
  user: (id) => ['users', id],
  directions: ['directions'],
  materials: ['materials'],
  material: (id) => ['materials', id],
  requests: ['requests'],
  request: (id) => ['requests', id],
  validations: ['validations'],
  deliveries: ['deliveries'],
  notifications: ['notifications'],
  dashboardStats: ['dashboard', 'stats']
};

// Hooks pour les utilisateurs
export const useUsers = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.users, params],
    queryFn: () => usersService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => usersService.updateUser(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.setQueryData(queryKeys.user(id), data.user);
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersService.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
    }
  });
};

// Hooks pour les directions
export const useDirections = () => {
  return useQuery({
    queryKey: queryKeys.directions,
    queryFn: directionsService.getDirections,
    staleTime: 30 * 60 * 1000, // 30 minutes (données peu volatiles)
  });
};

// Hooks pour les matériels
export const useMaterials = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.materials, params],
    queryFn: () => materialsService.getMaterials(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: materialsService.createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials });
    }
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => materialsService.updateMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.materials });
    }
  });
};

// Hooks pour les demandes
export const useRequests = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.requests, params],
    queryFn: () => requestsService.getRequests(params),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useRequest = (id) => {
  return useQuery({
    queryKey: queryKeys.request(id),
    queryFn: () => requestsService.getRequest(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
  });
};

export const useCreateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: requestsService.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    }
  });
};

export const useValidateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => requestsService.validateRequest(id, data),
    onSuccess: (data, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
      queryClient.invalidateQueries({ queryKey: queryKeys.validations });
      queryClient.invalidateQueries({ queryKey: queryKeys.request(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardStats });
    }
  });
};

// Hooks pour les validations
export const usePendingValidations = () => {
  return useQuery({
    queryKey: queryKeys.validations,
    queryFn: validationsService.getPendingValidations,
    staleTime: 30 * 1000, // 30 secondes (données critiques)
    refetchInterval: 60 * 1000, // Auto-refetch toutes les minutes
  });
};

// Hooks pour les livraisons
export const useDeliveries = (params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.deliveries, params],
    queryFn: () => deliveriesService.getDeliveries(params),
    staleTime: 2 * 60 * 1000,
  });
};

export const useCreateDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deliveriesService.createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
    }
  });
};

export const useConfirmReception = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => deliveriesService.confirmReception(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.deliveries });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests });
    }
  });
};

// Hooks pour les notifications
export const useNotifications = (params = { read: false }) => {
  return useQuery({
    queryKey: [...queryKeys.notifications, params],
    queryFn: () => notificationsService.getNotifications(params),
    staleTime: 30 * 1000, // 30 secondes
    refetchInterval: 2 * 60 * 1000, // Auto-refetch toutes les 2 minutes
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    }
  });
};

// Hook pour les statistiques du dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: dashboardService.getStats,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refetch toutes les 5 minutes
  });
};

// Hook générique pour les mutations avec toast
export const useMutationWithToast = (mutationFn, options = {}) => {
  return useMutation({
    ...options,
    mutationFn,
    onSuccess: (data, variables, context) => {
      if (data.message) {
        // Ici on peut ajouter une notification toast
        console.log('✅ Succès:', data.message);
      }
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.error('❌ Erreur:', error.message);
      if (error.errors) {
        Object.values(error.errors).flat().forEach(err => {
          console.error('- ', err);
        });
      }
      options.onError?.(error, variables, context);
    }
  });
};