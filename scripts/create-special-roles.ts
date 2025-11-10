import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PERMISSIONS_TO_ENSURE = [
  {
    action: 'crud',
    description: 'Gestionar colecciones',
    name: 'manage_collections',
    resource: 'collections',
  },
]

interface RoleDefinition {
  description: string
  permissions: string[]
}

const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  content_editor: {
    description: 'Responsable de contenidos, colecciones y eventos',
    permissions: [
      'view_profile',
      'update_profile',
      'view_products',
      'manage_inventory',
      'manage_collections',
      'manage_events',
      'manage_all_blog_posts',
      'manage_own_blog_posts',
    ],
  },
  finance_manager: {
    description: 'Responsable de la operativa financiera y administrativa',
    permissions: [
      'view_profile',
      'update_profile',
      'access_admin',
      'view_analytics',
      'view_logs',
      'export_data',
      'manage_finance',
      'manage_bank_accounts',
      'manage_financial_entries',
      'view_financial_entries',
      'view_finance_reports',
      'view_acquired_tickets',
      'manage_private_rooms',
      'view_private_rooms',
      'manage_providers',
      'manage_employees',
      'manage_partners',
    ],
  },
  inventory_and_content_editor: {
    description: 'Gestiona inventario, colecciones, eventos y private rooms',
    permissions: [
      'view_profile',
      'update_profile',
      'view_products',
      'manage_inventory',
      'manage_collections',
      'manage_events',
      'manage_all_blog_posts',
      'manage_own_blog_posts',
      'manage_private_rooms',
      'view_private_rooms',
    ],
  },
}

interface TargetUser {
  email: string
  name: string
  role: keyof typeof ROLE_DEFINITIONS
}

const TARGET_USERS: TargetUser[] = [
  {
    email: '',
    name: 'Isai',
    role: 'finance_manager',
  },
  {
    email: 'danny_garciah@hotmail.com',
    name: 'Dany',
    role: 'content_editor',
  },
  {
    email: 'carjhunarodriguez@gmail.com',
    name: 'Arju',
    role: 'inventory_and_content_editor',
  },
]

async function ensurePermissions() {
  console.log('🔐 Asegurando permisos requeridos...')

  for (const permission of PERMISSIONS_TO_ENSURE) {
    await prisma.permission.upsert({
      create: permission,
      update: {
        action: permission.action,
        description: permission.description,
        resource: permission.resource,
      },
      where: { name: permission.name },
    })
    console.log(`   ✅ Permiso ${permission.name}`)
  }
}

async function ensureRole(name: string, config: RoleDefinition) {
  const role = await prisma.role.upsert({
    create: {
      description: config.description,
      name,
    },
    update: {
      description: config.description,
    },
    where: { name },
  })

  const permissions = await prisma.permission.findMany({
    where: { name: { in: config.permissions } },
  })

  const missingPermissions = config.permissions.filter(
    (permissionName) => !permissions.some((permission) => permission.name === permissionName)
  )

  if (missingPermissions.length > 0) {
    throw new Error(
      `Faltan permisos requeridos para el rol ${name}: ${missingPermissions.join(', ')}`
    )
  }

  for (const permission of permissions) {
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

  const rolePermissions = await prisma.rolePermission.findMany({
    include: { permission: true },
    where: { roleId: role.id },
  })

  for (const rolePermission of rolePermissions) {
    const shouldKeep = config.permissions.includes(rolePermission.permission.name)
    if (!shouldKeep) {
      await prisma.rolePermission.delete({ where: { id: rolePermission.id } })
    }
  }

  return role
}

async function ensureRoles() {
  console.log('👑 Creando o actualizando roles personalizados...')
  for (const [name, config] of Object.entries(ROLE_DEFINITIONS)) {
    await ensureRole(name, config)
    console.log(`   ✅ Rol ${name} listo`)
  }
}

async function assignRoleToUser(
  userEmail: string,
  roleName: keyof typeof ROLE_DEFINITIONS,
  name: string
) {
  const role = await prisma.role.findUnique({ where: { name: roleName } })

  if (!role) {
    throw new Error(`El rol ${roleName} no fue encontrado. Abortando asignación para ${userEmail}`)
  }

  await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      include: { UserRole: true },
      where: { email: userEmail },
    })

    if (existingUser) {
      await tx.userRole.deleteMany({ where: { userId: existingUser.id } })

      await tx.userRole.create({
        data: {
          assignedAt: new Date(),
          assignedBy: 'script:create-special-roles',
          roleId: role.id,
          userId: existingUser.id,
        },
      })

      await tx.user.update({
        data: {
          firstName: existingUser.firstName ?? name,
          isActive: true,
          roleId: role.id,
        },
        where: { id: existingUser.id },
      })

      console.log(`   🔄 Usuario ${userEmail} actualizado con rol ${roleName}`)
      return
    }

    await tx.user.create({
      data: {
        UserRole: {
          create: {
            assignedAt: new Date(),
            assignedBy: 'script:create-special-roles',
            roleId: role.id,
          },
        },
        email: userEmail,
        firstName: name,
        isActive: true,
        roleId: role.id,
      },
    })

    console.log(`   ✅ Usuario ${userEmail} creado con rol ${roleName}`)
  })
}

async function processUsers() {
  console.log('👥 Procesando usuarios objetivo...')

  for (const targetUser of TARGET_USERS) {
    if (!targetUser.email) {
      console.warn(
        `   ⚠️ Usuario ${targetUser.name} omitido: no se ha definido email. Actualiza el arreglo TARGET_USERS antes de ejecutar.`
      )
      continue
    }

    await assignRoleToUser(targetUser.email, targetUser.role, targetUser.name)
  }
}

async function main() {
  try {
    await ensurePermissions()
    await ensureRoles()
    await processUsers()
    console.log('✅ Script completado')
  } catch (error) {
    console.error('❌ Error durante la ejecución del script:', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

void main()
