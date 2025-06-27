import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear permisos básicos
  const permissions = [
    // Permisos de cuenta de usuario
    { name: 'view_profile', description: 'Ver perfil de usuario', resource: 'profile', action: 'read' },
    { name: 'update_profile', description: 'Actualizar perfil de usuario', resource: 'profile', action: 'update' },
    { name: 'view_orders', description: 'Ver órdenes propias', resource: 'orders', action: 'read' },
    { name: 'create_orders', description: 'Crear órdenes', resource: 'orders', action: 'create' },
    { name: 'cancel_orders', description: 'Cancelar órdenes propias', resource: 'orders', action: 'update' },
    
    // Permisos de direcciones
    { name: 'view_addresses', description: 'Ver direcciones propias', resource: 'addresses', action: 'read' },
    { name: 'manage_addresses', description: 'Gestionar direcciones propias', resource: 'addresses', action: 'crud' },
    
    // Permisos de carrito
    { name: 'manage_cart', description: 'Gestionar carrito de compras', resource: 'cart', action: 'crud' },
    
    // Permisos de administración
    { name: 'access_admin', description: 'Acceder al panel de administración', resource: 'admin', action: 'read' },
    { name: 'manage_users', description: 'Gestionar usuarios del sistema', resource: 'users', action: 'crud' },
    { name: 'manage_roles', description: 'Gestionar roles y permisos', resource: 'roles', action: 'crud' },
    { name: 'view_all_orders', description: 'Ver todas las órdenes', resource: 'orders', action: 'read_all' },
    { name: 'manage_all_orders', description: 'Gestionar todas las órdenes', resource: 'orders', action: 'crud_all' },
    { name: 'view_analytics', description: 'Ver analíticas y reportes', resource: 'analytics', action: 'read' },
    
    // Permisos de productos (si planeas permitir gestión)
    { name: 'view_products', description: 'Ver productos', resource: 'products', action: 'read' },
    { name: 'manage_products', description: 'Gestionar productos', resource: 'products', action: 'crud' },
    { name: 'manage_inventory', description: 'Gestionar inventario', resource: 'inventory', action: 'crud' },

    // Permisos de artistas (si planeas permitir gestión)
    { name: 'manage_own_products', description: 'Crear, editar y borrar sus propios productos', resource: 'products', action: 'crud_own' },
    { name: 'manage_own_blog_posts', description: 'Crear y editar sus propios artículos de blog', resource: 'blog_posts', action: 'crud_own' },
    { name: 'manage_all_blog_posts', description: 'Gestionar todos los artículos de blog', resource: 'blog_posts', action: 'crud_all' },


    // Permisos especiales
    { name: 'export_data', description: 'Exportar datos del sistema', resource: 'system', action: 'export' },
    { name: 'view_logs', description: 'Ver logs del sistema', resource: 'logs', action: 'read' },
    { name: 'manage_private_rooms', description: 'Gestionar private rooms', resource: 'private_rooms', action: 'crud' },
    { name: 'view_private_rooms', description: 'Ver private rooms', resource: 'private_rooms', action: 'read' },
  ];

  console.log('📝 Creando permisos...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }

  // Crear roles básicos
  const roles = [
    {
      name: 'customer',
      description: 'Cliente básico del sistema',
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
      name: 'vip_customer',
      description: 'Cliente VIP con beneficios adicionales',
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
        'view_private_rooms'
      ],
    },
    {
      name: 'artist',
      description: 'Colaborador que puede gestionar sus propias obras',
      permissions: [
        'view_profile',
        'update_profile',
        'view_products',
        'manage_own_products',
        'manage_own_blog_posts'
      ],
    },
    {
      name: 'support',
      description: 'Personal de soporte al cliente',
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
      name: 'manager',
      description: 'Gerente con acceso amplio al sistema',
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
      ],
    },
    {
      name: 'admin',
      description: 'Administrador con acceso completo',
      permissions: permissions.map(p => p.name), // Todos los permisos
    },
  ];

  console.log('👑 Creando roles...');
  for (const roleData of roles) {
    const { permissions: rolePermissions, ...roleInfo } = roleData;
    
    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      update: roleInfo,
      create: roleInfo,
    });

    // Asignar permisos al rol
    console.log(`🔗 Asignando permisos al rol ${role.name}...`);
    for (const permissionName of rolePermissions) {
      const permission = await prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }
  }

  // Crear configuraciones de la aplicación
  const appConfigs = [
    { key: 'default_user_role', value: 'customer', type: 'string' },
    { key: 'auto_assign_vip_threshold', value: '1000', type: 'number' },
    { key: 'session_timeout_minutes', value: '60', type: 'number' },
    { key: 'enable_registration', value: 'true', type: 'boolean' },
    { key: 'require_email_verification', value: 'false', type: 'boolean' },
    { key: 'max_login_attempts', value: '5', type: 'number' },
    { key: 'lockout_duration_minutes', value: '15', type: 'number' },
  ];

  console.log('⚙️ Creando configuraciones de la aplicación...');
  for (const config of appConfigs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, type: config.type },
      create: config,
    });
  }

  console.log('✅ Seed completado exitosamente!');
  
  // Mostrar resumen
  const totalPermissions = await prisma.permission.count();
  const totalRoles = await prisma.role.count();
  const totalConfigs = await prisma.appConfig.count();
  
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
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error durante el seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
