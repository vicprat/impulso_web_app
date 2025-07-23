import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface UserWithoutShopifyId {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  createdAt: Date
  lastLoginAt?: Date | null
  isActive: boolean
}

async function findUsersWithoutShopifyId(): Promise<UserWithoutShopifyId[]> {
  console.log('🔍 Buscando usuarios sin shopifyCustomerId...')
  
  const users = await prisma.user.findMany({
    where: {
      shopifyCustomerId: null
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      createdAt: true,
      lastLoginAt: true,
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return users
}

async function getUsersWithShopifyId(): Promise<{ count: number }> {
  const count = await prisma.user.count({
    where: {
      shopifyCustomerId: {
        not: null
      }
    }
  })

  return { count }
}

async function getTotalUsers(): Promise<{ count: number }> {
  const count = await prisma.user.count()
  return { count }
}

async function generateReport(): Promise<void> {
  try {
    console.log('📊 Generando reporte de usuarios...\n')

    const usersWithoutShopifyId = await findUsersWithoutShopifyId()
    const usersWithShopifyId = await getUsersWithShopifyId()
    const totalUsers = await getTotalUsers()

    console.log('📈 ESTADÍSTICAS GENERALES:')
    console.log(`   Total de usuarios: ${totalUsers.count}`)
    console.log(`   Usuarios con shopifyCustomerId: ${usersWithShopifyId.count}`)
    console.log(`   Usuarios sin shopifyCustomerId: ${usersWithoutShopifyId.length}`)
    console.log(`   Porcentaje sin shopifyCustomerId: ${((usersWithoutShopifyId.length / totalUsers.count) * 100).toFixed(2)}%`)

    if (usersWithoutShopifyId.length > 0) {
      console.log('\n👥 USUARIOS SIN SHOPIFY CUSTOMER ID:')
      console.log('   (Estos usuarios necesitarán autenticarse con Shopify para obtener su ID)')
      console.log('')
      
      usersWithoutShopifyId.forEach((user, index) => {
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre'
        const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Nunca'
        const status = user.isActive ? '✅ Activo' : '❌ Inactivo'
        
        console.log(`   ${index + 1}. ${name} (${user.email})`)
        console.log(`      ID: ${user.id}`)
        console.log(`      Creado: ${new Date(user.createdAt).toLocaleDateString()}`)
        console.log(`      Último login: ${lastLogin}`)
        console.log(`      Estado: ${status}`)
        console.log('')
      })
    } else {
      console.log('\n✅ Todos los usuarios tienen shopifyCustomerId asignado.')
    }

    // Guardar reporte en archivo
    const report = {
      generatedAt: new Date().toISOString(),
      statistics: {
        totalUsers: totalUsers.count,
        usersWithShopifyId: usersWithShopifyId.count,
        usersWithoutShopifyId: usersWithoutShopifyId.length,
        percentageWithoutShopifyId: ((usersWithoutShopifyId.length / totalUsers.count) * 100).toFixed(2)
      },
      usersWithoutShopifyId: usersWithoutShopifyId
    }

    const fs = await import('fs')
    const reportPath = 'scripts/users_without_shopify_id_report.json'
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`📄 Reporte guardado en: ${reportPath}`)

  } catch (error) {
    console.error('❌ Error generando reporte:', error)
  }
}

async function main(): Promise<void> {
  try {
    await generateReport()
  } catch (error) {
    console.error('❌ Error en el script:', error)
  } finally {
    await prisma.$disconnect()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export {
  findUsersWithoutShopifyId, generateReport, getTotalUsers, getUsersWithShopifyId
}
