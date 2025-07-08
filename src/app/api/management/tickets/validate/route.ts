import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/modules/auth/server/server'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (
      !session?.user.roles ||
      !Array.isArray(session.user.roles) ||
      !session.user.roles.includes('admin')
    ) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de administrador.' },
        { status: 403 }
      )
    }

    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: 'El código QR es requerido.' }, { status: 400 })
    }

    const ticket = await prisma.ticket.findUnique({
      include: {
        user: { select: { email: true } },
      },
      where: { qrCode },
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Boleto no encontrado.', status: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    if (ticket.status === 'USED') {
      return NextResponse.json(
        {
          error: `Este boleto ya fue utilizado.`,
          status: 'ALREADY_USED',
          ticket,
        },
        { status: 409 }
      )
    }

    if (ticket.status === 'CANCELLED') {
      return NextResponse.json(
        {
          error: 'Este boleto ha sido cancelado.',
          status: 'CANCELLED',
          ticket,
        },
        { status: 403 }
      )
    }

    if (ticket.status === 'VALID') {
      const updatedTicket = await prisma.ticket.update({
        data: { status: 'USED' },
        include: {
          user: { select: { email: true } },
        },
        where: { id: ticket.id },
      })

      return NextResponse.json({
        message: 'Acceso Concedido.',
        status: 'SUCCESS',
        ticket: updatedTicket,
      })
    }

    return NextResponse.json(
      { error: `Estado de boleto no válido: ${ticket.status}`, status: 'INVALID_STATUS' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error al validar el boleto:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
