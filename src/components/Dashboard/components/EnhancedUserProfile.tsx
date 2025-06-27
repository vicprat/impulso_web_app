// components/UserManagement/EnhancedUserProfile.tsx
'use client'

import { useState } from 'react'

import { useAuth } from '@/modules/auth/context/useAuth'
import {
  useCurrentUser,
  useUpdateLocalProfile,
  useSyncWithShopify,
  useUpdatePreferences,
} from '@/modules/user/hooks/management'

import { SyncHistory, SyncStatusIndicator } from './SyncStatusIndicator'
import { Logout } from '../../Auth/Logout'

export function EnhancedUserProfile() {
  const { hasPermission } = useAuth()
  const { currentUser, isLoading } = useCurrentUser()
  const updateProfile = useUpdateLocalProfile()
  const syncWithShopify = useSyncWithShopify()
  const updatePreferences = useUpdatePreferences()

  const [activeTab, setActiveTab] = useState<'profile' | 'shopify' | 'preferences' | 'security'>(
    'profile'
  )
  const [isEditing, setIsEditing] = useState(false)

  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  })

  const [preferences, setPreferences] = useState({
    language: 'es',
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    timezone: 'America/Mexico_City',
  })

  if (isLoading) {
    return <div className='h-64 animate-pulse rounded-lg bg-gray-200'></div>
  }

  if (!currentUser) {
    return (
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <p className='text-gray-500'>No se pudo cargar el perfil del usuario</p>
      </div>
    )
  }

  const handleEditProfile = () => {
    setEditForm({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
    })
    setIsEditing(true)
  }

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(editForm)
      setIsEditing(false)
      // Mostrar mensaje de que se guardó localmente
      alert(
        'Perfil actualizado en la base de datos local. Usa "Sincronizar" para aplicar cambios en Shopify.'
      )
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error al actualizar el perfil')
    }
  }

  const handleSyncShopify = async () => {
    try {
      await syncWithShopify.mutateAsync()
      alert('¡Datos sincronizados exitosamente con Shopify!')
    } catch (error) {
      console.error('Error syncing with Shopify:', error)
      alert(`Error al sincronizar con Shopify: ${(error as Error).message}`)
    }
  }

  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences.mutateAsync(preferences)
      alert('Preferencias actualizadas')
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  const tabs = [
    { icon: '👤', id: 'profile', label: 'Perfil' },
    { icon: '🛍️', id: 'shopify', label: 'Datos Shopify' },
    { icon: '⚙️', id: 'preferences', label: 'Preferencias' },
    { icon: '🔒', id: 'security', label: 'Seguridad' },
  ]

  return (
    <div className='overflow-hidden rounded-lg bg-white shadow-md'>
      {/* Header con tabs */}
      <div className='border-b border-gray-200'>
        <div className='flex space-x-4 px-6 py-4'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors ${
                activeTab === tab.id
                  ? 'border border-blue-200 bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className='text-sm font-medium'>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className='p-6'>
        {/* Tab: Perfil */}
        {activeTab === 'profile' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Información Personal</h2>
              <button
                onClick={isEditing ? handleSaveProfile : handleEditProfile}
                disabled={updateProfile.isPending}
                className={`rounded-lg px-4 py-2 disabled:opacity-50 ${
                  isEditing
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {updateProfile.isPending ? 'Guardando...' : isEditing ? 'Guardar' : 'Editar'}
              </button>
            </div>

            {isEditing ? (
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <input
                    type='text'
                    placeholder='Nombre'
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className='rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                  />
                  <input
                    type='text'
                    placeholder='Apellido'
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className='rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500'
                  />
                </div>
                <div className='flex space-x-3'>
                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                    className='rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50'
                  >
                    {updateProfile.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className='rounded-lg bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400'
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      Nombre completo
                    </label>
                    <p className='text-lg'>
                      {currentUser.firstName} {currentUser.lastName}
                    </p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>Email</label>
                    <p className='text-lg'>{currentUser.email}</p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      ID Shopify
                    </label>
                    <p className='font-mono text-sm text-gray-500'>
                      {currentUser.shopifyCustomerId}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>Estado</label>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        currentUser.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {currentUser.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      Último acceso
                    </label>
                    <p className='text-sm'>
                      {currentUser.lastLoginAt
                        ? new Date(currentUser.lastLoginAt).toLocaleDateString()
                        : 'Nunca'}
                    </p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      Miembro desde
                    </label>
                    <p className='text-sm'>
                      {new Date(currentUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Roles y Permisos */}
            <div className='border-t pt-6'>
              <h3 className='mb-4 text-lg font-medium'>Roles y Permisos</h3>
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>Roles</label>
                  <div className='flex flex-wrap gap-2'>
                    {currentUser.roles.map((role) => (
                      <span
                        key={role}
                        className='rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800'
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Permisos principales
                  </label>
                  <div className='flex max-h-32 flex-wrap gap-1 overflow-y-auto'>
                    {currentUser.permissions.slice(0, 10).map((permission) => (
                      <span
                        key={permission}
                        className='rounded bg-green-100 px-2 py-1 text-xs text-green-800'
                      >
                        {permission}
                      </span>
                    ))}
                    {currentUser.permissions.length > 10 && (
                      <span className='px-2 py-1 text-xs text-gray-500'>
                        +{currentUser.permissions.length - 10} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Datos Shopify */}
        {activeTab === 'shopify' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold'>Datos de Shopify</h2>
              <div className='flex items-center space-x-3'>
                {currentUser.needsShopifySync && (
                  <div className='flex items-center space-x-2 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2'>
                    <span className='text-yellow-600'>⚠️</span>
                    <span className='text-sm font-medium text-yellow-800'>Cambios pendientes</span>
                  </div>
                )}
                <button
                  onClick={handleSyncShopify}
                  disabled={syncWithShopify.isPending}
                  className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
                    currentUser.needsShopifySync
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  } disabled:opacity-50`}
                >
                  {syncWithShopify.isPending ? (
                    <>
                      <div className='size-4 animate-spin rounded-full border-2 border-white border-t-transparent'></div>
                      <span>Enviando a Shopify...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentUser.needsShopifySync ? '📤' : '🔄'}</span>
                      <span>{currentUser.needsShopifySync ? 'Enviar Cambios' : 'Sincronizar'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje explicativo */}
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
              <div className='flex items-start space-x-3'>
                <span className='text-lg text-blue-600'>ℹ️</span>
                <div className='text-blue-800'>
                  <h4 className='mb-1 font-medium'>¿Cómo funciona la sincronización?</h4>
                  <p className='text-sm'>
                    Los cambios que realizas en tu perfil se guardan en nuestra base de datos. Al
                    hacer clic en "Sincronizar", estos cambios se envían a tu cuenta de Shopify para
                    mantener ambos sistemas actualizados.
                  </p>
                  {currentUser.needsShopifySync && (
                    <p className='mt-2 text-sm font-medium'>
                      Hay cambios pendientes que aún no se han enviado a Shopify.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estado de sincronización */}
            <SyncStatusIndicator className='mb-6' />

            {currentUser.shopifyData ? (
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      Nombre en Shopify
                    </label>
                    <p className='text-lg'>{currentUser.shopifyData.displayName}</p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>Teléfono</label>
                    <p>{currentUser.shopifyData.phoneNumber || 'No especificado'}</p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>Tags</label>
                    <div className='flex flex-wrap gap-1'>
                      {currentUser.shopifyData.tags.length > 0 ? (
                        currentUser.shopifyData.tags.map((tag) => (
                          <span
                            key={tag}
                            className='rounded bg-gray-100 px-2 py-1 text-sm text-gray-700'
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className='text-sm text-gray-500'>Sin tags</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>Avatar</label>
                    {currentUser.shopifyData.imageUrl ? (
                      <img
                        src={currentUser.shopifyData.imageUrl}
                        alt='Avatar'
                        className='size-16 rounded-full border-2 border-gray-200 object-cover'
                      />
                    ) : (
                      <div className='flex size-16 items-center justify-center rounded-full bg-gray-200'>
                        <span className='text-gray-500'>Sin foto</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      Direcciones guardadas
                    </label>
                    <p>{currentUser.shopifyData.addresses.length} direcciones</p>
                  </div>

                  <div>
                    <label className='mb-1 block text-sm font-medium text-gray-600'>
                      Órdenes recientes
                    </label>
                    <p>{currentUser.shopifyData.orderCount || 0} órdenes</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className='py-8 text-center'>
                <p className='mb-4 text-gray-500'>No se han cargado los datos de Shopify</p>
                <button
                  onClick={handleSyncShopify}
                  disabled={syncWithShopify.isPending}
                  className='rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50'
                >
                  {syncWithShopify.isPending ? 'Cargando...' : 'Cargar datos de Shopify'}
                </button>
              </div>
            )}

            {/* Historial de sincronización */}
            <div className='mt-6'>
              <SyncHistory />
            </div>
          </div>
        )}

        {/* Tab: Preferencias */}
        {activeTab === 'preferences' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold'>Preferencias</h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>Idioma</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='es'>Español</option>
                    <option value='en'>English</option>
                    <option value='fr'>Français</option>
                  </select>
                </div>

                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Zona horaria
                  </label>
                  <select
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                    className='w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500'
                  >
                    <option value='America/Mexico_City'>Ciudad de México</option>
                    <option value='America/New_York'>Nueva York</option>
                    <option value='Europe/Madrid'>Madrid</option>
                    <option value='Europe/Paris'>París</option>
                    <option value='America/Los_Angeles'>Los Ángeles</option>
                  </select>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='mb-2 block text-sm font-medium text-gray-600'>
                    Notificaciones
                  </label>
                  <div className='space-y-3'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={preferences.notifications.email}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications: {
                              ...preferences.notifications,
                              email: e.target.checked,
                            },
                          })
                        }
                        className='mr-3 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm'>Notificaciones por email</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={preferences.notifications.sms}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, sms: e.target.checked },
                          })
                        }
                        className='mr-3 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm'>Notificaciones por SMS</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={preferences.notifications.push}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            notifications: { ...preferences.notifications, push: e.target.checked },
                          })
                        }
                        className='mr-3 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm'>Notificaciones push</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                onClick={handleUpdatePreferences}
                disabled={updatePreferences.isPending}
                className='rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
              >
                {updatePreferences.isPending ? 'Guardando...' : 'Guardar Preferencias'}
              </button>
            </div>
          </div>
        )}

        {/* Tab: Seguridad */}
        {activeTab === 'security' && (
          <div className='space-y-6'>
            <h2 className='text-xl font-semibold'>Seguridad y Acceso</h2>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
              <div className='space-y-4'>
                <div className='rounded-lg border border-green-200 bg-green-50 p-4'>
                  <div className='flex items-center'>
                    <span className='mr-3 text-xl text-green-600'>✅</span>
                    <div>
                      <h4 className='font-medium text-green-800'>Autenticación con Shopify</h4>
                      <p className='text-sm text-green-600'>
                        Tu cuenta está conectada de forma segura
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <div className='flex items-center'>
                    <span className='mr-3 text-xl text-blue-600'>🔒</span>
                    <div>
                      <h4 className='font-medium text-blue-800'>Sesión activa</h4>
                      <p className='text-sm text-blue-600'>
                        Tu sesión está protegida con tokens seguros
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <div>
                  <h4 className='mb-2 font-medium text-gray-800'>Actividad reciente</h4>
                  <div className='space-y-2 text-sm text-gray-600'>
                    <p>
                      • Último acceso:{' '}
                      {currentUser.lastLoginAt
                        ? new Date(currentUser.lastLoginAt).toLocaleString()
                        : 'Información no disponible'}
                    </p>
                    <p>• Cuenta creada: {new Date(currentUser.createdAt).toLocaleString()}</p>
                    <p>• Estado: {currentUser.isActive ? 'Activa' : 'Inactiva'}</p>
                  </div>
                </div>

                {hasPermission('view_activity_logs') && (
                  <div>
                    <button className='text-sm text-blue-600 underline hover:text-blue-800'>
                      Ver historial completo de actividad
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className='border-t pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='font-medium text-gray-800'>Cerrar Sesión</h4>
                  <p className='text-sm text-gray-600'>
                    Cerrar sesión de forma segura en todos los dispositivos
                  </p>
                </div>
                <Logout />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
