import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { eventService } from '@/services/event/service'
import { ticketService } from '@/services/ticket/service'

export async function GET(request: Request) {
  try {
    const session = await requireAuth()

    // 🔒 CRÍTICO: SIEMPRE usar session.user.id - NO permitir override
    // Esto previene que alguien pueda ver tickets de otros usuarios
    const userId = session.user.id

    console.log('✅ Getting tickets for authenticated user:', userId)

    // Tu ticketService ya valida que solo puede ver sus propios tickets
    const tickets = await ticketService.getTicketsByUserId(userId, session)

    // 🎯 ENRIQUECIMIENTO: Agregar información del evento a cada ticket
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          // Obtener información del evento usando el eventId (Shopify Product GID)
          const event = await eventService.getEventById(ticket.eventId, session)

          return {
            ...ticket,
            event: event
              ? {
                  id: event.id,
                  title: event.title,
                  handle: event.handle,
                  vendor: event.vendor,
                  eventDetails: event.eventDetails,
                  status: event.status,
                  primaryImage: event.primaryImage,
                  // Acceso directo como usas en tu frontend
                  price: event.variants[0]?.price || { amount: '0', currencyCode: 'MXN' },
                }
              : null,
          }
        } catch (eventError) {
          console.error(`❌ Error fetching event ${ticket.eventId}:`, eventError)
          // Si no puede obtener el evento, devolver el ticket sin evento
          return {
            ...ticket,
            event: null,
          }
        }
      })
    )

    console.log(`✅ Returning ${enrichedTickets.length} tickets for user ${userId}`)
    return NextResponse.json(enrichedTickets)
  } catch (error: unknown) {
    console.error('❌ Error getting tickets:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth()
    const body = await request.json()

    // 🔒 SEGURIDAD: Forzar el userId de la sesión (no confiar en el payload)
    const ticketPayload = {
      ...body,
      userId: session.user.id, // Siempre usar el user ID de la sesión
    }

    console.log('✅ Creating ticket for user:', session.user.id)

    const newTicket = await ticketService.createTicket(ticketPayload, session)
    return NextResponse.json(newTicket, { status: 201 })
  } catch (error: unknown) {
    console.error('❌ Error creating ticket:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
