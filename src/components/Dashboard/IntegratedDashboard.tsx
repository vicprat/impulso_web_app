'use client';

import { useState } from 'react';
import { Guard } from '@/components/Guards';
import { EnhancedUserProfile } from './components/EnhancedUserProfile';
import { UserManagementAdmin } from './components/UserManagementAdmin';
import { RolePermissionsGuide } from './components/RolePermissionsGuide';
import { useCurrentUser } from '@/modules/user/hooks/management';
import { useCustomerOrders, useCustomerOrder } from '@/modules/customer/hooks';
import { useAuth } from '@/modules/auth/context/useAuth';

function DashboardContent() {
  const { hasPermission, hasRole } = useAuth();
  const { currentUser, isLoading: userLoading } = useCurrentUser();
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'orders' | 'admin'>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Queries para órdenes
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useCustomerOrders({ first: 10 });
  const { data: orderDetail } = useCustomerOrder(selectedOrderId || '', {
    enabled: !!selectedOrderId
  });
  
  const orders = ordersData?.data?.customer?.orders?.edges?.map(edge => edge.node) || [];

  if (userLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="bg-gray-200 h-8 w-48 rounded mx-auto"></div>
          <div className="bg-gray-200 h-6 w-32 rounded mx-auto"></div>
          <div className="bg-gray-200 h-16 w-full max-w-md rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  const navigationItems = [
    {
      id: 'overview',
      label: 'Resumen',
      icon: '📊',
      description: 'Vista general de tu cuenta'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: '👤',
      description: 'Gestionar información personal'
    },
    {
      id: 'orders',
      label: 'Órdenes',
      icon: '📦',
      description: 'Historial de compras'
    }
  ];

  // Agregar sección de administración si tiene permisos
  if (hasPermission('manage_users') || hasRole('admin') || hasRole('super_admin')) {
    navigationItems.push({
      id: 'admin',
      label: 'Administración',
      icon: '⚙️',
      description: 'Panel de administración'
    });
  }

  const handleLoadOrders = () => {
    setActiveSection('orders');
    refetchOrders();
  };

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {currentUser.firstName || currentUser.email}
              </h1>
              <p className="text-gray-600">
                {currentUser.shopifyData?.displayName && (
                  <span>({currentUser.shopifyData.displayName}) • </span>
                )}
                Roles: {currentUser.roles.join(', ')}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentUser.shopifyData?.imageUrl && (
                <img 
                  src={currentUser.shopifyData.imageUrl} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                />
              )}
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser.firstName} {currentUser.lastName}
                </p>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-2 mb-6">
          <nav className="flex space-x-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex-1 flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <span className="text-blue-600 text-xl">👤</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Estado de Cuenta</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {currentUser.isActive ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <span className="text-green-600 text-xl">🛍️</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Órdenes Recientes</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {currentUser.shopifyData?.orderCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <span className="text-purple-600 text-xl">🏠</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Direcciones</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {currentUser.shopifyData?.addresses.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <span className="text-orange-600 text-xl">🔑</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Permisos</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {currentUser.permissions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveSection('profile')}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <span className="text-blue-600 mr-3">👤</span>
                        <span className="text-sm font-medium">Editar Perfil</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>

                    <button
                      onClick={handleLoadOrders}
                      className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <span className="text-green-600 mr-3">📦</span>
                        <span className="text-sm font-medium">Ver Órdenes</span>
                      </div>
                      <span className="text-gray-400">→</span>
                    </button>

                    {hasPermission('manage_users') && (
                      <button
                        onClick={() => setActiveSection('admin')}
                        className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="text-purple-600 mr-3">⚙️</span>
                          <span className="text-sm font-medium">Administración</span>
                        </div>
                        <span className="text-gray-400">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <EnhancedUserProfile />
          )}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Mis Órdenes</h2>
                <button
                  onClick={() => refetchOrders()}
                  disabled={ordersLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {ordersLoading ? 'Cargando...' : 'Actualizar'}
                </button>
              </div>

              {selectedOrderId && orderDetail ? (
                <div>
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="mb-4 text-blue-600 hover:text-blue-800"
                  >
                    ← Volver a la lista
                  </button>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold">Orden {orderDetail.data.name}</h3>
                    <p>Estado: {orderDetail.data.fulfillmentStatus}</p>
                    <p>Total: {orderDetail.data.totalPrice.amount} {orderDetail.data.totalPrice.currencyCode}</p>
                    <p>Fecha: {new Date(orderDetail.data.processedAt).toLocaleDateString()}</p>
                    
                    {orderDetail.data.lineItems?.edges?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Productos:</h4>
                        <div className="space-y-2">
                          {orderDetail.data.lineItems.edges.map(({ node }: any) => (
                            <div key={node.id} className="text-sm">
                              {node.quantity}x {node.title} - {node.price.amount} {node.price.currencyCode}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {ordersLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{order.name}</h3>
                              <p className="text-sm text-gray-600">
                                {order.fulfillmentStatus} • {new Date(order.processedAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm font-medium mt-1">
                                {order.totalPrice.amount} {order.totalPrice.currencyCode}
                              </p>
                              <button
                                onClick={() => handleViewOrderDetails(order.id)}
                                className="mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                              >
                                Ver detalles
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <span className="text-6xl">📦</span>
                      <h3 className="text-lg font-medium text-gray-900 mt-4">No hay órdenes</h3>
                      <p className="text-gray-600 mt-2">Aún no tienes órdenes en tu cuenta</p>
                      <button
                        onClick={() => refetchOrders()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Buscar órdenes
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Admin Section */}
          {activeSection === 'admin' && (
            <Guard.Permission permission="manage_users" fallback={
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="text-center py-8">
                  <span className="text-6xl">🔒</span>
                  <h2 className="text-xl font-semibold text-gray-800 mt-4">Acceso Restringido</h2>
                  <p className="text-gray-600 mt-2">No tienes permisos para acceder al panel de administración</p>
                </div>
              </div>
            }>
              <UserManagementAdmin />
              <RolePermissionsGuide />
            </Guard.Permission>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntegratedDashboard() {
  return (
    <Guard.Auth>
      <DashboardContent />
    </Guard.Auth>
  );
}