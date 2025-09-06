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

function verifyShopifyWebhook(body: string, signature: string): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET

  if (!webhookSecret) {
    return process.env.NODE_ENV !== 'production'
  }

  const hmac = crypto.createHmac('sha256', webhookSecret)
  hmac.update(body, 'utf8')
  const hash = hmac.digest('base64')

  const isValid = hash === signature

  return isValid
}

function generateQRCode(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  return `EVENT_TICKET_${timestamp}_${random}`.toUpperCase()
}

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
          mode: 'insensitive',
        },
      },
    })

    return user
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const body = await request.text()
    const signature = request.headers.get('x-shopify-hmac-sha256')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verificar autenticidad del webhook
    if (!verifyShopifyWebhook(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const order = JSON.parse(body)

    const validPaidStatuses = ['paid', 'authorized', 'partially_paid']
    const isDevelopment = process.env.NODE_ENV !== 'production'

    if (isDevelopment) {
      validPaidStatuses.push('pending')
    }

    const isPaid = validPaidStatuses.includes(order.financial_status?.toLowerCase())

    if (!isPaid) {
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

    let user: { id: string; email: string } | null = null

    if (order.customer?.email) {
      user = await findUserByEmail(order.customer.email)
    }

    if (!user) {
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

    const createdTickets = []
    const skippedItems = []
    const errors = []

    for (let i = 0; i < (order.line_items?.length ?? 0); i++) {
      const lineItem = order.line_items[i]

      try {
        const financialEntryDescription = `Venta de ${lineItem.title} (Cantidad: ${lineItem.quantity}) - Orden #${order.order_number ?? order.name}`
        const financialEntryAmount = parseFloat(lineItem.price) * lineItem.quantity

        await prisma.financialEntry.create({
          data: {
            amount: financialEntryAmount,
            category: 'Ventas',

            currency: order.currency,

            date: new Date(order.processed_at ?? order.created_at),

            description: financialEntryDescription,

            notes: `Line Item ID: ${lineItem.id}, Product ID: ${lineItem.product_id}`,

            paymentMethod: order.payment_gateway_names?.[0] ?? null,

            relatedParty:
              `${order.customer?.first_name ?? ''} ${order.customer?.last_name ?? ''}`.trim() ||
              null,

            source: 'Shopify Order',

            sourceId: order.id.toString(),

            status: FinancialEntryStatus.PENDING,
            type: FinancialEntryType.INCOME,
          },
        })
      } catch (financialEntryError) {
        errors.push({
          error:
            financialEntryError instanceof Error
              ? financialEntryError.message
              : 'Unknown error creating financial entry',
          lineItem: i + 1,
        })
      }
      if (lineItem.vendor?.toLowerCase() === 'evento') {
        const eventId = `gid://shopify/Product/${lineItem.product_id}`
        const quantity = lineItem.quantity ?? 1

        // Verificar si ya existe un ticket agrupado para este evento y orden
        const existingTicket = await prisma.ticket.findFirst({
          where: {
            eventId,
            orderId: order.id.toString(),
            userId: user.id,
          },
        })

        if (existingTicket) {
          skippedItems.push({
            existingCount: existingTicket.quantity,
            reason: 'ticket_already_exists_for_order',
            title: lineItem.title,
          })
          continue
        }

        try {
          const qrCode = generateQRCode()

          const ticket = await prisma.ticket.create({
            data: {
              eventId,
              orderId: order.id.toString(),
              qrCode,
              quantity,
              status: 'VALID',
              userId: user.id,
            },
          })

          createdTickets.push({
            eventId,
            eventTitle: lineItem.title,
            orderLineItem: i + 1,
            qrCode: ticket.qrCode,
            quantity: ticket.quantity,
            ticketId: ticket.id,
          })
        } catch (ticketError) {
          errors.push({
            error: ticketError instanceof Error ? ticketError.message : 'Unknown error',
            lineItem: i + 1,
          })
        }
      } else {
        skippedItems.push({
          productType: lineItem.product_type,
          reason: 'not_an_event',
          title: lineItem.title,
        })
      }
    }

    const processingTime = Date.now() - startTime

    return NextResponse.json({
      customerEmail: user.email,
      errors,
      message: 'Webhook processed successfully',
      orderId: order.id,
      orderNumber: order.order_number ?? order.name,
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

export async function GET() {
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    hasWebhookSecret: !!process.env.SHOPIFY_WEBHOOK_SECRET,
    message: 'Shopify webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
