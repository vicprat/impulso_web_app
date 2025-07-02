import { NextResponse } from 'next/server'

import { requireAuth } from '@/modules/auth/server/server'
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

    return NextResponse.json(ticket)
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
