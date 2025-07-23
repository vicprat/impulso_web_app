import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CustomerInfo {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

async function simulateUpsertUser(customerInfo: CustomerInfo) {
  console.log(`🔄 Simulando upsertUser para: ${customerInfo.email}`)
  console.log(`   Shopify Customer ID: ${customerInfo.id}`)
  
  // Primero buscar por shopifyCustomerId
  let existingUser = await prisma.user.findUnique({
    include: { UserRole: true },
    where: { shopifyCustomerId: customerInfo.id },
  })

  console.log(`   Buscando por shopifyCustomerId: ${existingUser ? 'ENCONTRADO' : 'NO ENCONTRADO'}`)

  // Si no se encuentra por shopifyCustomerId, buscar por email
  if (!existingUser) {
    existingUser = await prisma.user.findUnique({
      include: { UserRole: true },
      where: { email: customerInfo.email },
    })
    console.log(`   Buscando por email: ${existingUser ? 'ENCONTRADO' : 'NO ENCONTRADO'}`)
  }

  if (existingUser) {
    console.log(`   Usuario existente encontrado: ${existingUser.email}`)
    console.log(`   shopifyCustomerId actual: ${existingUser.shopifyCustomerId || 'NULL'}`)
    
    // Si el usuario existe pero no tiene shopifyCustomerId, actualizarlo
    const updateData: any = {
      email: customerInfo.email,
      firstName: customerInfo.firstName,
      lastLoginAt: new Date(),
      lastName: customerInfo.lastName,
    }

    // Solo actualizar shopifyCustomerId si no lo tiene
    if (!existingUser.shopifyCustomerId) {
      updateData.shopifyCustomerId = customerInfo.id
      console.log(`   ✅ Actualizando shopifyCustomerId a: ${customerInfo.id}`)
    } else {
      console.log(`   ⚠️  Usuario ya tiene shopifyCustomerId: ${existingUser.shopifyCustomerId}`)
    }

    const updatedUser = await prisma.user.update({
      data: updateData,
      where: { id: existingUser.id },
    })

    console.log(`   ✅ Usuario actualizado: ${updatedUser.email}`)
    console.log(`   ✅ Nuevo shopifyCustomerId: ${updatedUser.shopifyCustomerId || 'NULL'}`)
    
    return updatedUser
  } else {
    console.log(`   ❌ Usuario no encontrado por email ni shopifyCustomerId`)
    console.log(`   🔄 Creando nuevo usuario...`)
    
    const defaultRoleConfig = await prisma.appConfig.findUnique({
      where: { key: 'default_user_role' },
    })

    const defaultRoleName = defaultRoleConfig?.value ?? 'customer'
    console.log(`   Rol por defecto: ${defaultRoleName}`)

    const defaultRole = await prisma.role.findUnique({
      where: { name: defaultRoleName },
    })

    if (!defaultRole) {
      throw new Error(`Default role '${defaultRoleName}' not found`)
    }

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastLoginAt: new Date(),
          lastName: customerInfo.lastName,
          shopifyCustomerId: customerInfo.id,
        },
      })

      await tx.userRole.create({
        data: {
          assignedBy: 'system',
          roleId: defaultRole.id,
          userId: user.id,
        },
      })

      return user
    })

    console.log(`   ✅ Nuevo usuario creado: ${newUser.email}`)
    console.log(`   ✅ shopifyCustomerId asignado: ${newUser.shopifyCustomerId}`)
    
    return newUser
  }
}

async function testWithExistingUser() {
  console.log('🧪 PROBANDO CON USUARIO EXISTENTE SIN SHOPIFY ID\n')
  
  // Buscar un usuario que no tenga shopifyCustomerId
  const userWithoutShopifyId = await prisma.user.findFirst({
    where: {
      shopifyCustomerId: null
    }
  })

  if (!userWithoutShopifyId) {
    console.log('❌ No se encontraron usuarios sin shopifyCustomerId')
    return
  }

  console.log(`Usuario de prueba: ${userWithoutShopifyId.email}`)
  console.log(`Estado actual: shopifyCustomerId = ${userWithoutShopifyId.shopifyCustomerId || 'NULL'}\n`)

  // Simular que este usuario se autentica con Shopify
  const mockCustomerInfo: CustomerInfo = {
    id: 'gid://shopify/Customer/123456789',
    email: userWithoutShopifyId.email,
    firstName: userWithoutShopifyId.firstName || undefined,
    lastName: userWithoutShopifyId.lastName || undefined,
  }

  const result = await simulateUpsertUser(mockCustomerInfo)
  
  console.log('\n✅ PRUEBA COMPLETADA')
  console.log(`Resultado final: ${result.email} - shopifyCustomerId: ${result.shopifyCustomerId}`)
}

async function testWithNewUser() {
  console.log('\n🧪 PROBANDO CON NUEVO USUARIO\n')
  
  const mockCustomerInfo: CustomerInfo = {
    id: 'gid://shopify/Customer/987654321',
    email: 'test-new-user@example.com',
    firstName: 'Test',
    lastName: 'User',
  }

  const result = await simulateUpsertUser(mockCustomerInfo)
  
  console.log('\n✅ PRUEBA COMPLETADA')
  console.log(`Resultado final: ${result.email} - shopifyCustomerId: ${result.shopifyCustomerId}`)
}

async function main(): Promise<void> {
  try {
    await testWithExistingUser()
    await testWithNewUser()
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
    simulateUpsertUser,
    testWithExistingUser,
    testWithNewUser
}
