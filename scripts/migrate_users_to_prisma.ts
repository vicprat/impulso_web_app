const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const USERS_FILE = 'usuarios_woocommerce.json'

// Roles específicos de tu sistema (basados en tu seed)
const SYSTEM_ROLES = [
  {
    name: 'customer',
    description: 'Cliente básico del sistema',
    isActive: true,
  },
  {
    name: 'vip_customer',
    description: 'Cliente VIP con beneficios adicionales',
    isActive: true,
  },
  {
    name: 'collaborator',
    description: 'Colaborador que puede gestionar sus propias obras y finanzas',
    isActive: true,
  },
  {
    name: 'support',
    description: 'Personal de soporte al cliente',
    isActive: true,
  },
  {
    name: 'manager',
    description: 'Gerente con acceso amplio al sistema',
    isActive: true,
  },
  {
    name: 'admin',
    description: 'Administrador con acceso completo',
    isActive: true,
  },
]

async function createDefaultRoles() {
  console.log('🔧 Verificando roles del sistema...')

  for (const roleData of SYSTEM_ROLES) {
    try {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      })

      if (!existingRole) {
        await prisma.role.create({ data: roleData })
        console.log(`   ✅ Rol creado: ${roleData.name}`)
      } else {
        console.log(`   ⚠️  Rol ya existe: ${roleData.name}`)
      }
    } catch (error) {
      console.error(`   ❌ Error verificando rol ${roleData.name}:`, (error as Error).message)
    }
  }
}

async function deleteUserByEmail(email: string) {
  // Borra usuario y dependencias por email
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    // Borra dependencias
    await prisma.profile.deleteMany({ where: { userId: existingUser.id } })
    await prisma.links.deleteMany({ where: { userId: existingUser.id } })
    await prisma.userRole.deleteMany({ where: { userId: existingUser.id } })
    await prisma.activityLog.deleteMany({ where: { userId: existingUser.id } })
    // Borra usuario
    await prisma.user.delete({ where: { id: existingUser.id } })
    console.log(`     🗑️ Usuario y dependencias eliminados: ${email}`)
  }
}

interface UserData {
  user: any
  profile?: any
  links?: any[]
  roles: string[]
  original: any
}

async function migrateUser(userData: UserData, roles: any[]): Promise<any> {
  const { user: userInfo, profile: profileInfo, links: linksInfo, roles: userRoles } = userData

  try {
    // Eliminar usuario existente si lo hay
    await deleteUserByEmail(userInfo.email)

    // 1. Crear usuario
    const user = await prisma.user.create({
      data: {
        shopifyCustomerId: userInfo.shopifyCustomerId, // null hasta que hagan login con Shopify
        email: userInfo.email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        isActive: userInfo.isActive,
        createdAt: new Date(userInfo.createdAt),
        updatedAt: new Date(userInfo.updatedAt),
        lastLoginAt: userInfo.lastLoginAt ? new Date(userInfo.lastLoginAt) : null,
        isPublic: userInfo.isPublic,
      },
    })

    console.log(`   👤 Usuario creado: ${user.email}`)

    // 2. Crear perfil si hay datos
    if (
      profileInfo &&
      (profileInfo.description ||
        profileInfo.bio ||
        profileInfo.avatarUrl ||
        profileInfo.occupation)
    ) {
      await prisma.profile.create({
        data: {
          userId: user.id,
          occupation: profileInfo.occupation || null,
          description: profileInfo.description || null,
          bio: profileInfo.bio || null,
          avatarUrl: profileInfo.avatarUrl || null,
          backgroundImageUrl: profileInfo.backgroundImageUrl || null,
        },
      })
      console.log(`     📝 Perfil creado`)
    }

    // 3. Crear enlaces si existen
    if (linksInfo && linksInfo.length > 0) {
      for (const link of linksInfo) {
        await prisma.links.create({
          data: {
            userId: user.id,
            platform: link.platform,
            url: link.url,
            order: link.order,
            isPrimary: link.isPrimary,
          },
        })
      }
      console.log(`     🔗 ${linksInfo.length} enlaces creados`)
    }

    // 4. Asignar roles
    if (userRoles && userRoles.length > 0) {
      // Mapeo explícito de roles según tipo de usuario
      const ROLE_MAP = {
        artist: 'artist',
        employee: 'employee',
        provider: 'provider',
        partner: 'partner',
        customer: 'customer',
        vip_customer: 'vip_customer',
        support: 'support',
        manager: 'manager',
        admin: 'admin',
      }
      for (const roleName of userRoles) {
        // Normaliza y mapea el nombre del rol
        const mappedRole = ROLE_MAP[roleName.toLowerCase() as keyof typeof ROLE_MAP] || 'customer'
        const role = roles.find((r) => r.name.toLowerCase() === mappedRole)
        if (role) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: role.id,
              assignedAt: new Date(),
              assignedBy: null, // Sistema automático
            },
          })
        }
      }
      console.log(`     👑 Roles asignados: ${userRoles.join(', ')}`)
    }

    // 5. Crear log de actividad de migración
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'user_migrated',
        resource: 'user',
        metadata: {
          source: 'woocommerce',
          originalWpId: userData.original.wp_user_id,
          migrationDate: new Date().toISOString(),
          note: 'Migrado de WooCommerce - shopifyCustomerId se asignará al hacer login',
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Migration Script',
      },
    })

    return { success: true, userId: user.id, email: user.email }
  } catch (error: unknown) {
    const err = error as Error
    console.error(`   ❌ Error migrando usuario ${userInfo.email}:`, err.message)
    return { success: false, email: userInfo.email, error: err.message }
  }
}

