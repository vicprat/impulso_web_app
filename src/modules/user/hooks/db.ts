import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { postgresUserApi } from '@/modules/user/api';

export const postgresKeys = {
  all: ['postgres', 'user'] as const,
  profile: () => [...postgresKeys.all, 'profile'] as const,
  users: (filters?: Record<string, unknown>) => [...postgresKeys.all, 'list', filters] as const,
  user: (id: string) => [...postgresKeys.all, 'detail', id] as const,
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

export function useAllUsers(filters?: Record<string, unknown>) {
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