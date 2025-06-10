'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useAuth } from '@/modules/auth/context/useAuth';
import { useCustomerAccount } from '@/modules/auth/hooks/useCustomerAccount';
import { UserProfile, UserManagementContextType, UserFilters } from './types';

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export function UserManagementProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser, isLoading: authLoading, hasPermission, hasRole } = useAuth();
  const { getProfile, getAddresses, getOrders, updateShopifyProfile } = useCustomerAccount();
  
  // Estado del usuario actual
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para gestión de usuarios (admins)
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Cargar perfil completo del usuario actual
  const loadCurrentUserProfile = useCallback(async () => {
    if (!authUser || authLoading) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Obtener datos extendidos de Shopify
      const [profile, addresses, ordersResult] = await Promise.all([
        getProfile().catch(() => null),
        getAddresses().catch(() => []),
        getOrders(5).catch(() => ({ orders: [], pageInfo: null }))
      ]);
      
      const userProfile: UserProfile = {
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
        shopifyData: profile ? {
          displayName: profile.displayName,
          imageUrl: profile.imageUrl,
          phoneNumber: profile.phoneNumber?.phoneNumber,
          tags: profile.tags || [],
          defaultAddress: profile.defaultAddress,
          addresses: addresses,
          orderCount: ordersResult.orders.length,
        } : undefined
      };
      
      setCurrentUser(userProfile);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Error al cargar el perfil del usuario');
    } finally {
      setIsLoading(false);
    }
  }, [authUser, authLoading, getProfile, getAddresses, getOrders]);

  // Actualizar perfil del usuario
  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar perfil');
      }
      
      const updatedUser = await response.json();
      
      // Actualizar estado local
      setCurrentUser({ 
        ...currentUser, 
        ...updatedUser,
        // Marcar que hay cambios pendientes de sincronizar con Shopify
        needsShopifySync: true 
      });
      
      console.log('✅ Perfil actualizado en DB local');
      console.log('ℹ️ Usa "Sincronizar" para aplicar cambios en Shopify');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Sincronizar datos locales A Shopify
  const syncWithShopify = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Preparar datos locales para enviar a Shopify
      const localUserData = {
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
      };
      
      console.log('🔄 Sincronizando datos locales hacia Shopify:', localUserData);
      
      // 2. Enviar datos locales A Shopify
      await updateShopifyProfile(localUserData);
      
      console.log('✅ Datos enviados a Shopify exitosamente');
      
      // 3. Recargar datos de Shopify para confirmar la sincronización
      const [profile, addresses, ordersResult] = await Promise.all([
        getProfile().catch(() => null),
        getAddresses().catch(() => []),
        getOrders(5).catch(() => ({ orders: [], pageInfo: null }))
      ]);
      
      // 4. Actualizar estado local con los datos confirmados de Shopify
      const updatedUserProfile: UserProfile = {
        ...currentUser,
        needsShopifySync: false, // Limpiar bandera después de sincronización exitosa
        shopifyData: profile ? {
          displayName: profile.displayName,
          imageUrl: profile.imageUrl,
          phoneNumber: profile.phoneNumber?.phoneNumber,
          tags: profile.tags || [],
          defaultAddress: profile.defaultAddress,
          addresses: addresses,
          orderCount: ordersResult.orders.length,
        } : currentUser.shopifyData
      };
      
      setCurrentUser(updatedUserProfile);
      
      console.log('🎉 Sincronización completada. Shopify ahora refleja los datos locales.');
      
    } catch (err) {
      console.error('❌ Error sincronizando hacia Shopify:', err);
      setError('Error al enviar datos a Shopify: ' + (err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, updateShopifyProfile, getProfile, getAddresses, getOrders]);

  // Actualizar preferencias
  const updatePreferences = useCallback(async (preferences: UserProfile['preferences']) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ preferences })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar preferencias');
      }
      
      setCurrentUser({ ...currentUser, preferences });
      
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError('Error al actualizar las preferencias');
      throw err;
    }
  }, [currentUser]);

  // Obtener todos los usuarios (para admins)
  const getAllUsers = useCallback(async (filters: UserFilters = {}) => {
    if (!hasPermission('manage_users')) {
      setError('No tienes permisos para ver usuarios');
      return;
    }
    
    try {
      setUsersLoading(true);
      
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/users?${queryParams}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
      
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setUsersLoading(false);
    }
  }, [hasPermission]);

  // Obtener usuario por ID
  const getUserById = useCallback(async (id: string): Promise<UserProfile | null> => {
    if (!hasPermission('manage_users') && id !== currentUser?.id) {
      throw new Error('No tienes permisos para ver este usuario');
    }
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Usuario no encontrado');
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error loading user:', err);
      return null;
    }
  }, [hasPermission, currentUser]);

  // Actualizar roles de usuario
  const updateUserRole = useCallback(async (userId: string, roles: string[]) => {
    if (!hasPermission('manage_user_roles')) {
      throw new Error('No tienes permisos para gestionar roles');
    }
    
    try {
      const response = await fetch(`/api/users/${userId}/roles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roles })
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar roles');
      }
      
      // Actualizar la lista local si el usuario está cargado
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, roles } : user
      ));
      
    } catch (err) {
      console.error('Error updating user roles:', err);
      throw err;
    }
  }, [hasPermission]);

  // Desactivar usuario
  const deactivateUser = useCallback(async (userId: string) => {
    if (!hasPermission('manage_users')) {
      throw new Error('No tienes permisos para desactivar usuarios');
    }
    
    try {
      const response = await fetch(`/api/users/${userId}/deactivate`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al desactivar usuario');
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: false } : user
      ));
      
    } catch (err) {
      console.error('Error deactivating user:', err);
      throw err;
    }
  }, [hasPermission]);

  // Reactivar usuario
  const reactivateUser = useCallback(async (userId: string) => {
    if (!hasPermission('manage_users')) {
      throw new Error('No tienes permisos para reactivar usuarios');
    }
    
    try {
      const response = await fetch(`/api/users/${userId}/reactivate`, {
        method: 'PATCH',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al reactivar usuario');
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: true } : user
      ));
      
    } catch (err) {
      console.error('Error reactivating user:', err);
      throw err;
    }
  }, [hasPermission]);

  // Verificar si puede gestionar un usuario específico
  const canManageUser = useCallback((targetUserId: string): boolean => {
    if (!currentUser) return false;
    
    // Los usuarios pueden gestionar su propio perfil
    if (targetUserId === currentUser.id) return true;
    
    // Solo usuarios con permisos de gestión pueden gestionar otros
    if (!hasPermission('manage_users')) return false;
    
    // Los admins pueden gestionar cualquiera
    if (hasRole('admin')) return true;
    
    // Los managers pueden gestionar usuarios regulares, VIP y soporte, pero no otros managers o admins
    if (hasRole('manager')) {
      const targetUser = users.find(u => u.id === targetUserId);
      return !!targetUser && !targetUser.roles.includes('manager') && !targetUser.roles.includes('admin');
    }
    
    // El soporte puede ver pero no modificar usuarios
    if (hasRole('support')) return false;
    
    return false;
  }, [currentUser, hasPermission, hasRole, users]);

  // Cargar perfil cuando el usuario se autentica
  useEffect(() => {
    if (authUser && !authLoading) {
      loadCurrentUserProfile();
    }
  }, [authUser, authLoading, loadCurrentUserProfile]);

  const value: UserManagementContextType = {
    currentUser,
    isLoading,
    error,
    users,
    usersLoading,
    pagination,
    updateProfile,
    syncWithShopify,
    updatePreferences,
    getAllUsers,
    getUserById,
    updateUserRole,
    deactivateUser,
    reactivateUser,
    hasPermission,
    hasRole,
    canManageUser,
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
}

export function useUserManagement() {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
}