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
  
  const shopifyProfile = useShopifyProfile();
  const shopifyAddresses = useShopifyAddresses(10);
  const shopifyOrders = useShopifyOrders({ first: 5 });
  const postgresProfile = usePostgresProfile();
  
  const updateShopifyProfile = useUpdateShopifyProfile();
  const updatePostgresProfile = useUpdatePostgresProfile();

  const hybridUser = useMemo(() => {
    if (!authUser) return null;
    
    return {
      id: authUser.id,
      shopifyCustomerId: authUser.shopifyCustomerId,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      roles: authUser.roles,
      permissions: authUser.permissions,
      isActive: true,
      createdAt: new Date(), 
      updatedAt: new Date(),
      
      postgresData: postgresProfile.data ? {
        lastLoginAt: postgresProfile.data.lastLoginAt,
        preferences: postgresProfile.data.preferences,
      } : undefined,
      
      shopifyData: shopifyProfile.data?.customer ? {
        displayName: shopifyProfile.data.customer.displayName,
        imageUrl: shopifyProfile.data.customer.imageUrl,
        phoneNumber: shopifyProfile.data.customer.phoneNumber?.phoneNumber,
        tags: shopifyProfile.data.customer.tags || [],
        defaultAddress: shopifyProfile.data.customer.defaultAddress,
        addresses: shopifyAddresses.data?.customer?.addresses?.edges?.map(
          (edge: { node: unknown }) => edge.node
        ) || [],
        orderCount: shopifyOrders.data?.customer?.orders?.edges?.length || 0,
      } : undefined,
      
      syncStatus: {
        shopifyLoading: shopifyProfile.isLoading,
        postgresLoading: postgresProfile.isLoading,
        hasShopifyData: !!shopifyProfile.data,
        hasPostgresData: !!postgresProfile.data,
        shopifyError: shopifyProfile.error,
        postgresError: postgresProfile.error,
      },
      
      needsShopifySync: false, 
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

  const syncToShopify = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string }) => {
      console.log('🔄 Sincronizando datos locales hacia Shopify:', data);
      
      const shopifyResult = await updateShopifyProfile.mutateAsync(data);
      
      console.log('✅ Datos enviados a Shopify exitosamente');
      return shopifyResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.profile() });
      console.log('🎉 Sincronización completada. Shopify actualizado.');
    },
    onError: (error) => {
      console.error('❌ Error sincronizando hacia Shopify:', error);
    }
  });

  const updateUnified = useMutation({
    mutationFn: async ({ 
      data, 
      syncToShopifyImmediately = false 
    }: { 
      data: { firstName?: string; lastName?: string; [key: string]: unknown }; 
      syncToShopifyImmediately?: boolean;
    }) => {
      console.log('📝 Actualizando perfil en Postgres:', data);
      const result = await updatePostgresProfile.mutateAsync(data);
      
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
    hybridUser,
    isLoading: shopifyProfile.isLoading || postgresProfile.isLoading,
    error: shopifyProfile.error || postgresProfile.error,
    hasPermission,
    hasRole,
    syncToShopify,
    updateUnified,
    isSyncing: syncToShopify.isPending,
    syncError: syncToShopify.error,
    shopify: {
      profile: shopifyProfile,
      addresses: shopifyAddresses,
      orders: shopifyOrders,
    },
    postgres: {
      profile: postgresProfile,
    },
    currentUser: hybridUser,
    updateProfile: updateUnified.mutate,
    syncWithShopify: () => syncToShopify.mutate({
      firstName: hybridUser?.firstName,
      lastName: hybridUser?.lastName,
    }),
  };
}