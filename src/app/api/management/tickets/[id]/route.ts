import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { eventService } from '@/services/event/service'
import { ticketService } from '@/services/ticket/service'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params

    const ticket = await ticketService.getTicketById(id, session)

    if (!ticket) {
      return NextResponse.json(
        { error: 'Boleto no encontrado o acceso denegado.' },
        { status: 404 }
      )
    }

    // Enriquecer el ticket con la información del evento
    try {
      const event = await eventService.getEventById(ticket.eventId, session)

      const enrichedTicket = {
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

      return NextResponse.json(enrichedTicket)
    } catch (error) {
      // Si hay error al obtener el evento, devolver el ticket sin enriquecer
      console.warn('Error al obtener información del evento:', error)
      return NextResponse.json({
        ...ticket,
        event: null,
      })
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const body = await request.json()

    const updatedTicket = await ticketService.updateTicket({ id, ...body }, session)

    return NextResponse.json(updatedTicket)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado')
      ? 403
      : message.includes('no encontrado')
        ? 404
        : 400
    return NextResponse.json({ error: message }, { status })
  }
}
