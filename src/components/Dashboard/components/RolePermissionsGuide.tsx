'use client'

import { useState } from 'react'

export function RolePermissionsGuide() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  // Definición de roles y permisos basada en el seed
  const rolesDefinition = {
    admin: {
      color: 'red',
      description: 'Administrador con acceso completo',
      features: [
        'Acceso completo al sistema',
        'Gestión de usuarios y roles',
        'Configuración del sistema',
        'Todas las funciones administrativas',
        'Control total de permisos',
      ],
      level: 5,
      name: 'Administrador',
      permissions: ['Todos los permisos del sistema'],
    },
    customer: {
      color: 'blue',
      description: 'Cliente básico del sistema',
      features: [
        'Gestión de perfil personal',
        'Realizar y ver sus compras',
        'Gestionar direcciones de envío',
        'Administrar carrito de compras',
        'Navegar catálogo de productos',
      ],
      level: 1,
      name: 'Cliente',
      permissions: [
        'view_profile',
        'update_profile',
        'view_orders',
        'create_orders',
        'cancel_orders',
        'view_addresses',
        'manage_addresses',
        'manage_cart',
        'view_products',
      ],
    },
    manager: {
      color: 'orange',
      description: 'Gerente con acceso amplio al sistema',
      features: [
        'Panel de administración',
        'Gestión completa de órdenes',
        'Administración de productos e inventario',
        'Acceso a analíticas del negocio',
        'Exportación de datos',
        'Supervisión de equipo de soporte',
      ],
      level: 4,
      name: 'Gerente',
      permissions: [
        'access_admin',
        'view_profile',
        'update_profile',
        'view_all_orders',
        'manage_all_orders',
        'view_addresses',
        'manage_addresses',
        'view_products',
        'manage_products',
        'manage_inventory',
        'view_analytics',
        'view_logs',
        'export_data',
      ],
    },
    support: {
      color: 'green',
      description: 'Personal de soporte al cliente',
      features: [
        'Ver y gestionar órdenes de clientes',
        'Acceso a información de direcciones',
        'Consultar logs del sistema',
        'Asistir a todos los usuarios',
      ],
      level: 3,
      name: 'Soporte',
      permissions: [
        'view_profile',
        'view_all_orders',
        'manage_all_orders',
        'view_addresses',
        'view_products',
        'view_logs',
      ],
    },
    vip_customer: {
      color: 'purple',
      description: 'Cliente VIP con beneficios adicionales',
      features: [
        'Todas las funciones de Cliente',
        'Acceso a analíticas personales',
        'Beneficios y descuentos especiales',
        'Soporte prioritario',
      ],
      level: 2,
      name: 'Cliente VIP',
      permissions: [
        'view_profile',
        'update_profile',
        'view_orders',
        'create_orders',
        'cancel_orders',
        'view_addresses',
        'manage_addresses',
        'manage_cart',
        'view_products',
        'view_analytics',
      ],
    },
  }

  const permissionsDetail = {
    // Permisos administrativos
    access_admin: {
      category: 'Administración',
      description: 'Acceso al panel administrativo',
      name: 'Acceder Admin',
    },

    cancel_orders: {
      category: 'Órdenes',
      description: 'Cancelar órdenes propias',
      name: 'Cancelar Órdenes',
    },

    create_orders: {
      category: 'Órdenes',
      description: 'Realizar nuevas compras',
      name: 'Crear Órdenes',
    },

    // Permisos especiales
    export_data: {
      category: 'Sistema',
      description: 'Exportar información del sistema',
      name: 'Exportar Datos',
    },

    manage_addresses: {
      category: 'Direcciones',
      description: 'Crear, editar y eliminar direcciones',
      name: 'Gestionar Direcciones',
    },

    manage_all_orders: {
      category: 'Órdenes',
      description: 'Modificar órdenes de cualquier usuario',
      name: 'Gestionar Todas las Órdenes',
    },

    // Permisos de carrito
    manage_cart: {
      category: 'Carrito',
      description: 'Administrar carrito de compras',
      name: 'Gestionar Carrito',
    },

    manage_inventory: {
      category: 'Inventario',
      description: 'Administrar stock y inventario',
      name: 'Gestionar Inventario',
    },

    manage_products: {
      category: 'Productos',
      description: 'Crear, editar y eliminar productos',
      name: 'Gestionar Productos',
    },

    manage_roles: {
      category: 'Administración',
      description: 'Administrar roles y permisos',
      name: 'Gestionar Roles',
    },

    manage_users: {
      category: 'Administración',
      description: 'Administrar usuarios del sistema',
      name: 'Gestionar Usuarios',
    },

    update_profile: {
      category: 'Perfil',
      description: 'Modificar información personal',
      name: 'Actualizar Perfil',
    },

    // Permisos de direcciones
    view_addresses: {
      category: 'Direcciones',
      description: 'Ver direcciones guardadas',
      name: 'Ver Direcciones',
    },

    view_all_orders: {
      category: 'Órdenes',
      description: 'Ver órdenes de todos los usuarios',
      name: 'Ver Todas las Órdenes',
    },

    view_analytics: {
      category: 'Analíticas',
      description: 'Acceso a reportes y estadísticas',
      name: 'Ver Analíticas',
    },

    view_logs: { category: 'Sistema', description: 'Acceso a logs del sistema', name: 'Ver Logs' },

    view_orders: { category: 'Órdenes', description: 'Ver órdenes propias', name: 'Ver Órdenes' },

    // Permisos de productos
    view_products: {
      category: 'Productos',
      description: 'Ver catálogo de productos',
      name: 'Ver Productos',
    },

    // Permisos de cuenta de usuario
    view_profile: {
      category: 'Perfil',
      description: 'Ver información del perfil de usuario',
      name: 'Ver Perfil',
    },
  }

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  // Función para verificar si un rol tiene un permiso específico
  const hasPermission = (roleId: string, permission: string): boolean => {
    if (roleId === 'admin') return true
    return (
      rolesDefinition[roleId as keyof typeof rolesDefinition]?.permissions.includes(permission) ||
      false
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>Guía de Roles y Permisos</h1>
        <p className='text-gray-600'>Sistema jerárquico de roles con permisos específicos</p>
      </div>

      {/* Vista de roles */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Lista de roles */}
        <div className='lg:col-span-1'>
          <div className='rounded-lg bg-white p-6 shadow-md'>
            <h2 className='mb-4 text-lg font-semibold'>Jerarquía de Roles</h2>
            <div className='space-y-3'>
              {Object.entries(rolesDefinition).map(([roleId, role]) => (
                <button
                  key={roleId}
                  onClick={() => setSelectedRole(roleId)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedRole === roleId
                      ? getColorClasses(role.color)
                      : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='font-medium'>{role.name}</div>
                      <div className='text-sm opacity-75'>Nivel {role.level}</div>
                    </div>
                    <div className='text-2xl'>
                      {roleId === 'customer' && '👤'}
                      {roleId === 'vip_customer' && '⭐'}
                      {roleId === 'support' && '🎧'}
                      {roleId === 'manager' && '👔'}
                      {roleId === 'admin' && '👑'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles del rol seleccionado */}
        <div className='lg:col-span-2'>
          {selectedRole ? (
            <div className='rounded-lg bg-white p-6 shadow-md'>
              <div className='mb-6 flex items-center space-x-4'>
                <div
                  className={`rounded-lg p-3 ${getColorClasses(rolesDefinition[selectedRole].color)}`}
                >
                  <span className='text-2xl'>
                    {selectedRole === 'customer' && '👤'}
                    {selectedRole === 'vip_customer' && '⭐'}
                    {selectedRole === 'support' && '🎧'}
                    {selectedRole === 'manager' && '👔'}
                    {selectedRole === 'admin' && '👑'}
                  </span>
                </div>
                <div>
                  <h2 className='text-xl font-semibold'>{rolesDefinition[selectedRole].name}</h2>
                  <p className='text-gray-600'>{rolesDefinition[selectedRole].description}</p>
                  <span
                    className={`mt-2 inline-block rounded px-2 py-1 text-xs font-medium ${getColorClasses(rolesDefinition[selectedRole].color)}`}
                  >
                    Nivel {rolesDefinition[selectedRole].level}
                  </span>
                </div>
              </div>

              {/* Características principales */}
              <div className='mb-6'>
                <h3 className='mb-3 text-lg font-medium'>Características Principales</h3>
                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {rolesDefinition[selectedRole].features.map((feature, index) => (
                    <div key={index} className='flex items-start space-x-2'>
                      <span className='mt-0.5 text-green-500'>✓</span>
                      <span className='text-sm'>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permisos específicos */}
              <div>
                <h3 className='mb-3 text-lg font-medium'>Permisos Específicos</h3>
                {selectedRole === 'admin' ? (
                  <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-red-600'>🔓</span>
                      <span className='font-medium text-red-800'>Acceso Total</span>
                    </div>
                    <p className='mt-1 text-sm text-red-700'>
                      Los administradores tienen acceso a todos los permisos del sistema
                    </p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {rolesDefinition[selectedRole].permissions.map((permission) => {
                      const permDetail = permissionsDetail[permission]
                      if (!permDetail) return null

                      return (
                        <div
                          key={permission}
                          className='flex items-center justify-between rounded bg-gray-50 p-2'
                        >
                          <div>
                            <span className='text-sm font-medium'>{permDetail.name}</span>
                            <span className='ml-2 text-xs text-gray-500'>
                              ({permDetail.category})
                            </span>
                          </div>
                          <span className='text-xs text-gray-600'>{permission}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='rounded-lg bg-white p-6 shadow-md'>
              <div className='py-12 text-center'>
                <span className='text-6xl'>📋</span>
                <h3 className='mt-4 text-lg font-medium text-gray-900'>Selecciona un Rol</h3>
                <p className='mt-2 text-gray-600'>
                  Haz clic en un rol para ver sus detalles y permisos
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-lg font-semibold'>Matriz de Permisos</h2>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Permiso
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Cliente
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                  VIP
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Soporte
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Gerente
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500'>
                  Admin
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {Object.entries(permissionsDetail).map(([permissionId, permission]) => (
                <tr key={permissionId}>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>{permission.name}</div>
                      <div className='text-xs text-gray-500'>{permission.category}</div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-center'>
                    {hasPermission('customer', permissionId) ? (
                      <span className='text-green-600'>✓</span>
                    ) : (
                      <span className='text-gray-300'>✗</span>
                    )}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-center'>
                    {hasPermission('vip_customer', permissionId) ? (
                      <span className='text-green-600'>✓</span>
                    ) : (
                      <span className='text-gray-300'>✗</span>
                    )}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-center'>
                    {hasPermission('support', permissionId) ? (
                      <span className='text-green-600'>✓</span>
                    ) : (
                      <span className='text-gray-300'>✗</span>
                    )}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-center'>
                    {hasPermission('manager', permissionId) ? (
                      <span className='text-green-600'>✓</span>
                    ) : (
                      <span className='text-gray-300'>✗</span>
                    )}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-center'>
                    <span className='text-green-600'>✓</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      <div className='rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 text-lg font-semibold'>Información Importante</h2>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          <div>
            <h3 className='mb-2 font-medium text-gray-900'>Jerarquía de Roles</h3>
            <p className='mb-3 text-sm text-gray-600'>
              Los roles siguen una estructura jerárquica donde los niveles superiores incluyen los
              permisos de los niveles inferiores.
            </p>
            <div className='space-y-1 text-xs'>
              <div>1. Cliente - Funciones básicas</div>
              <div>2. Cliente VIP - Cliente + beneficios</div>
              <div>3. Soporte - Asistencia al cliente</div>
              <div>4. Gerente - Administración amplia</div>
              <div>5. Admin - Control total</div>
            </div>
          </div>
          <div>
            <h3 className='mb-2 font-medium text-gray-900'>Gestión de Permisos</h3>
            <p className='mb-3 text-sm text-gray-600'>
              Solo los administradores pueden modificar roles y permisos. Los gerentes pueden ver
              esta información para supervisión.
            </p>
            <div className='rounded border border-yellow-200 bg-yellow-50 p-3'>
              <div className='flex items-center space-x-2'>
                <span className='text-yellow-600'>⚠️</span>
                <span className='text-xs font-medium text-yellow-800'>
                  Los cambios en permisos requieren reinicio de sesión
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
