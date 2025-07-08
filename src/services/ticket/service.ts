import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { type AuthSession } from '@/modules/auth/service'

interface CreateTicketPayload {
  userId: string
  eventId: string
  qrCode: string
}

interface UpdateTicketPayload {
  id: string
  status?: string
}

type ValidatedSession = NonNullable<AuthSession>

function validateSession(session: AuthSession): asserts session is ValidatedSession {
  if (!session.user.id) {
    throw new Error('Sesión no válida o usuario no autenticado.')
  }
}

async function createTicket(payload: CreateTicketPayload, session: AuthSession) {
  validateSession(session)
  if (payload.userId !== session.user.id) {
    throw new Error('Permiso denegado: No puedes crear boletos para otro usuario.')
  }

  return prisma.ticket.create({ data: payload })
}

async function getTicketById(id: string, session: AuthSession) {
  validateSession(session)
  const ticket = await prisma.ticket.findUnique({ where: { id } })

  if (!ticket) {
    return null
  }

  if (ticket.userId !== session.user.id) {
    throw new Error('Permiso denegado: No puedes ver este boleto.')
  }

  return ticket
}

async function getTicketsByUserId(userId: string, session: AuthSession) {
  validateSession(session)
  if (userId !== session.user.id) {
    throw new Error('Permiso denegado: No puedes ver los boletos de otro usuario.')
  }
  return prisma.ticket.findMany({ where: { userId } })
}

async function updateTicket(payload: UpdateTicketPayload, session: AuthSession) {
  validateSession(session)
  await requirePermission('manage_events')
  const existingTicket = await prisma.ticket.findUnique({ where: { id: payload.id } })
  if (!existingTicket) {
    throw new Error('Boleto no encontrado.')
  }

  return prisma.ticket.update({
    data: { status: payload.status },
    where: { id: payload.id },
  })
}

export const ticketService = {
  createTicket,
  getTicketById,
  getTicketsByUserId,
  updateTicket,
}
