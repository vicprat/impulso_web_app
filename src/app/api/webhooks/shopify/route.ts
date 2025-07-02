import crypto from 'crypto'

import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

enum FinancialEntryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

enum FinancialEntryStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Función para verificar la autenticidad del webhook de Shopify
function verifyShopifyWebhook(body: string, signature: string): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('⚠️ SHOPIFY_WEBHOOK_SECRET not configured - INSECURE in production!')
    // En desarrollo permitir, en producción bloquear
    return process.env.NODE_ENV !== 'production'
  }

  const hmac = crypto.createHmac('sha256', webhookSecret)
  hmac.update(body, 'utf8')
  const hash = hmac.digest('base64')

  const isValid = hash === signature
  console.log('🔐 Webhook signature verification:', isValid ? '✅ Valid' : '❌ Invalid')

  return isValid
}

// Función para generar un código QR único
function generateQRCode(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  return `EVENT_TICKET_${timestamp}_${random}`.toUpperCase()
}

// Función para encontrar el user ID interno basado en el email del customer
async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  try {
    const user = await prisma.user.findFirst({
      select: {
        email: true,
        id: true,
      },
      where: {
        email: {
          equals: email,
          mode: 'insensitive', // Case insensitive search
        },
      },
    })

    console.log(
      `🔍 User search for email "${email}":`,
      user ? `✅ Found ID: ${user.id}` : '❌ Not found'
    )
    return user
  } catch (error) {
    console.error('❌ Error finding user by email:', error)
    return null
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')
    const topic = request.headers.get('x-shopify-topic')
    const shop = request.headers.get('x-shopify-shop-domain')

    console.log('\n🔗 ===== NEW SHOPIFY WEBHOOK =====')
    console.log('📨 Topic:', topic)
    console.log('🏪 Shop:', shop)
    console.log('📏 Body size:', body.length, 'bytes')
    console.log('🔐 Has signature:', !!signature)

    if (!signature) {
      console.error('❌ Missing Shopify webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verificar autenticidad del webhook
    if (!verifyShopifyWebhook(body, signature)) {
      console.error('❌ Invalid Shopify webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const order = JSON.parse(body)

    console.log('\n📦 ORDER DETAILS:')
    console.log('🆔 Order ID:', order.id)
    console.log('📋 Order Number:', order.order_number || order.name)
    console.log('💰 Financial Status:', order.financial_status)
    console.log('🚚 Fulfillment Status:', order.fulfillment_status)
    console.log('💵 Total Price:', order.total_price, order.currency)
    console.log('📧 Customer Email:', order.customer?.email)
    console.log('📱 Customer Phone:', order.customer?.phone)
    console.log(
      '👤 Customer Name:',
      `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim()
    )
    console.log('📦 Line Items Count:', order.line_items?.length || 0)

    // Verificar que la orden esté pagada (flexible para desarrollo)
    const validPaidStatuses = ['paid', 'authorized', 'partially_paid']
    const isDevelopment = process.env.NODE_ENV !== 'production'

    // En desarrollo, también aceptar pending para testing con bogus payments
    if (isDevelopment) {
      validPaidStatuses.push('pending')
    }

    const isPaid = validPaidStatuses.includes(order.financial_status?.toLowerCase())

    if (!isPaid) {
      console.log(
        `⏳ Order financial status is '${order.financial_status}', not processing tickets`
      )
      if (isDevelopment) {
        console.log('💡 In development: consider using ORDERS_CREATE webhook for testing')
      }
      console.log('✅ Webhook acknowledged but no action taken')
      return NextResponse.json({
        action: 'acknowledged_no_action',
        environment: isDevelopment ? 'development' : 'production',
        message: `Order not in paid status (${order.financial_status})`,
        orderId: order.id,
        suggestion: isDevelopment
          ? 'Use ORDERS_CREATE webhook for testing'
          : 'Wait for actual payment',
      })
    }

    console.log(
      `✅ Order status '${order.financial_status}' accepted in ${isDevelopment ? 'development' : 'production'} mode`
    )
    console.log('✅ Order is paid, processing tickets...')

    // Buscar el user interno basado en el email del customer
    let user: { id: string; email: string } | null = null

    if (order.customer?.email) {
      user = await findUserByEmail(order.customer.email)
    }

    if (!user) {
      console.error('❌ Cannot find internal user for email:', order.customer?.email)
      console.log('💡 Suggestion: User might need to register first or email mismatch')

      return NextResponse.json(
        {
          customerEmail: order.customer?.email,
          error: 'User not found in internal system',
          orderId: order.id,
          suggestion: 'Customer needs to register in the system first',
        },
        { status: 404 }
      )
    }

    console.log('✅ Found internal user:', { email: user.email, id: user.id })

    const createdTickets = []
    const skippedItems = []
    const errors = []

    // Procesar cada line item en la orden
    console.log('\n🛒 PROCESSING LINE ITEMS:')
    for (let i = 0; i < (order.line_items?.length || 0); i++) {
      const lineItem = order.line_items[i]

      console.log('📦 FULL LINE ITEM DATA:', JSON.stringify(lineItem, null, 2))

      console.log(`\n📦 Item ${i + 1}/${order.line_items.length}:`)
      console.log('  📝 Title:', lineItem.title)
      console.log('  🏷️ Product Type:', lineItem.product_type)
      console.log('  🆔 Product ID:', lineItem.product_id)
      console.log('  🔢 Quantity:', lineItem.quantity)
      console.log('  💰 Price:', lineItem.price)

      // --- START Financial Entry Creation for each line item ---
      try {
        const financialEntryDescription = `Venta de ${lineItem.title} (Cantidad: ${lineItem.quantity}) - Orden #${order.order_number || order.name}`
        const financialEntryAmount = parseFloat(lineItem.price) * lineItem.quantity

        await prisma.financialEntry.create({
          data: {
            amount: financialEntryAmount,
            // Shopify Order ID (number converted to string)
            category: 'Ventas',

            currency: order.currency,

            date: new Date(order.processed_at || order.created_at),

            description: financialEntryDescription,

            // Pending manual assignment
            notes: `Line Item ID: ${lineItem.id}, Product ID: ${lineItem.product_id}`,

            // Default category, can be refined later
            paymentMethod: order.payment_gateway_names?.[0] || null,

            // First payment gateway name
            relatedParty:
              `${order.customer?.first_name || ''} ${order.customer?.last_name || ''}`.trim() ||
              null,

            // Use processed_at if available, otherwise created_at
            source: 'Shopify Order',

            sourceId: order.id.toString(),

            status: FinancialEntryStatus.PENDING,
            type: FinancialEntryType.INCOME,
          },
        })
        console.log(`    ✅ Financial Entry (INCOME) created for line item: ${lineItem.title}`)
      } catch (financialEntryError) {
        console.error(
          `    ❌ Error creating Financial Entry for line item ${lineItem.title}:`,
          financialEntryError
        )
        errors.push({
          error:
            financialEntryError instanceof Error
              ? financialEntryError.message
              : 'Unknown error creating financial entry',
          lineItem: i + 1,
        })
      }
      // --- END Financial Entry Creation ---

      // Solo procesar items que sean eventos
      if (lineItem.vendor?.toLowerCase() === 'evento') {
        const eventId = `gid://shopify/Product/${lineItem.product_id}`
        const quantity = lineItem.quantity || 1

        console.log(`  🎫 Processing EVENT - Creating ${quantity} ticket(s)`)
        console.log('  🎪 Event ID:', eventId)

        // Verificar si ya existen tickets para esta combinación
        const existingTickets = await prisma.ticket.findMany({
          where: {
            eventId,
            userId: user.id,
          },
        })

        console.log(`  📊 Existing tickets: ${existingTickets.length}`)

        // Calcular cuántos tickets crear (evitar duplicados)
        const ticketsToCreate = Math.max(0, quantity - existingTickets.length)

        if (ticketsToCreate === 0) {
          console.log('  ⚠️ All tickets already exist, skipping')
          skippedItems.push({
            existingCount: existingTickets.length,
            reason: 'tickets_already_exist',
            title: lineItem.title,
          })
          continue
        }

        console.log(`  🚀 Creating ${ticketsToCreate} new ticket(s)`)

        // Crear tickets
        for (let j = 0; j < ticketsToCreate; j++) {
          try {
            const qrCode = generateQRCode()

            const ticket = await prisma.ticket.create({
              data: {
                eventId,
                qrCode,
                status: 'VALID',
                userId: user.id,
              },
            })

            createdTickets.push({
              eventId,
              eventTitle: lineItem.title,
              orderLineItem: i + 1,
              qrCode: ticket.qrCode,
              ticketId: ticket.id,
              ticketNumber: j + 1,
            })

            console.log(`    ✅ Created ticket ${j + 1}/${ticketsToCreate}: ${ticket.id}`)
          } catch (ticketError) {
            console.error(`    ❌ Error creating ticket ${j + 1}/${ticketsToCreate}:`, ticketError)
            errors.push({
              error: ticketError instanceof Error ? ticketError.message : 'Unknown error',
              lineItem: i + 1,
              ticketNumber: j + 1,
            })
          }
        }
      } else {
        console.log(` ⏭️ Skipping non-event item (vendor: ${lineItem.vendor || 'unknown'})`)
        skippedItems.push({
          productType: lineItem.product_type,
          reason: 'not_an_event',
          title: lineItem.title,
        })
      }
    }

    const processingTime = Date.now() - startTime

    console.log('\n🎯 WEBHOOK PROCESSING COMPLETE:')
    console.log('⏱️ Processing time:', processingTime, 'ms')
    console.log('🎫 Tickets created:', createdTickets.length)
    console.log('⏭️ Items skipped:', skippedItems.length)
    console.log('❌ Errors:', errors.length)

    if (createdTickets.length > 0) {
      console.log('✅ SUCCESS: Tickets created for order', order.id)
    }

    console.log('===================================\n')

    return NextResponse.json({
      customerEmail: user.email,
      errors,
      message: 'Webhook processed successfully',
      orderId: order.id,
      orderNumber: order.order_number || order.name,
      processing: {
        errors: errors.length,
        itemsSkipped: skippedItems.length,
        processingTimeMs: processingTime,
        ticketsCreated: createdTickets.length,
      },
      skipped: skippedItems,
      success: true,
      tickets: createdTickets,
    })
  } catch (error) {
    const processingTime = Date.now() - startTime

    console.error('\n❌ WEBHOOK ERROR:')
    console.error('⏱️ Failed after:', processingTime, 'ms')
    console.error('💥 Error:', error)
    console.error('===================================\n')

    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Internal server error',
        processingTimeMs: processingTime,
        success: false,
      },
      { status: 500 }
    )
  }
}

// Endpoint para testing y verificación
export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasWebhookSecret: !!process.env.SHOPIFY_WEBHOOK_SECRET,
    message: 'Shopify webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
