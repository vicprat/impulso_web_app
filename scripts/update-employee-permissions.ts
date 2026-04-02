import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateEmployeePermissions() {
  console.log('🔧 Actualizando permisos del rol employee...')

  try {

    const employeeRole = await prisma.role.findUnique({
      where: { name: 'employee' },
    })

    if (!employeeRole) {
      throw new Error('Rol employee no encontrado')
    }

    const viewFinancialEntriesPermission = await prisma.permission.findUnique({
      where: { name: 'view_financial_entries' },
    })

    const blogPermissions = await prisma.permission.findMany({
      where: {
        name: {
          in: ['manage_own_blog_posts', 'manage_all_blog_posts'],
        },
      },
    })

    if (viewFinancialEntriesPermission) {

      await prisma.rolePermission.deleteMany({
        where: {
          permissionId: viewFinancialEntriesPermission.id,
          roleId: employeeRole.id,
        },
      })
      console.log('✅ Permiso view_financial_entries removido del rol employee')
    }

    for (const blogPermission of blogPermissions) {
      await prisma.rolePermission.upsert({
        create: {
          permissionId: blogPermission.id,
          roleId: employeeRole.id,
        },
        update: {},
        where: {
          roleId_permissionId: {
            permissionId: blogPermission.id,
            roleId: employeeRole.id,
          },
        },
      })
      console.log(`✅ Permiso ${blogPermission.name} agregado al rol employee`)
    }

    const currentPermissions = await prisma.rolePermission.findMany({
      include: { permission: true },
      where: { roleId: employeeRole.id },
    })

    console.log('\n📋 Permisos actuales del rol employee:')
    currentPermissions.forEach(({ permission }) => {
      console.log(`   - ${permission.name}: ${permission.description}`)
    })

    console.log('\n✅ Actualización de permisos completada exitosamente!')
  } catch (error) {
    console.error('❌ Error actualizando permisos:', error)
    throw error
  }
}

updateEmployeePermissions()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error durante la actualización:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
