import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupFirstAdmin() {
  console.log('👤 Configurando primer administrador...');
  
  const shopifyCustomerId = process.argv[2];
  const email = process.argv[3];
  
  if (!shopifyCustomerId || !email) {
    console.error('❌ Uso: npm run setup-admin <shopify_customer_id> <email>');
    console.error('   Ejemplo: npm run setup-admin "gid://shopify/Customer/123456" "admin@mitienda.com"');
    process.exit(1);
  }

  try {
    // Crear o actualizar usuario
    const user = await prisma.user.upsert({
      where: { shopifyCustomerId },
      update: {
        email,
        isActive: true,
      },
      create: {
        shopifyCustomerId,
        email,
        firstName: 'Administrador',
        lastName: 'Sistema',
        isActive: true,
      },
    });

    // Obtener rol de admin
    const adminRole = await prisma.role.findUnique({
      where: { name: 'admin' },
    });

    if (!adminRole) {
      console.error('❌ Rol de admin no encontrado. Ejecuta primero: npm run seed');
      process.exit(1);
    }

    // Asignar rol de admin
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: adminRole.id,
        assignedBy: 'system',
      },
    });

    console.log(`✅ Usuario administrador configurado exitosamente:`);
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Shopify Customer ID: ${user.shopifyCustomerId}`);
    console.log(`   - Rol: admin`);
    
  } catch (error) {
    console.error('❌ Error configurando administrador:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  setupFirstAdmin();
}