// app/api/management/tickets/validate/route.ts

import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/modules/auth/server/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // 1. Seguridad: Verificar que el usuario sea un administrador
    const session = await getServerSession()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren privilegios de administrador.' },
        { status: 403 }
      )
    }

    const { qrCode } = await request.json()

    if (!qrCode) {
      return NextResponse.json({ error: 'El código QR es requerido.' }, { status: 400 })
    } // 2. Buscar el boleto en la base de datos, incluyendo la info del evento y del usuario

    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        user: { select: { name: true, email: true } },
        event: true, // Asumiendo que tienes una relación 'event' en tu modelo Ticket
      },
    }) // 3. Manejar los diferentes escenarios de validación

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
      ) // 409 Conflict
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
      // 4. Si es válido, actualizar su estado a 'USADO'
      const updatedTicket = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'USED' },
        include: {
          user: { select: { name: true, email: true } },
          event: true,
        },
      })

      return NextResponse.json({
        message: 'Acceso Concedido.',
        status: 'SUCCESS',
        ticket: updatedTicket,
      })
    } // Fallback para cualquier otro estado no manejado

    return NextResponse.json(
      { error: `Estado de boleto no válido: ${ticket.status}`, status: 'INVALID_STATUS' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error al validar el boleto:', error)
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 })
  }
}
