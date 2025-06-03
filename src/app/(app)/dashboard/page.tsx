'use client';

import { AuthGuard } from '@/components/Auth/AuthGuard';
import { PermissionGuard } from '@/components/Auth/PermissionGuard';
import { UserProfile } from '@/components/Auth/UserProfile';
import { useCustomerAccount } from '@/modules/auth/hooks/useCustomerAccount';
import { CustomerOrder } from '@/modules/auth/types';
import { useState, useEffect } from 'react';

function DashboardContent() {
  const { getOrders, isLoading } = useCustomerAccount();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        const customerOrders = await getOrders();
        setOrders(customerOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setOrdersLoading(false);
      }
    };

    loadOrders();
  }, [getOrders]);

  if (isLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 w-48 rounded"></div>
          <div className="bg-gray-200 h-6 w-32 rounded"></div>
          <div className="bg-gray-200 h-16 w-full rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Sección principal del dashboard */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Perfil del usuario */}
          <div className="lg:col-span-1">
            <UserProfile />
          </div>
          
          {/* Órdenes recientes */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Órdenes Recientes</h2>
              
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order: CustomerOrder) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{order.name}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.processedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {order.totalPrice.amount} {order.totalPrice.currencyCode}
                          </p>
                          <p className="text-sm text-gray-600">
                            {order.fulfillmentStatus}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No tienes órdenes recientes.</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Sección de administración (solo para admins) */}
        <PermissionGuard 
          permission="access_admin"
          fallback={null}
        >
          <div className="mt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-4">
                Panel de Administración
              </h2>
              <p className="text-yellow-700">
                Como administrador, tienes acceso a funciones especiales del sistema.
              </p>
              <button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg">
                Ir al Panel de Admin
              </button>
            </div>
          </div>
        </PermissionGuard>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}