'use client'

import { useState } from 'react'

import { Guard } from '@/components/Guards'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCustomerOrder, useCustomerOrders } from '@/modules/customer/hooks'
import { useCurrentUser } from '@/modules/user/hooks/management'

import { EnhancedUserProfile } from './components/EnhancedUserProfile'
import { RolePermissionsGuide } from './components/RolePermissionsGuide'
import { UserManagementAdmin } from './components/UserManagementAdmin'

function DashboardContent() {
  const { hasPermission, hasRole } = useAuth()
  const { currentUser, isLoading: userLoading } = useCurrentUser()
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'orders' | 'admin'>(
    'overview'
  )
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Queries para órdenes
  const {
    data: ordersData,
    isLoading: ordersLoading,
    refetch: refetchOrders,
  } = useCustomerOrders({ first: 10 })
  const { data: orderDetail } = useCustomerOrder(selectedOrderId || '', {
    enabled: !!selectedOrderId,
  })

  const orders = ordersData?.data?.customer?.orders?.edges?.map((edge) => edge.node) || []

  if (userLoading || !currentUser) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-pulse space-y-4 text-center'>
          <div className='mx-auto h-8 w-48 rounded bg-gray-200'></div>
          <div className='mx-auto h-6 w-32 rounded bg-gray-200'></div>
          <div className='mx-auto h-16 w-full max-w-md rounded bg-gray-200'></div>
        </div>
      </div>
    )
  }

  const navigationItems = [
    {
      description: 'Vista general de tu cuenta',
      icon: '📊',
      id: 'overview',
      label: 'Resumen',
    },
    {
      description: 'Gestionar información personal',
      icon: '👤',
      id: 'profile',
      label: 'Perfil',
    },
    {
      description: 'Historial de compras',
      icon: '📦',
      id: 'orders',
      label: 'Órdenes',
    },
  ]

  // Agregar sección de administración si tiene permisos
  if (hasPermission('manage_users') || hasRole('admin') || hasRole('super_admin')) {
    navigationItems.push({
      description: 'Panel de administración',
      icon: '⚙️',
      id: 'admin',
      label: 'Administración',
    })
  }

  const handleLoadOrders = () => {
    setActiveSection('orders')
    refetchOrders()
  }

  const handleViewOrderDetails = (orderId: string) => {
    setSelectedOrderId(orderId)
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Navigation */}
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='mb-6 rounded-lg bg-white p-2 shadow-sm'>
          <nav className='flex space-x-1'>
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`flex flex-1 items-center justify-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                  activeSection === item.id
                    ? 'border border-blue-200 bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className='text-xl'>{item.icon}</span>
                <div className='text-left'>
                  <div className='font-medium'>{item.label}</div>
                  <div className='text-xs opacity-75'>{item.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Sections */}
        <div className='space-y-6'>
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:col-span-2'>
                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <div className='flex items-center'>
                    <div className='rounded-lg bg-blue-100 p-2'>
                      <span className='text-xl text-blue-600'>👤</span>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Estado de Cuenta</p>
                      <p className='text-2xl font-semibold text-gray-900'>
                        {currentUser.isActive ? 'Activa' : 'Inactiva'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <div className='flex items-center'>
                    <div className='rounded-lg bg-green-100 p-2'>
                      <span className='text-xl text-green-600'>🛍️</span>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Órdenes Recientes</p>
                      <p className='text-2xl font-semibold text-gray-900'>
                        {currentUser.shopifyData?.orderCount || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <div className='flex items-center'>
                    <div className='rounded-lg bg-purple-100 p-2'>
                      <span className='text-xl text-purple-600'>🏠</span>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Direcciones</p>
                      <p className='text-2xl font-semibold text-gray-900'>
                        {currentUser.shopifyData?.addresses.length || 0}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <div className='flex items-center'>
                    <div className='rounded-lg bg-orange-100 p-2'>
                      <span className='text-xl text-orange-600'>🔑</span>
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-600'>Permisos</p>
                      <p className='text-2xl font-semibold text-gray-900'>
                        {currentUser.permissions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='lg:col-span-1'>
                <div className='rounded-lg bg-white p-6 shadow-sm'>
                  <h3 className='mb-4 text-lg font-medium text-gray-900'>Acciones Rápidas</h3>
                  <div className='space-y-3'>
                    <button
                      onClick={() => setActiveSection('profile')}
                      className='flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
                    >
                      <div className='flex items-center'>
                        <span className='mr-3 text-blue-600'>👤</span>
                        <span className='text-sm font-medium'>Editar Perfil</span>
                      </div>
                      <span className='text-gray-400'>→</span>
                    </button>

                    <button
                      onClick={handleLoadOrders}
                      className='flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
                    >
                      <div className='flex items-center'>
                        <span className='mr-3 text-green-600'>📦</span>
                        <span className='text-sm font-medium'>Ver Órdenes</span>
                      </div>
                      <span className='text-gray-400'>→</span>
                    </button>

                    {hasPermission('manage_users') && (
                      <button
                        onClick={() => setActiveSection('admin')}
                        className='flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50'
                      >
                        <div className='flex items-center'>
                          <span className='mr-3 text-purple-600'>⚙️</span>
                          <span className='text-sm font-medium'>Administración</span>
                        </div>
                        <span className='text-gray-400'>→</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && <EnhancedUserProfile />}

          {/* Orders Section */}
          {activeSection === 'orders' && (
            <div className='rounded-lg bg-white p-6 shadow-md'>
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>Mis Órdenes</h2>
                <button
                  onClick={() => refetchOrders()}
                  disabled={ordersLoading}
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
                >
                  {ordersLoading ? 'Cargando...' : 'Actualizar'}
                </button>
              </div>

              {selectedOrderId && orderDetail ? (
                <div>
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className='mb-4 text-blue-600 hover:text-blue-800'
                  >
                    ← Volver a la lista
                  </button>
                  <div className='rounded-lg bg-gray-50 p-4'>
                    <h3 className='font-semibold'>Orden {orderDetail.data.name}</h3>
                    <p>Estado: {orderDetail.data.fulfillmentStatus}</p>
                    <p>
                      Total: {orderDetail.data.totalPrice.amount}{' '}
                      {orderDetail.data.totalPrice.currencyCode}
                    </p>
                    <p>Fecha: {new Date(orderDetail.data.processedAt).toLocaleDateString()}</p>

                    {orderDetail.data.lineItems?.edges?.length > 0 && (
                      <div className='mt-4'>
                        <h4 className='mb-2 font-medium'>Productos:</h4>
                        <div className='space-y-2'>
                          {orderDetail.data.lineItems.edges.map(({ node }: any) => (
                            <div key={node.id} className='text-sm'>
                              {node.quantity}x {node.title} - {node.price.amount}{' '}
                              {node.price.currencyCode}
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
                    <div className='space-y-3'>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className='h-16 animate-pulse rounded bg-gray-200'></div>
                      ))}
                    </div>
                  ) : orders.length > 0 ? (
                    <div className='space-y-3'>
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className='rounded-lg border border-gray-200 p-4 hover:bg-gray-50'
                        >
                          <div className='flex items-start justify-between'>
                            <div>
                              <h3 className='font-medium'>{order.name}</h3>
                              <p className='text-sm text-gray-600'>
                                {order.fulfillmentStatus} •{' '}
                                {new Date(order.processedAt).toLocaleDateString()}
                              </p>
                              <p className='mt-1 text-sm font-medium'>
                                {order.totalPrice.amount} {order.totalPrice.currencyCode}
                              </p>
                              <button
                                onClick={() => handleViewOrderDetails(order.id)}
                                className='mt-1 rounded bg-blue-100 px-2 py-1 text-xs text-blue-700 hover:bg-blue-200'
                              >
                                Ver detalles
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='py-8 text-center'>
                      <span className='text-6xl'>📦</span>
                      <h3 className='mt-4 text-lg font-medium text-gray-900'>No hay órdenes</h3>
                      <p className='mt-2 text-gray-600'>Aún no tienes órdenes en tu cuenta</p>
                      <button
                        onClick={() => refetchOrders()}
                        className='mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
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
            <Guard.Permission
              permission='manage_users'
              fallback={
                <div className='rounded-lg bg-white p-6 shadow-md'>
                  <div className='py-8 text-center'>
                    <span className='text-6xl'>🔒</span>
                    <h2 className='mt-4 text-xl font-semibold text-gray-800'>Acceso Restringido</h2>
                    <p className='mt-2 text-gray-600'>
                      No tienes permisos para acceder al panel de administración
                    </p>
                  </div>
                </div>
              }
            >
              <UserManagementAdmin />
              <RolePermissionsGuide />
            </Guard.Permission>
          )}
        </div>
      </div>
    </div>
  )
}

export default function IntegratedDashboard() {
  return (
    <Guard.Auth>
      <DashboardContent />
    </Guard.Auth>
  )
}
