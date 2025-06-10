// components/UserManagement/EnhancedUserProfile.tsx
'use client';

import { useState } from 'react';
import { Logout } from '../Auth/Logout';
import { useUserManagement } from '@/modules/user/context';
import { SyncHistory, SyncStatusIndicator } from './SyncStatusIndicator';

export function EnhancedUserProfile() {
  const { 
    currentUser, 
    isLoading, 
    updateProfile, 
    syncWithShopify, 
    updatePreferences,
    hasPermission 
  } = useUserManagement();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'shopify' | 'preferences' | 'security'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
  });

  const [preferences, setPreferences] = useState({
    language: 'es',
    timezone: 'America/Mexico_City',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  });

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>;
  }

  if (!currentUser) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-500">No se pudo cargar el perfil del usuario</p>
      </div>
    );
  }

  const handleEditProfile = () => {
    setEditForm({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      // Mostrar mensaje de que se guardó localmente
      alert('Perfil actualizado en la base de datos local. Usa "Sincronizar" para aplicar cambios en Shopify.');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleSyncShopify = async () => {
    try {
      setIsSyncing(true);
      await syncWithShopify();
      alert('¡Datos sincronizados exitosamente con Shopify!');
    } catch (error) {
      console.error('Error syncing with Shopify:', error);
      alert('Error al sincronizar con Shopify: ' + (error as Error).message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await updatePreferences(preferences);
      alert('Preferencias actualizadas');
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: '👤' },
    { id: 'shopify', label: 'Datos Shopify', icon: '🛍️' },
    { id: 'preferences', label: 'Preferencias', icon: '⚙️' },
    { id: 'security', label: 'Seguridad', icon: '🔒' },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header con tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-4 px-6 py-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Tab: Perfil */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Información Personal</h2>
              <button
                onClick={isEditing ? handleSaveProfile : handleEditProfile}
                className={`px-4 py-2 rounded-lg ${
                  isEditing
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isEditing ? 'Guardar' : 'Editar'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                    className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre completo</label>
                    <p className="text-lg">{currentUser.firstName} {currentUser.lastName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <p className="text-lg">{currentUser.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ID Shopify</label>
                    <p className="text-sm text-gray-500 font-mono">{currentUser.shopifyCustomerId}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      currentUser.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {currentUser.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Último acceso</label>
                    <p className="text-sm">
                      {currentUser.lastLoginAt 
                        ? new Date(currentUser.lastLoginAt).toLocaleDateString()
                        : 'Nunca'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Miembro desde</label>
                    <p className="text-sm">{new Date(currentUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Roles y Permisos */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium mb-4">Roles y Permisos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {currentUser.roles.map(role => (
                      <span 
                        key={role} 
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Permisos principales</label>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {currentUser.permissions.slice(0, 10).map(permission => (
                      <span 
                        key={permission} 
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
                      >
                        {permission}
                      </span>
                    ))}
                    {currentUser.permissions.length > 10 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
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
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Datos de Shopify</h2>
              <div className="flex items-center space-x-3">
                {currentUser.needsShopifySync && (
                  <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="text-yellow-800 text-sm font-medium">Cambios pendientes</span>
                  </div>
                )}
                <button
                  onClick={handleSyncShopify}
                  disabled={isSyncing}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    currentUser.needsShopifySync 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  } disabled:opacity-50`}
                >
                  {isSyncing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Enviando a Shopify...</span>
                    </>
                  ) : (
                    <>
                      <span>{currentUser.needsShopifySync ? '📤' : '🔄'}</span>
                      <span>
                        {currentUser.needsShopifySync ? 'Enviar Cambios' : 'Sincronizar'}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje explicativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div className="text-blue-800">
                  <h4 className="font-medium mb-1">¿Cómo funciona la sincronización?</h4>
                  <p className="text-sm">
                    Los cambios que realizas en tu perfil se guardan en nuestra base de datos. 
                    Al hacer clic en "Sincronizar", estos cambios se envían a tu cuenta de Shopify 
                    para mantener ambos sistemas actualizados.
                  </p>
                  {currentUser.needsShopifySync && (
                    <p className="text-sm mt-2 font-medium">
                      Hay cambios pendientes que aún no se han enviado a Shopify.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Estado de sincronización */}
            <SyncStatusIndicator className="mb-6" />

            {currentUser.shopifyData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nombre en Shopify</label>
                    <p className="text-lg">{currentUser.shopifyData.displayName}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                    <p>{currentUser.shopifyData.phoneNumber || 'No especificado'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {currentUser.shopifyData.tags.length > 0 ? (
                        currentUser.shopifyData.tags.map(tag => (
                          <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Sin tags</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Avatar</label>
                    <img 
                      src={currentUser.shopifyData.imageUrl} 
                      alt="Avatar" 
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Direcciones guardadas</label>
                    <p>{currentUser.shopifyData.addresses.length} direcciones</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Órdenes recientes</label>
                    <p>{currentUser.shopifyData.orderCount || 0} órdenes</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No se han cargado los datos de Shopify</p>
                <button
                  onClick={handleSyncShopify}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Cargar datos de Shopify
                </button>
              </div>
            )}

            {/* Historial de sincronización */}
            <div className="mt-6">
              <SyncHistory />
            </div>
          </div>
        )}

        {/* Tab: Preferencias */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Preferencias</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Idioma</label>
                  <select 
                    value={preferences.language}
                    onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Zona horaria</label>
                  <select 
                    value={preferences.timezone}
                    onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="America/Mexico_City">Ciudad de México</option>
                    <option value="America/New_York">Nueva York</option>
                    <option value="Europe/Madrid">Madrid</option>
                    <option value="Europe/Paris">París</option>
                    <option value="America/Los_Angeles">Los Ángeles</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Notificaciones</label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.email}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, email: e.target.checked }
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">Notificaciones por email</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.sms}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, sms: e.target.checked }
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">Notificaciones por SMS</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={preferences.notifications.push}
                        onChange={(e) => setPreferences({
                          ...preferences,
                          notifications: { ...preferences.notifications, push: e.target.checked }
                        })}
                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">Notificaciones push</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleUpdatePreferences}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Preferencias
              </button>
            </div>
          </div>
        )}

        {/* Tab: Seguridad */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Seguridad y Acceso</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-green-600 text-xl mr-3">✅</span>
                    <div>
                      <h4 className="font-medium text-green-800">Autenticación con Shopify</h4>
                      <p className="text-sm text-green-600">Tu cuenta está conectada de forma segura</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-blue-600 text-xl mr-3">🔒</span>
                    <div>
                      <h4 className="font-medium text-blue-800">Sesión activa</h4>
                      <p className="text-sm text-blue-600">Tu sesión está protegida con tokens seguros</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Actividad reciente</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Último acceso: {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString() : 'Información no disponible'}</p>
                    <p>• Cuenta creada: {new Date(currentUser.createdAt).toLocaleString()}</p>
                    <p>• Estado: {currentUser.isActive ? 'Activa' : 'Inactiva'}</p>
                  </div>
                </div>
                
                {hasPermission('view_activity_logs') && (
                  <div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm underline">
                      Ver historial completo de actividad
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-800">Cerrar Sesión</h4>
                  <p className="text-sm text-gray-600">Cerrar sesión de forma segura en todos los dispositivos</p>
                </div>
                <Logout />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}