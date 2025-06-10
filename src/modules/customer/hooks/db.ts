import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';

// Query Keys para Postgres
export const postgresKeys = {
  all: ['postgres', 'user'] as const,
  profile: () => [...postgresKeys.all, 'profile'] as const,
  users: (filters?: any) => [...postgresKeys.all, 'list', filters] as const,
  user: (id: string) => [...postgresKeys.all, 'detail', id] as const,
};

const postgresUserApi = {
  getProfile: async () => {
    const response = await fetch('/api/users/profile', { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch user profile');
    return response.json();
  },

  updateProfile: async (data: any) => {
    const response = await fetch('/api/users/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  updatePreferences: async (preferences: any) => {
    const response = await fetch('/api/users/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ preferences })
    });
    if (!response.ok) throw new Error('Failed to update preferences');
    return response.json();
  },

  // Aquí agregar tus otras funciones de gestión de usuarios para admins
  getAllUsers: async (filters: any = {}) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`/api/users?${queryParams}`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  updateUserRole: async (userId: string, roles: string[]) => {
    const response = await fetch(`/api/users/${userId}/roles`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roles })
    });
    if (!response.ok) throw new Error('Failed to update roles');
    return response.json();
  },

  deactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/deactivate`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to deactivate user');
    return response.json();
  },

  reactivateUser: async (userId: string) => {
    const response = await fetch(`/api/users/${userId}/reactivate`, {
      method: 'PATCH',
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to reactivate user');
    return response.json();
  },
};

export function usePostgresProfile() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: postgresKeys.profile(),
    queryFn: postgresUserApi.getProfile,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePostgresProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postgresUserApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.profile() });
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postgresUserApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.profile() });
    },
  });
}

// Hooks para gestión de usuarios (admin)
export function useAllUsers(filters?: any) {
  const { hasPermission } = useAuth();
  
  return useQuery({
    queryKey: postgresKeys.users(filters),
    queryFn: () => postgresUserApi.getAllUsers(filters),
    enabled: hasPermission('manage_users'),
    staleTime: 1 * 60 * 1000,
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, roles }: { userId: string; roles: string[] }) =>
      postgresUserApi.updateUserRole(userId, roles),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: postgresKeys.users() });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postgresUserApi.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.users() });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: postgresUserApi.reactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.users() });
    },
  });
}