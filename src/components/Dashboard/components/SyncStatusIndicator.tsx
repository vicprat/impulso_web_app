// components/UserManagement/SyncStatusIndicator.tsx
'use client'

import { useCurrentUser, useSyncWithShopify } from '@/modules/user/hooks/management'

interface SyncStatusIndicatorProps {
  className?: string
}

export function SyncStatusIndicator({ className = '' }: SyncStatusIndicatorProps) {
  const { currentUser } = useCurrentUser()
  const syncWithShopify = useSyncWithShopify()

  if (!currentUser) return null

  // Comparar datos locales vs Shopify
  const localData = {
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
  }

  const shopifyData = {
    firstName: currentUser.shopifyData?.displayName?.split(' ')[0] || '',
    lastName: currentUser.shopifyData?.displayName?.split(' ').slice(1).join(' ') || '',
  }

  const hasChanges =
    currentUser.needsShopifySync ||
    localData.firstName !== shopifyData.firstName ||
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

// components/UserManagement/SyncHistory.tsx - Historial de sincronizaciones
export function SyncHistory() {
  const { currentUser } = useCurrentUser()

  if (!currentUser) return null

  // En una implementación real, esto vendría de una API
  const syncHistory = [
    {
      changes: ['firstName: "Victor" → "Enrique"', 'lastName: "Trujillo" → "Prado"'],

      direction: 'local_to_shopify' as const,

      id: '1',
      // 2 horas atrás
      status: 'success' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      changes: ['Initial sync'],

      direction: 'shopify_to_local' as const,

      id: '2',
      // 1 día atrás
      status: 'success' as const,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ]

  return (
    <div className='rounded-lg border border-gray-200 bg-white p-4'>
      <h3 className='mb-3 font-medium text-gray-900'>Historial de Sincronización</h3>

      <div className='space-y-3'>
        {syncHistory.map((sync) => (
          <div
            key={sync.id}
            className='flex items-start space-x-3 border-b border-gray-100 pb-3 last:border-b-0'
          >
            <div
              className={`rounded-full p-1 ${
                sync.status === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <span
                className={`text-xs ${
                  sync.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {sync.status === 'success' ? '✓' : '✗'}
              </span>
            </div>

            <div className='min-w-0 flex-1'>
              <div className='mb-1 flex items-center space-x-2'>
                <span className='text-sm font-medium text-gray-900'>
                  {sync.direction === 'local_to_shopify'
                    ? 'Enviado a Shopify'
                    : 'Recibido de Shopify'}
                </span>
                <span className='text-xs text-gray-500'>
                  {sync.direction === 'local_to_shopify' ? '📤' : '📥'}
                </span>
              </div>

              <div className='mb-1 text-xs text-gray-500'>{sync.timestamp.toLocaleString()}</div>

              <div className='text-xs text-gray-600'>
                {sync.changes.map((change, index) => (
                  <div key={index} className='mt-1 rounded bg-gray-50 px-2 py-1 font-mono'>
                    {change}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className='mt-3 border-t border-gray-200 pt-3'>
        <button className='text-xs text-blue-600 hover:text-blue-800'>
          Ver historial completo
        </button>
      </div>
    </div>
  )
}

// utils/syncHelpers.ts - Utilidades para sincronización
export const SyncHelpers = {
  /**
   * Compara datos locales con datos de Shopify
   */
  compareProfileData: (localData: any, shopifyData: any) => {
    const differences = []

    const localName = {
      firstName: localData.firstName || '',
      lastName: localData.lastName || '',
    }

    const shopifyName = {
      firstName: shopifyData?.displayName?.split(' ')[0] || '',
      lastName: shopifyData?.displayName?.split(' ').slice(1).join(' ') || '',
    }

    if (localName.firstName !== shopifyName.firstName) {
      differences.push({
        field: 'firstName',
        local: localName.firstName,
        shopify: shopifyName.firstName,
        type: 'update',
      })
    }

    if (localName.lastName !== shopifyName.lastName) {
      differences.push({
        field: 'lastName',
        local: localName.lastName,
        shopify: shopifyName.lastName,
        type: 'update',
      })
    }

    return differences
  },

  /**
   * Genera un resumen de cambios para mostrar al usuario
   */
  generateChangesSummary: (differences: any[]) => {
    if (differences.length === 0) {
      return 'No hay cambios pendientes'
    }

    const summary = differences.map((diff) => {
      const fieldNames = {
        firstName: 'Nombre',
        lastName: 'Apellido',
      }

      const fieldName = fieldNames[diff.field as keyof typeof fieldNames] || diff.field
      return `${fieldName}: "${diff.shopify}" → "${diff.local}"`
    })

    return summary.join(', ')
  },

  /**
   * Valida que los datos pueden ser sincronizados
   */
  validateSyncData: (data: any) => {
    const errors = []

    if (!data.firstName?.trim()) {
      errors.push('El nombre es requerido')
    }

    if (!data.lastName?.trim()) {
      errors.push('El apellido es requerido')
    }

    if (data.firstName && data.firstName.length > 50) {
      errors.push('El nombre no puede exceder 50 caracteres')
    }

    if (data.lastName && data.lastName.length > 50) {
      errors.push('El apellido no puede exceder 50 caracteres')
    }

    return {
      errors,
      isValid: errors.length === 0,
    }
  },
}
