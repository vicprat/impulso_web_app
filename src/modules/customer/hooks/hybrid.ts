import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { 
  useShopifyProfile, 
  useShopifyAddresses, 
  useShopifyOrders,
  useUpdateShopifyProfile,
  shopifyKeys 
} from './shopify';
import { 
  usePostgresProfile, 
  useUpdatePostgresProfile, 
} from './db';

export function useHybridUser() {
  const { user: authUser, hasPermission, hasRole } = useAuth();
  const queryClient = useQueryClient();
  
  // Datos de ambas fuentes usando tu estructura
  const shopifyProfile = useShopifyProfile();
  const shopifyAddresses = useShopifyAddresses(10);
  const shopifyOrders = useShopifyOrders({ first: 5 });
  const postgresProfile = usePostgresProfile();
  
  // Mutations
  const updateShopifyProfile = useUpdateShopifyProfile();
  const updatePostgresProfile = useUpdatePostgresProfile();

  // Usuario híbrido combinado usando tu estructura de datos
  const hybridUser = useMemo(() => {
    if (!authUser) return null;
    
    return {
      // Datos base de auth (siempre disponibles)
      id: authUser.id,
      shopifyCustomerId: authUser.shopifyCustomerId,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      roles: authUser.roles,
      permissions: authUser.permissions,
      isActive: true,
      createdAt: new Date(), // Esto vendría de postgres en la implementación real
      updatedAt: new Date(),
      
      // Datos extendidos de Postgres
      postgresData: postgresProfile.data ? {
        lastLoginAt: postgresProfile.data.lastLoginAt,
        preferences: postgresProfile.data.preferences,
        // Otros campos custom que tengas
      } : undefined,
      
      // Datos de Shopify usando tu estructura exacta
      shopifyData: shopifyProfile.data?.customer ? {
        displayName: shopifyProfile.data.customer.displayName,
        imageUrl: shopifyProfile.data.customer.imageUrl,
        phoneNumber: shopifyProfile.data.customer.phoneNumber?.phoneNumber,
        tags: shopifyProfile.data.customer.tags || [],
        defaultAddress: shopifyProfile.data.customer.defaultAddress,
        addresses: shopifyAddresses.data?.customer?.addresses?.edges?.map((edge: any) => edge.node) || [],
        orderCount: shopifyOrders.data?.customer?.orders?.edges?.length || 0,
      } : undefined,
      
      // Estados de sincronización
      syncStatus: {
        shopifyLoading: shopifyProfile.isLoading,
        postgresLoading: postgresProfile.isLoading,
        hasShopifyData: !!shopifyProfile.data,
        hasPostgresData: !!postgresProfile.data,
        shopifyError: shopifyProfile.error,
        postgresError: postgresProfile.error,
      },
      
      // Flag para indicar si hay cambios pendientes (basado en tu lógica)
      needsShopifySync: false, // Implementarías tu lógica de comparación aquí
    };
  }, [
    authUser, 
    shopifyProfile.data, 
    shopifyProfile.isLoading, 
    shopifyProfile.error,
    shopifyAddresses.data, 
    shopifyOrders.data,
    postgresProfile.data, 
    postgresProfile.isLoading, 
    postgresProfile.error
  ]);

  // Sincronización: Postgres → Shopify (tu lógica actual)
  const syncToShopify = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string }) => {
      console.log('🔄 Sincronizando datos locales hacia Shopify:', data);
      
      // Usar tu función updateShopifyProfile existente
      const shopifyResult = await updateShopifyProfile.mutateAsync(data);
      
      console.log('✅ Datos enviados a Shopify exitosamente');
      return shopifyResult;
    },
    onSuccess: () => {
      // Invalidar cache de Shopify para refrescar
      queryClient.invalidateQueries({ queryKey: shopifyKeys.profile() });
      console.log('🎉 Sincronización completada. Shopify actualizado.');
    },
    onError: (error) => {
      console.error('❌ Error sincronizando hacia Shopify:', error);
    }
  });

  // Actualización unificada (mantiene tu lógica actual)
  const updateUnified = useMutation({
    mutationFn: async ({ 
      data, 
      syncToShopifyImmediately = false 
    }: { 
      data: any; 
      syncToShopifyImmediately?: boolean;
    }) => {
      // 1. Actualizar en Postgres primero
      console.log('📝 Actualizando perfil en Postgres:', data);
      const result = await updatePostgresProfile.mutateAsync(data);
      
      // 2. Si se requiere, sincronizar inmediatamente a Shopify
      if (syncToShopifyImmediately && (data.firstName || data.lastName)) {
        const shopifyData = {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName })
        };
        
        await syncToShopify.mutateAsync(shopifyData);
      }
      
      return result;
    },
    onError: (error) => {
      console.error('❌ Error en actualización unificada:', error);
    }
  });

  return {
    // Usuario híbrido combinado
    hybridUser,
    
    // Estados de carga
    isLoading: shopifyProfile.isLoading || postgresProfile.isLoading,
    error: shopifyProfile.error || postgresProfile.error,
    
    // Permisos y roles (del auth)
    hasPermission,
    hasRole,
    
    // Operaciones de sincronización
    syncToShopify,
    updateUnified,
    
    // Estados de sincronización
    isSyncing: syncToShopify.isPending,
    syncError: syncToShopify.error,
    
    // Acceso directo a hooks específicos para casos avanzados
    shopify: {
      profile: shopifyProfile,
      addresses: shopifyAddresses,
      orders: shopifyOrders,
    },
    postgres: {
      profile: postgresProfile,
    },
    
    // Para compatibilidad con tu contexto actual
    currentUser: hybridUser,
    updateProfile: updateUnified.mutate,
    syncWithShopify: () => syncToShopify.mutate({
      firstName: hybridUser?.firstName,
      lastName: hybridUser?.lastName,
    }),
  };
}