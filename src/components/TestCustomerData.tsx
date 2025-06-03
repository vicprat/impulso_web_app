/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TestCustomerData.tsx - ACTUALIZADO CON QUERIES CORRECTOS
'use client';

import { useState } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useCustomerAccount } from '@/modules/auth/hooks/useCustomerAccount';

export function TestCustomerData() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { 
    isLoading: customerLoading, 
    getOrders, 
    getAddresses, 
    getProfile,
    getBasicInfo // ← Nuevo método para pruebas básicas
  } = useCustomerAccount();

  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [basicInfo, setBasicInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // ✅ Test básico para verificar conexión
  const handleGetBasicInfo = async () => {
    try {
      clearMessages();
      console.log('🧪 Testing getBasicInfo...');
      const basicData = await getBasicInfo();
      setBasicInfo(basicData);
      setSuccessMessage(`✅ Info básica cargada: ${basicData.emailAddress.emailAddress}`);
    } catch (err) {
      console.error('❌ Error getting basic info:', err);
      setError(`Error al cargar info básica: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGetOrders = async () => {
    try {
      clearMessages();
      console.log('🧪 Testing getOrders...');
      const ordersData = await getOrders(5);
      setOrders(ordersData);
      setSuccessMessage(`✅ Órdenes cargadas exitosamente: ${ordersData.length} órdenes`);
    } catch (err) {
      console.error('❌ Error getting orders:', err);
      setError(`Error al cargar órdenes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGetAddresses = async () => {
    try {
      clearMessages();
      console.log('🧪 Testing getAddresses...');
      const addressesData = await getAddresses();
      setAddresses(addressesData);
      setSuccessMessage(`✅ Direcciones cargadas exitosamente: ${addressesData.length} direcciones`);
    } catch (err) {
      console.error('❌ Error getting addresses:', err);
      setError(`Error al cargar direcciones: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleGetProfile = async () => {
    try {
      clearMessages();
      console.log('🧪 Testing getProfile...');
      const profileData = await getProfile();
      setProfile(profileData);
      setSuccessMessage('✅ Perfil cargado exitosamente');
    } catch (err) {
      console.error('❌ Error getting profile:', err);
      setError(`Error al cargar perfil: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testDirectAPI = async () => {
    try {
      clearMessages();
      console.log('🧪 Testing direct API call...');
      
      const response = await fetch('/api/customer/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query TestQuery {
              customer {
                id
                emailAddress {
                  emailAddress
                }
              }
            }
          `
        }),
      });

      console.log('📡 Direct API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API call failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Direct API response:', data);
      setSuccessMessage('✅ API directa funciona correctamente');
    } catch (err) {
      console.error('❌ Direct API error:', err);
      setError(`Error en API directa: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (authLoading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p>Cargando estado de autenticación...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Autenticación Requerida
        </h3>
        <p className="text-yellow-700">
          Debes iniciar sesión para probar las funciones de Customer Account API.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">🧪 Test Customer Account API - Queries Corregidos</h2>
        
        {/* Estado de usuario */}
        <div className="mb-6 p-4 bg-blue-50 rounded">
          <h3 className="font-medium text-blue-900 mb-2">Usuario Autenticado:</h3>
          <p className="text-blue-800">Email: {user?.email}</p>
          <p className="text-blue-800">Roles: {user?.roles?.join(', ') || 'Ninguno'}</p>
          <p className="text-blue-800">Permisos: {user?.permissions?.join(', ') || 'Ninguno'}</p>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600">{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-red-500">Ver detalles técnicos</summary>
              <pre className="text-xs mt-2 p-2 bg-red-100 rounded overflow-auto">
                {error}
              </pre>
            </details>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-600">{successMessage}</p>
          </div>
        )}

        {/* Botones de prueba en orden recomendado */}
        <div className="space-y-4 mb-6">
          {/* Fila 1: Tests básicos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={testDirectAPI}
              disabled={customerLoading}
              className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 font-medium"
            >
              {customerLoading ? 'Cargando...' : '1️⃣ Test API Directa'}
            </button>

            <button
              onClick={handleGetBasicInfo}
              disabled={customerLoading}
              className="px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {customerLoading ? 'Cargando...' : '2️⃣ Info Básica'}
            </button>
          </div>

          {/* Fila 2: Tests de datos específicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleGetProfile}
              disabled={customerLoading}
              className="px-4 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {customerLoading ? 'Cargando...' : '3️⃣ Cargar Perfil'}
            </button>

            <button
              onClick={handleGetOrders}
              disabled={customerLoading}
              className="px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {customerLoading ? 'Cargando...' : '4️⃣ Cargar Órdenes'}
            </button>

            <button
              onClick={handleGetAddresses}
              disabled={customerLoading}
              className="px-4 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              {customerLoading ? 'Cargando...' : '5️⃣ Cargar Direcciones'}
            </button>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded">
          <h4 className="font-medium text-amber-800 mb-2">📋 Orden recomendado de pruebas:</h4>
          <ol className="text-sm text-amber-700 space-y-1">
            <li><strong>1️⃣ Test API Directa:</strong> Verifica que la conexión básica funcione</li>
            <li><strong>2️⃣ Info Básica:</strong> Obtiene ID y email del cliente</li>
            <li><strong>3️⃣ Cargar Perfil:</strong> Información completa del perfil</li>
            <li><strong>4️⃣ Cargar Órdenes:</strong> Historial de órdenes del cliente</li>
            <li><strong>5️⃣ Cargar Direcciones:</strong> Direcciones guardadas del cliente</li>
          </ol>
        </div>

        {/* Resultados */}
        <div className="space-y-6">
          {/* Info básica */}
          {basicInfo && (
            <div className="border rounded p-4 bg-blue-50">
              <h3 className="font-medium mb-2 text-blue-800">ℹ️ Información Básica:</h3>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {basicInfo.id}</p>
                <p><strong>Email:</strong> {basicInfo.emailAddress.emailAddress}</p>
              </div>
            </div>
          )}

          {/* Perfil */}
          {profile && (
            <div className="border rounded p-4 bg-purple-50">
              <h3 className="font-medium mb-2 text-purple-800">👤 Perfil del Cliente:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Nombre:</strong> {profile.firstName || 'No especificado'} {profile.lastName || ''}</p>
                <p><strong>Email:</strong> {profile.emailAddress.emailAddress}</p>
                <p><strong>Teléfono:</strong> {profile.phoneNumber?.phoneNumber || 'No especificado'}</p>
                {profile.defaultAddress && (
                  <div className="mt-2 p-2 bg-purple-100 rounded">
                    <p className="font-medium">Dirección por defecto:</p>
                    <p>{profile.defaultAddress.address1}, {profile.defaultAddress.city}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Órdenes */}
          {orders.length > 0 && (
            <div className="border rounded p-4 bg-green-50">
              <h3 className="font-medium mb-2 text-green-800">🛒 Órdenes ({orders.length}):</h3>
              <div className="space-y-2">
                {orders.slice(0, 3).map((order, index) => (
                  <div key={index} className="p-2 bg-green-100 rounded">
                    <p className="font-medium">{order.name}</p>
                    <p className="text-sm text-green-700">
                      {order.totalPrice?.amount} {order.totalPrice?.currencyCode} - 
                      {order.financialStatus} / {order.fulfillmentStatus}
                    </p>
                    <p className="text-xs text-green-600">
                      Procesada: {new Date(order.processedAt).toLocaleDateString()}
                    </p>
                    {order.lineItems?.edges?.length > 0 && (
                      <div className="mt-1 text-xs">
                        <strong>Productos:</strong> {order.lineItems.edges.map((item: any) => item.node.title).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                {orders.length > 3 && (
                  <p className="text-sm text-green-600">... y {orders.length - 3} más</p>
                )}
              </div>
            </div>
          )}

          {/* Direcciones */}
          {addresses.length > 0 && (
            <div className="border rounded p-4 bg-orange-50">
              <h3 className="font-medium mb-2 text-orange-800">🏠 Direcciones ({addresses.length}):</h3>
              <div className="space-y-2">
                {addresses.map((address, index) => (
                  <div key={index} className="p-2 bg-orange-100 rounded">
                    <p className="font-medium">
                      {address.firstName} {address.lastName}
                    </p>
                    <p className="text-sm text-orange-700">
                      {address.address1}
                      {address.address2 && `, ${address.address2}`}
                    </p>
                    <p className="text-sm text-orange-700">
                      {address.city}, {address.province} {address.zip}, {address.country}
                    </p>
                    {address.phone && (
                      <p className="text-xs text-orange-600">Tel: {address.phone}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado de no datos */}
          {!basicInfo && !profile && orders.length === 0 && addresses.length === 0 && !error && (
            <div className="text-center p-8 text-gray-500">
              <p>👆 Haz clic en los botones de arriba para probar la API</p>
              <p className="text-sm mt-2">Comienza con &quot;Test API Directa&quot; para verificar la conexión</p>
            </div>
          )}
        </div>

        {/* Debug info */}
        <div className="mt-8 p-4 bg-gray-50 rounded text-xs">
          <details>
            <summary className="cursor-pointer font-medium">🔧 Información de Debug</summary>
            <div className="mt-2 space-y-2">
              <p><strong>Usuario autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
              <p><strong>Cargando:</strong> {customerLoading ? 'Sí' : 'No'}</p>
              <p><strong>Hora actual:</strong> {new Date().toLocaleTimeString()}</p>
              <p><strong>API Version:</strong> {process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}</p>
              <p><strong>Shop ID:</strong> {process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || 'No disponible'}</p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}