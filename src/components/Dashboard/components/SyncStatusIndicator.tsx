'use client'

import { useCurrentUser, useSyncWithShopify } from '@/modules/user/hooks/management'

interface SyncStatusIndicatorProps {
  className?: string
}

export function SyncStatusIndicator({ className = '' }: SyncStatusIndicatorProps) {
  const { currentUser } = useCurrentUser()
  const syncWithShopify = useSyncWithShopify()

  if (!currentUser) return null

  const localData = {
    firstName: currentUser.firstName ?? '',
    lastName: currentUser.lastName ?? '',
  }

  const shopifyData = {
    firstName: currentUser.shopifyData?.displayName.split(' ')[0] ?? '',
    lastName: currentUser.shopifyData?.displayName.split(' ').slice(1).join(' ') ?? '',
  }

  const hasChanges =
    (currentUser.needsShopifySync ?? localData.firstName !== shopifyData.firstName) ||
    localData.lastName !== shopifyData.lastName

  if (!hasChanges) {
    return (
      <div className={`rounded-lg border border-green-200 bg-green-50 p-3 ${className}`}>
        <div className='flex items-center space-x-2'>
          <span className='text-green-600'>✅</span>
          <span className='text-sm font-medium text-green-800'>Sincronizado</span>
        </div>
        <p className='mt-1 text-xs text-green-700'>Tus datos están sincronizados con Shopify</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-orange-200 bg-orange-50 p-4 ${className}`}>
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center space-x-2'>
          <span className='text-orange-600'>⚠️</span>
          <span className='font-medium text-orange-800'>Cambios Pendientes</span>
        </div>
        <button
          onClick={() => syncWithShopify.mutate()}
          disabled={syncWithShopify.isPending}
          className='rounded bg-orange-600 px-3 py-1 text-xs text-white hover:bg-orange-700 disabled:opacity-50'
        >
          {syncWithShopify.isPending ? 'Sincronizando...' : 'Sincronizar Ahora'}
        </button>
      </div>

      <div className='space-y-2 text-sm'>
        <p className='text-orange-700'>Los siguientes cambios se aplicarán en Shopify:</p>

        <div className='space-y-2 rounded border border-orange-200 bg-white p-3'>
          {localData.firstName !== shopifyData.firstName && (
            <div className='flex justify-between'>
              <span className='text-gray-600'>Nombre:</span>
              <div className='text-right'>
                <div className='text-xs text-red-600 line-through'>
                  {shopifyData.firstName || 'No definido'}
                </div>
                <div className='font-medium text-green-600'>{localData.firstName}</div>
              </div>
            </div>
          )}

          {localData.lastName !== shopifyData.lastName && (
            <div className='flex justify-between'>
              <span className='text-gray-600'>Apellido:</span>
              <div className='text-right'>
                <div className='text-xs text-red-600 line-through'>
                  {shopifyData.lastName || 'No definido'}
                </div>
                <div className='font-medium text-green-600'>{localData.lastName}</div>
              </div>
            </div>
          )}
        </div>

        <p className='text-xs text-orange-600'>
          💡 Los cambios se enviarán desde tu base de datos local hacia Shopify
        </p>
      </div>
    </div>
  )
}
