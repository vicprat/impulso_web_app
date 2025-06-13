
'use client';

import { useState } from 'react';

export function RolePermissionsGuide() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Definición de roles y permisos basada en el seed
  const rolesDefinition = {
    customer: {
      name: 'Cliente',
      description: 'Cliente básico del sistema',
      color: 'blue',
      level: 1,
      permissions: [
        'view_profile',
        'update_profile', 
        'view_orders',
        'create_orders',
        'cancel_orders',
        'view_addresses',
        'manage_addresses',
        'manage_cart',
        'view_products'
      ],
      features: [
        'Gestión de perfil personal',
        'Realizar y ver sus compras',
        'Gestionar direcciones de envío',
        'Administrar carrito de compras',
        'Navegar catálogo de productos'
      ]
    },
    vip_customer: {
      name: 'Cliente VIP',
      description: 'Cliente VIP con beneficios adicionales',
      color: 'purple',
      level: 2,
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
        'view_analytics'
      ],
      features: [
        'Todas las funciones de Cliente',
        'Acceso a analíticas personales',
        'Beneficios y descuentos especiales',
        'Soporte prioritario'
      ]
    },
    support: {
      name: 'Soporte',
      description: 'Personal de soporte al cliente',
      color: 'green',
      level: 3,
      permissions: [
        'view_profile',
        'view_all_orders',
        'manage_all_orders',
        'view_addresses',
        'view_products',
        'view_logs'
      ],
      features: [
        'Ver y gestionar órdenes de clientes',
        'Acceso a información de direcciones',
        'Consultar logs del sistema',
        'Asistir a todos los usuarios'
      ]
    },
    manager: {
      name: 'Gerente',
      description: 'Gerente con acceso amplio al sistema',
      color: 'orange',
      level: 4,
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
        'export_data'
      ],
      features: [
        'Panel de administración',
        'Gestión completa de órdenes',
        'Administración de productos e inventario',
        'Acceso a analíticas del negocio',
        'Exportación de datos',
        'Supervisión de equipo de soporte'
      ]
    },
    admin: {
      name: 'Administrador',
      description: 'Administrador con acceso completo',
      color: 'red',
      level: 5,
      permissions: [
        'Todos los permisos del sistema'
      ],
      features: [
        'Acceso completo al sistema',
        'Gestión de usuarios y roles',
        'Configuración del sistema',
        'Todas las funciones administrativas',
        'Control total de permisos'
      ]
    }
  };

  const permissionsDetail = {
    // Permisos de cuenta de usuario
    'view_profile': { name: 'Ver Perfil', category: 'Perfil', description: 'Ver información del perfil de usuario' },
    'update_profile': { name: 'Actualizar Perfil', category: 'Perfil', description: 'Modificar información personal' },
    'view_orders': { name: 'Ver Órdenes', category: 'Órdenes', description: 'Ver órdenes propias' },
    'create_orders': { name: 'Crear Órdenes', category: 'Órdenes', description: 'Realizar nuevas compras' },
    'cancel_orders': { name: 'Cancelar Órdenes', category: 'Órdenes', description: 'Cancelar órdenes propias' },
    
    // Permisos de direcciones
    'view_addresses': { name: 'Ver Direcciones', category: 'Direcciones', description: 'Ver direcciones guardadas' },
    'manage_addresses': { name: 'Gestionar Direcciones', category: 'Direcciones', description: 'Crear, editar y eliminar direcciones' },
    
    // Permisos de carrito
    'manage_cart': { name: 'Gestionar Carrito', category: 'Carrito', description: 'Administrar carrito de compras' },
    
    // Permisos administrativos
    'access_admin': { name: 'Acceder Admin', category: 'Administración', description: 'Acceso al panel administrativo' },
    'manage_users': { name: 'Gestionar Usuarios', category: 'Administración', description: 'Administrar usuarios del sistema' },
    'manage_roles': { name: 'Gestionar Roles', category: 'Administración', description: 'Administrar roles y permisos' },
    'view_all_orders': { name: 'Ver Todas las Órdenes', category: 'Órdenes', description: 'Ver órdenes de todos los usuarios' },
    'manage_all_orders': { name: 'Gestionar Todas las Órdenes', category: 'Órdenes', description: 'Modificar órdenes de cualquier usuario' },
    'view_analytics': { name: 'Ver Analíticas', category: 'Analíticas', description: 'Acceso a reportes y estadísticas' },
    
    // Permisos de productos
    'view_products': { name: 'Ver Productos', category: 'Productos', description: 'Ver catálogo de productos' },
    'manage_products': { name: 'Gestionar Productos', category: 'Productos', description: 'Crear, editar y eliminar productos' },
    'manage_inventory': { name: 'Gestionar Inventario', category: 'Inventario', description: 'Administrar stock y inventario' },
    
    // Permisos especiales
    'export_data': { name: 'Exportar Datos', category: 'Sistema', description: 'Exportar información del sistema' },
    'view_logs': { name: 'Ver Logs', category: 'Sistema', description: 'Acceso a logs del sistema' }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Función para verificar si un rol tiene un permiso específico
  const hasPermission = (roleId: string, permission: string): boolean => {
    if (roleId === 'admin') return true;
    return rolesDefinition[roleId as keyof typeof rolesDefinition]?.permissions.includes(permission) || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Guía de Roles y Permisos</h1>
        <p className="text-gray-600">Sistema jerárquico de roles con permisos específicos</p>
      </div>

      {/* Vista de roles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de roles */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Jerarquía de Roles</h2>
            <div className="space-y-3">
              {Object.entries(rolesDefinition).map(([roleId, role]) => (
                <button
                  key={roleId}
                  onClick={() => setSelectedRole(roleId)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedRole === roleId 
                      ? getColorClasses(role.color)
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm opacity-75">Nivel {role.level}</div>
                    </div>
                    <div className="text-2xl">
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
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`p-3 rounded-lg ${getColorClasses(rolesDefinition[selectedRole].color)}`}>
                  <span className="text-2xl">
                    {selectedRole === 'customer' && '👤'}
                    {selectedRole === 'vip_customer' && '⭐'}
                    {selectedRole === 'support' && '🎧'}
                    {selectedRole === 'manager' && '👔'}
                    {selectedRole === 'admin' && '👑'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{rolesDefinition[selectedRole].name}</h2>
                  <p className="text-gray-600">{rolesDefinition[selectedRole].description}</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${getColorClasses(rolesDefinition[selectedRole].color)}`}>
                    Nivel {rolesDefinition[selectedRole].level}
                  </span>
                </div>
              </div>

              {/* Características principales */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Características Principales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rolesDefinition[selectedRole].features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Permisos específicos */}
              <div>
                <h3 className="text-lg font-medium mb-3">Permisos Específicos</h3>
                {selectedRole === 'admin' ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">🔓</span>
                      <span className="font-medium text-red-800">Acceso Total</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      Los administradores tienen acceso a todos los permisos del sistema
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {rolesDefinition[selectedRole].permissions.map((permission) => {
                      const permDetail = permissionsDetail[permission];
                      if (!permDetail) return null;
                      
                      return (
                        <div key={permission} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium text-sm">{permDetail.name}</span>
                            <span className="text-xs text-gray-500 ml-2">({permDetail.category})</span>
                          </div>
                          <span className="text-xs text-gray-600">{permission}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="text-center py-12">
                <span className="text-6xl">📋</span>
                <h3 className="text-lg font-medium text-gray-900 mt-4">Selecciona un Rol</h3>
                <p className="text-gray-600 mt-2">Haz clic en un rol para ver sus detalles y permisos</p>
              </div>
            </div>
          )}
        </div>
      </div>


        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Matriz de Permisos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permiso
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    VIP
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soporte
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gerente
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(permissionsDetail).map(([permissionId, permission]) => (
                  <tr key={permissionId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {hasPermission('customer', permissionId) ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {hasPermission('vip_customer', permissionId) ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {hasPermission('support', permissionId) ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {hasPermission('manager', permissionId) ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <span className="text-gray-300">✗</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-green-600">✓</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      {/* Información adicional */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Información Importante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Jerarquía de Roles</h3>
            <p className="text-sm text-gray-600 mb-3">
              Los roles siguen una estructura jerárquica donde los niveles superiores 
              incluyen los permisos de los niveles inferiores.
            </p>
            <div className="space-y-1 text-xs">
              <div>1. Cliente - Funciones básicas</div>
              <div>2. Cliente VIP - Cliente + beneficios</div>
              <div>3. Soporte - Asistencia al cliente</div>
              <div>4. Gerente - Administración amplia</div>
              <div>5. Admin - Control total</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Gestión de Permisos</h3>
            <p className="text-sm text-gray-600 mb-3">
              Solo los administradores pueden modificar roles y permisos. 
              Los gerentes pueden ver esta información para supervisión.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⚠️</span>
                <span className="text-xs font-medium text-yellow-800">
                  Los cambios en permisos requieren reinicio de sesión
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}