import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear permisos básicos
  const permissions = [
    // Permisos de cuenta de usuario
    {
      action: 'read',
      description: 'Ver perfil de usuario',
      name: 'view_profile',
      resource: 'profile',
    },
    {
      action: 'update',
      description: 'Actualizar perfil de usuario',
      name: 'update_profile',
      resource: 'profile',
    },
    { action: 'read', description: 'Ver órdenes propias', name: 'view_orders', resource: 'orders' },
    { action: 'create', description: 'Crear órdenes', name: 'create_orders', resource: 'orders' },
    {
      action: 'update',
      description: 'Cancelar órdenes propias',
      name: 'cancel_orders',
      resource: 'orders',
    },

    // Permisos de direcciones
    {
      action: 'read',
      description: 'Ver direcciones propias',
      name: 'view_addresses',
      resource: 'addresses',
    },
    {
      action: 'crud',
      description: 'Gestionar direcciones propias',
      name: 'manage_addresses',
      resource: 'addresses',
    },

    // Permisos de carrito
    {
      action: 'crud',
      description: 'Gestionar carrito de compras',
      name: 'manage_cart',
      resource: 'cart',
    },

    // Permisos de administración
    {
      action: 'read',
      description: 'Acceder al panel de administración',
      name: 'access_admin',
      resource: 'admin',
    },
    {
      action: 'crud',
      description: 'Gestionar usuarios del sistema',
      name: 'manage_users',
      resource: 'users',
    },
    {
      action: 'crud',
      description: 'Gestionar roles y permisos',
      name: 'manage_roles',
      resource: 'roles',
    },
    {
      action: 'read_all',
      description: 'Ver todas las órdenes',
      name: 'view_all_orders',
      resource: 'orders',
    },
    {
      action: 'crud_all',
      description: 'Gestionar todas las órdenes',
      name: 'manage_all_orders',
      resource: 'orders',
    },
    {
      action: 'read',
      description: 'Ver analíticas y reportes',
      name: 'view_analytics',
      resource: 'analytics',
    },
    {
      action: 'crud',
      description: 'Gestionar eventos del sistema',
      name: 'manage_events',
      resource: 'events',
    },

    // Permisos de productos (si planeas permitir gestión)
    { action: 'read', description: 'Ver productos', name: 'view_products', resource: 'products' },
    {
      action: 'crud',
      description: 'Gestionar productos',
      name: 'manage_products',
      resource: 'products',
    },
    {
      action: 'crud',
      description: 'Gestionar inventario',
      name: 'manage_inventory',
      resource: 'inventory',
    },

    // Permisos de artistas (si planeas permitir gestión)
    {
      action: 'crud_own',
      description: 'Crear, editar y borrar sus propios productos',
      name: 'manage_own_products',
      resource: 'products',
    },
    {
      action: 'crud_own',
      description: 'Crear y editar sus propios artículos de blog',
      name: 'manage_own_blog_posts',
      resource: 'blog_posts',
    },
    {
      action: 'crud_all',
      description: 'Gestionar todos los artículos de blog',
      name: 'manage_all_blog_posts',
      resource: 'blog_posts',
    },

    // Permisos especiales
    {
      action: 'export',
      description: 'Exportar datos del sistema',
      name: 'export_data',
      resource: 'system',
    },
    { action: 'read', description: 'Ver logs del sistema', name: 'view_logs', resource: 'logs' },
    {
      action: 'crud',
      description: 'Gestionar private rooms',
      name: 'manage_private_rooms',
      resource: 'private_rooms',
    },
    {
      action: 'read',
      description: 'Ver private rooms',
      name: 'view_private_rooms',
      resource: 'private_rooms',
    },
  ]

  console.log('📝 Creando permisos...')
  for (const permission of permissions) {
    await prisma.permission.upsert({
      create: permission,
      update: permission,
      where: { name: permission.name },
    })
  }

  // Crear roles básicos
  const roles = [
    {
      description: 'Cliente básico del sistema',
      name: 'customer',
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
    {
      description: 'Cliente VIP con beneficios adicionales',
      name: 'vip_customer',
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
        'view_private_rooms',
      ],
    },
    {
      description: 'Colaborador que puede gestionar sus propias obras',
      name: 'artist',
      permissions: [
        'view_profile',
        'update_profile',
        'view_products',
        'manage_own_products',
        'manage_own_blog_posts',
      ],
    },
    {
      description: 'Personal de soporte al cliente',
      name: 'support',
      permissions: [
        'view_profile',
        'view_all_orders',
        'manage_all_orders',
        'view_addresses',
        'view_products',
        'view_logs',
      ],
    },
    {
      description: 'Gerente con acceso amplio al sistema',
      name: 'manager',
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
        'manage_own_blog_posts',
        'manage_own_products',
        'manage_private_rooms',
        'view_private_rooms',
        'manage_events',
      ],
    },
    {
      description: 'Administrador con acceso completo',
      name: 'admin',
      permissions: permissions.map((p) => p.name), // Todos los permisos
    },
  ]

  console.log('👑 Creando roles...')
  for (const roleData of roles) {
    const { permissions: rolePermissions, ...roleInfo } = roleData

    const role = await prisma.role.upsert({
      create: roleInfo,
      update: roleInfo,
      where: { name: roleInfo.name },
    })

    // Asignar permisos al rol
    console.log(`🔗 Asignando permisos al rol ${role.name}...`)
    for (const permissionName of rolePermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      })

      if (permission) {
        await prisma.rolePermission.upsert({
          create: {
            permissionId: permission.id,
            roleId: role.id,
          },
          update: {},
          where: {
            roleId_permissionId: {
              permissionId: permission.id,
              roleId: role.id,
            },
          },
        })
      }
    }
  }

  // Crear configuraciones de la aplicación
  const appConfigs = [
    { key: 'default_user_role', type: 'string', value: 'customer' },
    { key: 'auto_assign_vip_threshold', type: 'number', value: '1000' },
    { key: 'session_timeout_minutes', type: 'number', value: '60' },
    { key: 'enable_registration', type: 'boolean', value: 'true' },
    { key: 'require_email_verification', type: 'boolean', value: 'false' },
    { key: 'max_login_attempts', type: 'number', value: '5' },
    { key: 'lockout_duration_minutes', type: 'number', value: '15' },
  ]

  console.log('⚙️ Creando configuraciones de la aplicación...')
  for (const config of appConfigs) {
    await prisma.appConfig.upsert({
      create: config,
      update: { type: config.type, value: config.value },
      where: { key: config.key },
    })
  }

  console.log('✅ Seed completado exitosamente!')

  // Mostrar resumen
  const totalPermissions = await prisma.permission.count()
  const totalRoles = await prisma.role.count()
  const totalConfigs = await prisma.appConfig.count()

  console.log(`
📊 Resumen:
   - Permisos creados: ${totalPermissions}
   - Roles creados: ${totalRoles}
   - Configuraciones: ${totalConfigs}

🚀 Tu sistema de autenticación está listo!

📝 Próximos pasos:
   1. Ejecuta las migraciones: npx prisma migrate dev
   2. Reinicia tu aplicación: npm run dev
   3. Los nuevos usuarios se asignarán automáticamente como 'customer'
   4. Puedes promover usuarios a otros roles desde el panel de admin
  `)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
