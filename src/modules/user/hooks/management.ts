import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { 
  useCustomerProfile, 
  useCustomerAddresses, 
  useCustomerOrders,
  useUpdateCustomerProfile,
} from '@/modules/customer/hooks';
import { postgresUserApi } from '../api';
import { UserProfile, UserFilters } from '../types';
import { postgresKeys } from './db';

export function useCurrentUser() {
  const { user: authUser, isLoading: authLoading } = useAuth();
  
  // Datos de Shopify
  const { data: profileData, isLoading: profileLoading } = useCustomerProfile();
  const { data: addressesData, isLoading: addressesLoading } = useCustomerAddresses(10);
  const { data: ordersData, isLoading: ordersLoading } = useCustomerOrders({ first: 5 });
  
  const currentUser: UserProfile | null = authUser ? {
    id: authUser.id,
    shopifyCustomerId: authUser.shopifyCustomerId,
    email: authUser.email,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: authUser.roles,
    permissions: authUser.permissions,
    shopifyData: profileData?.data?.customer ? {
      displayName: profileData.data.customer.displayName ?? '',
      imageUrl: profileData.data.customer.imageUrl ?? '',
      phoneNumber: profileData.data.customer.phoneNumber?.phoneNumber,
      tags: profileData.data.customer.tags || [],
      defaultAddress: profileData.data.customer.defaultAddress,
      addresses: addressesData?.data?.customer?.addresses?.edges?.map(edge => edge.node) || [],
      orderCount: ordersData?.data?.customer?.orders?.edges?.length || 0,
    } : undefined
  } : null;
  

  
  const isLoading = authLoading || profileLoading || addressesLoading || ordersLoading;
  
  return {
    currentUser,
    isLoading,
  };
}

// Hook para actualizar perfil local
export function useUpdateLocalProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: postgresKeys.profile() });
    }
  });
}

// Hook para sincronizar con Shopify
export function useSyncWithShopify() {
  const updateCustomerProfile = useUpdateCustomerProfile();
  const { currentUser } = useCurrentUser();
  
  return useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('No hay usuario actual');
      
      const localUserData = {
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
      };
      
      console.log('🔄 Sincronizando datos locales hacia Shopify:', localUserData);
      
      const result = await updateCustomerProfile.mutateAsync(localUserData);
      
      console.log('✅ Datos enviados a Shopify exitosamente');
      
      return result;
    }
  });
}

// Hook para actualizar preferencias
export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (preferences: UserProfile['preferences']) => {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar preferencias');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postgresKeys.profile() });
    }
  });
}

// Hook para gestión de usuarios (admin)
export function useUsersManagement(filters?: UserFilters) {
  const { hasPermission } = useAuth();
  
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => postgresUserApi.getAllUsers(filters),
    enabled: hasPermission('manage_users'),
    staleTime: 1 * 60 * 1000,
  });
}

// Hook para obtener usuario por ID
export function useUserById(userId: string) {
  const { hasPermission, user } = useAuth();
  const canView = hasPermission('manage_users') || user?.id === userId;
  
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Usuario no encontrado');
      }
      
      return response.json();
    },
    enabled: !!userId && canView,
  });
}

// Hook para actualizar roles
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  
  return useMutation({
    mutationFn: async ({ userId, roles }: { userId: string; roles: string[] }) => {
      if (!hasPermission('manage_user_roles')) {
        throw new Error('No tienes permisos para gestionar roles');
      }
      
      return postgresUserApi.updateUserRole(userId, roles);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// Hook para desactivar usuario
export function useDeactivateUser() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!hasPermission('manage_users')) {
        throw new Error('No tienes permisos para desactivar usuarios');
      }
      
      return postgresUserApi.deactivateUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// Hook para reactivar usuario
export function useReactivateUser() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      if (!hasPermission('manage_users')) {
        throw new Error('No tienes permisos para reactivar usuarios');
      }
      
      return postgresUserApi.reactivateUser(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
}

// Hook helper para verificar permisos de gestión
export function useCanManageUser(targetUserId: string) {
  const { user: currentUser, hasPermission, hasRole } = useAuth();
  const { data: users } = useUsersManagement();
  
  if (!currentUser) return false;
  
  // Los usuarios pueden gestionar su propio perfil
  if (targetUserId === currentUser.id) return true;
  
  // Solo usuarios con permisos de gestión pueden gestionar otros
  if (!hasPermission('manage_users')) return false;
  
  // Los admins pueden gestionar cualquiera
  if (hasRole('admin')) return true;
  
  // Los managers pueden gestionar usuarios regulares, pero no otros managers o admins
  if (hasRole('manager') && users?.users) {
    const targetUser: UserProfile | undefined = users && users.users
      ? (users.users as UserProfile[]).find((u: UserProfile) => u.id === targetUserId)
      : undefined;
    return !!targetUser && !targetUser.roles.includes('manager') && !targetUser.roles.includes('admin');
  }
  
  return false;
}

// Hook combinado para toda la funcionalidad de gestión de usuarios
export function useUserManagement() {
  const { hasPermission, hasRole, user: currentUser } = useAuth();
  const { currentUser: fullUser, isLoading } = useCurrentUser();
  
  const updateLocalProfile = useUpdateLocalProfile();
  const syncWithShopify = useSyncWithShopify();
  const updatePreferences = useUpdatePreferences();
  const updateUserRoles = useUpdateUserRoles();
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();
  
  // Función helper para verificar si puede gestionar un usuario
  const canManageUser = (targetUserId: string, targetUserRoles?: string[]) => {
    if (!currentUser) return false;
    if (targetUserId === currentUser.id) return true;
    if (!hasPermission('manage_users')) return false;
    if (hasRole('admin')) return true;
    if (hasRole('manager') && targetUserRoles) {
      return !targetUserRoles.includes('manager') && !targetUserRoles.includes('admin');
    }
    return false;
  };
  
  return {
    // Usuario actual
    currentUser: fullUser,
    isLoading,
    
    // Acciones del usuario
    updateProfile: updateLocalProfile.mutate,
    syncWithShopify: syncWithShopify.mutate,
    updatePreferences: updatePreferences.mutate,
    
    // Estados de mutación
    isUpdatingProfile: updateLocalProfile.isPending,
    isSyncing: syncWithShopify.isPending,
    isUpdatingPreferences: updatePreferences.isPending,
    
    // Acciones administrativas
    updateUserRole: updateUserRoles.mutate,
    deactivateUser: deactivateUser.mutate,
    reactivateUser: reactivateUser.mutate,
    
    // Control de acceso
    hasPermission,
    hasRole,
    canManageUser, // Ahora es una función, no un hook
    
    // Hooks adicionales para uso independiente
    useUsersManagement,
    useUserById,
  };
}