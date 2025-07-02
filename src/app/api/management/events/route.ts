import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
import { eventService } from '@/services/event/service'

export async function GET(request: Request) {
  try {
    const session = await requireAuth()
    const { searchParams } = new URL(request.url)
    const params = {
      cursor: searchParams.get('cursor') ?? undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      search: searchParams.get('search') ?? undefined,
    }
    const paginatedResponse = await eventService.getEvents(params, session)
    return NextResponse.json(paginatedResponse)
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

    if (!body.title?.trim()) {
      throw new Error('El título del evento es requerido')
    }

    if (body.price && isNaN(parseFloat(body.price))) {
      throw new Error('El precio debe ser un número válido')
    }

    if (
      body.inventoryQuantity &&
      (!Number.isInteger(body.inventoryQuantity) || body.inventoryQuantity < 0)
    ) {
      throw new Error('La cantidad de boletos debe ser un número entero positivo')
    }

    if (body.details?.date) {
      const eventDate = new Date(body.details.date)
      if (isNaN(eventDate.getTime())) {
        throw new Error('La fecha del evento no es válida')
      }

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        throw new Error('La fecha del evento no puede ser en el pasado')
      }
    }

    const eventPayload = {
      description: body.description?.trim() ?? '',
      details: body.details ?? {},

      inventoryQuantity: body.inventoryQuantity ?? 1,

      price: body.price ?? '0',

      productType: 'Evento',
      status: body.status ?? 'DRAFT',
      tags: Array.isArray(body.tags) ? body.tags.filter((tag: string) => tag.trim()) : [],
      title: body.title.trim(),
      vendor: body.vendor?.trim() ?? 'Organizador Principal',
    }

    if (!['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(eventPayload.status)) {
      throw new Error('El status debe ser ACTIVE, DRAFT o ARCHIVED')
    }

    const newEvent = await eventService.createEvent(eventPayload, session)
    return NextResponse.json(newEvent, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating event:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    const status = message.includes('Permiso denegado')
      ? 403
      : message.includes('requerido') || message.includes('válido') || message.includes('pasado')
        ? 400
        : 500
    return NextResponse.json({ error: message }, { status })
  }
}