async function main(): Promise<void> {
  try {
    console.log('🚀 Iniciando migración de usuarios de WooCommerce...\n')

    // Verificar que existe el archivo
    if (!fs.existsSync(USERS_FILE)) {
      throw new Error(
        `No se encontró el archivo ${USERS_FILE}. Ejecuta primero el script de extracción de Python.`
      )
    }

    // Leer datos de usuarios
    console.log(`📖 Leyendo datos de ${USERS_FILE}...`)
    const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'))
    console.log(`   📊 Total de usuarios a migrar: ${usersData.length}\n`)

    // Crear roles por defecto
    await createDefaultRoles()

    // Obtener roles existentes
    const roles: { name: string }[] = await prisma.role.findMany()
    console.log(`   📋 Roles disponibles: ${roles.map((r) => r.name).join(', ')}\n`)

    // Migrar usuarios
    console.log('👥 Migrando usuarios...')
    const results = []
    let successful = 0
    let failed = 0

    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i]
      console.log(`\n[${i + 1}/${usersData.length}] Migrando: ${userData.user.email}`)

      const result = await migrateUser(userData, roles)
      results.push(result)

      if (result.success) {
        successful++
      } else {
        failed++
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(50))
    console.log('📊 RESUMEN DE MIGRACIÓN')
    console.log('='.repeat(50))
    console.log(`✅ Usuarios migrados exitosamente: ${successful}`)
    console.log(`❌ Usuarios con errores: ${failed}`)
    console.log(`📁 Total procesados: ${usersData.length}`)

    if (failed > 0) {
      console.log('\n❌ ERRORES:')
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`   - ${r.email}: ${r.error}`)
        })
    }

    // Guardar reporte de migración
    const report = {
      migrationDate: new Date().toISOString(),
      totalUsers: usersData.length,
      successful,
      failed,
      results,
    }

    fs.writeFileSync('migration_report.json', JSON.stringify(report, null, 2))
    console.log('\n📄 Reporte guardado en: migration_report.json')
  } catch (error: unknown) {
    const err = error as Error
    console.error('💥 Error durante la migración:', err.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Desconectado de la base de datos.')
  }
}

// Función para verificar y limpiar datos duplicados (opcional)
async function cleanupDuplicates() {
  console.log('🧹 Verificando duplicados...')

  const duplicateEmails = await prisma.user.groupBy({
    by: ['email'],
    _count: {
      email: true,
    },
    having: {
      email: {
        _count: {
          gt: 1,
        },
      },
    },
  })

  if (duplicateEmails.length > 0) {
    console.log(`⚠️  Se encontraron ${duplicateEmails.length} emails duplicados:`)
    duplicateEmails.forEach((dup: any) => {
      console.log(`   - ${dup.email} (${dup._count.email} veces)`)
    })
  } else {
    console.log('✅ No se encontraron duplicados.')
  }
}

// Ejecutar migración
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 Migración completada!')
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error)
      process.exit(1)
    })
}

module.exports = {
  migrateUser,
  createDefaultRoles,
  cleanupDuplicates,
}
