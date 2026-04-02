

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ROLES_WITH_PERMISSION = [
  'vip_customer',
  'artist',
  'employee',
  'provider',
  'partner',
  'support',
  'manager',
  'admin',
]

async function addViewPrivateRoomsPermission() {
  console.log('🔧 Iniciando actualización de permisos...\n')

  try {

    const permission = await prisma.permission.findUnique({
      where: { name: 'view_private_rooms' },
    })

    if (!permission) {
      console.error('❌ Error: El permiso "view_private_rooms" no existe en la base de datos.')
      console.log('   Ejecuta el seed primero: npx prisma db seed')
      process.exit(1)
    }

    console.log(`✅ Permiso encontrado: ${permission.name} (${permission.id})\n`)

    for (const roleName of ROLES_WITH_PERMISSION) {
      console.log(`📋 Procesando rol: ${roleName}`)

      const role = await prisma.role.findUnique({
        where: { name: roleName },
      })

      if (!role) {
        console.log(`   ⚠️  Rol "${roleName}" no existe en la base de datos. Saltando...\n`)
        continue
      }

      const existingRolePermission = await prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            permissionId: permission.id,
            roleId: role.id,
          },
        },
      })

      if (existingRolePermission) {
        console.log(`   ✓ El rol ya tiene el permiso asignado\n`)
        continue
      }

      await prisma.rolePermission.create({
        data: {
          permissionId: permission.id,
          roleId: role.id,
        },
      })

      console.log(`   ✅ Permiso agregado exitosamente\n`)
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 RESUMEN DE PERMISOS\n')

    for (const roleName of ROLES_WITH_PERMISSION) {
      const role = await prisma.role.findUnique({
        include: {
          permissions: {
            include: {
              permission: true,
            },
            where: {
              permissionId: permission.id,
            },
          },
        },
        where: { name: roleName },
      })

      if (role && role.permissions.length > 0) {
        console.log(`✅ ${roleName.padEnd(15)} → tiene view_private_rooms`)
      } else if (role) {
        console.log(`❌ ${roleName.padEnd(15)} → NO tiene view_private_rooms`)
      }
    }

    console.log('\n✅ Actualización de permisos completada exitosamente!')
  } catch (error) {
    console.error('❌ Error durante la actualización de permisos:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

addViewPrivateRoomsPermission()
