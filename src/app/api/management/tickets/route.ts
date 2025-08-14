import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { eventService } from '@/services/event/service'
import { ticketService } from '@/services/ticket/service'

export async function GET() {
  try {
    const session = await requireAuth()

    const userId = session.user.id

    const tickets = await ticketService.getTicketsByUserId(userId, session)

    // Agrupar tickets por evento y orden
    const groupedTickets = tickets.reduce(
      (acc, ticket) => {
        const key = `${ticket.eventId}_${ticket.orderId || 'no_order'}`

        if (!acc[key]) {
          acc[key] = {
            ...ticket,
            event: null,
          }
        } else {
          // Si ya existe un ticket para este evento y orden, sumar las cantidades
          acc[key].quantity += ticket.quantity
        }

        return acc
      },
      {} as Record<string, any>
    )

    const enrichedTickets = await Promise.all(
      Object.values(groupedTickets).map(async (ticket) => {
        try {
          const event = await eventService.getEventById(ticket.eventId, session)

          return {
            ...ticket,
            event: event
              ? {
                  eventDetails: event.eventDetails,
                  handle: event.handle,
                  id: event.id,
                  price: event.variants[0].price,

                  primaryImage: event.primaryImage,

                  status: event.status,

                  title: event.title,

                  vendor: event.vendor,
                }
              : null,
          }
        } catch {
          return {
            ...ticket,
            event: null,
          }
        }
      })
    )

    return NextResponse.json(enrichedTickets)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    const ticketPayload = {
      ...body,
      userId: session.user.id,
    }

    const newTicket = await ticketService.createTicket(ticketPayload, session)
    return NextResponse.json(newTicket, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
