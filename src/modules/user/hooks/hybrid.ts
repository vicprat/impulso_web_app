import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useAuth } from '@/modules/auth/context/useAuth'

import { usePostgresProfile, useUpdatePostgresProfile } from './db'
import {
  useShopifyProfile,
  useShopifyAddresses,
  useShopifyOrders,
  useUpdateShopifyProfile,
  shopifyKeys,
} from './shopify'

export function useHybridUser() {
  const { hasPermission, hasRole, user: authUser } = useAuth()
  const queryClient = useQueryClient()

  const shopifyProfile = useShopifyProfile()
  const shopifyAddresses = useShopifyAddresses(10)
  const shopifyOrders = useShopifyOrders({ first: 5 })
  const postgresProfile = usePostgresProfile()

  const updateShopifyProfile = useUpdateShopifyProfile()
  const updatePostgresProfile = useUpdatePostgresProfile()

  const hybridUser = useMemo(() => {
    if (!authUser) return null

    return {
      createdAt: new Date(),
      email: authUser.email,
      firstName: authUser.firstName,
      id: authUser.id,
      isActive: true,
      lastName: authUser.lastName,
      needsShopifySync: false,
      permissions: authUser.permissions,
      postgresData: postgresProfile.data
        ? {
            lastLoginAt: postgresProfile.data.lastLoginAt,
            preferences: postgresProfile.data.preferences,
          }
        : undefined,
      roles: authUser.roles,

      shopifyCustomerId: authUser.shopifyCustomerId,

      shopifyData: shopifyProfile.data?.customer
        ? {
            addresses:
              shopifyAddresses.data?.customer?.addresses?.edges?.map(
                (edge: { node: unknown }) => edge.node
              ) || [],
            defaultAddress: shopifyProfile.data.customer.defaultAddress,
            displayName: shopifyProfile.data.customer.displayName,
            imageUrl: shopifyProfile.data.customer.imageUrl,
            orderCount: shopifyOrders.data?.customer?.orders?.edges?.length || 0,
            phoneNumber: shopifyProfile.data.customer.phoneNumber?.phoneNumber,
            tags: shopifyProfile.data.customer.tags || [],
          }
        : undefined,

      syncStatus: {
        hasPostgresData: !!postgresProfile.data,
        hasShopifyData: !!shopifyProfile.data,
        postgresError: postgresProfile.error,
        postgresLoading: postgresProfile.isLoading,
        shopifyError: shopifyProfile.error,
        shopifyLoading: shopifyProfile.isLoading,
      },

      updatedAt: new Date(),
    }
  }, [
    authUser,
    shopifyProfile.data,
    shopifyProfile.isLoading,
    shopifyProfile.error,
    shopifyAddresses.data,
    shopifyOrders.data,
    postgresProfile.data,
    postgresProfile.isLoading,
    postgresProfile.error,
  ])

  const syncToShopify = useMutation({
    mutationFn: async (data: { firstName?: string; lastName?: string }) => {
      console.log('🔄 Sincronizando datos locales hacia Shopify:', data)

      const shopifyResult = await updateShopifyProfile.mutateAsync(data)

      console.log('✅ Datos enviados a Shopify exitosamente')
      return shopifyResult
    },
    onError: (error) => {
      console.error('❌ Error sincronizando hacia Shopify:', error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shopifyKeys.profile() })
      console.log('🎉 Sincronización completada. Shopify actualizado.')
    },
  })

  const updateUnified = useMutation({
    mutationFn: async ({
      data,
      syncToShopifyImmediately = false,
    }: {
      data: { firstName?: string; lastName?: string; [key: string]: unknown }
      syncToShopifyImmediately?: boolean
    }) => {
      console.log('📝 Actualizando perfil en Postgres:', data)
      const result = await updatePostgresProfile.mutateAsync(data)

      if (syncToShopifyImmediately && (data.firstName || data.lastName)) {
        const shopifyData = {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
        }

        await syncToShopify.mutateAsync(shopifyData)
      }

      return result
    },
    onError: (error) => {
      console.error('❌ Error en actualización unificada:', error)
    },
  })

  return {
    currentUser: hybridUser,
    error: shopifyProfile.error || postgresProfile.error,
    hasPermission,
    hasRole,
    hybridUser,
    isLoading: shopifyProfile.isLoading || postgresProfile.isLoading,
    isSyncing: syncToShopify.isPending,
    postgres: {
      profile: postgresProfile,
    },
    shopify: {
      addresses: shopifyAddresses,
      orders: shopifyOrders,
      profile: shopifyProfile,
    },
    syncError: syncToShopify.error,
    syncToShopify,
    syncWithShopify: () =>
      syncToShopify.mutate({
        firstName: hybridUser?.firstName,
        lastName: hybridUser?.lastName,
      }),
    updateProfile: updateUnified.mutate,
    updateUnified,
  }
}
