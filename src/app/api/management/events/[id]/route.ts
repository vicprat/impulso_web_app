import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { eventService } from '@/services/event/service'
import { type UpdateProductPayload } from '@/services/product/types'

function getEventGid(id: string): string {
  if (id.startsWith('gid://shopify/Product/')) {
    return id
  }
  return `gid://shopify/Product/${id}`
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const eventGid = getEventGid(id)

    const event = await eventService.getEventById(eventGid, session)

    if (!event) {
      return NextResponse.json(
        { error: 'Evento no encontrado o acceso denegado.' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
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
    const eventGid = getEventGid(id)
    const body = await request.json()

    const payload: UpdateProductPayload = { ...body, id: eventGid }

    const updatedEvent = await eventService.updateEvent(payload, session)

    return NextResponse.json(updatedEvent)
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth()
    const { id } = await params
    const eventGid = getEventGid(id)

    const deletedEventId = await eventService.deleteEvent(eventGid, session)

    return NextResponse.json({ deletedEventId, message: 'Evento eliminado exitosamente' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado')
      ? 403
      : message.includes('no encontrado')
        ? 404
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
