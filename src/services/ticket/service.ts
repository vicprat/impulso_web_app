import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { type AuthSession } from '@/modules/auth/service'

interface CreateTicketPayload {
  userId: string
  eventId: string // Shopify Product GID for the event
  qrCode: string
}

interface UpdateTicketPayload {
  id: string
  status?: string
}

type ValidatedSession = NonNullable<AuthSession>

function validateSession(session: AuthSession): asserts session is ValidatedSession {
  if (!session?.user?.id) {
    throw new Error('Sesión no válida o usuario no autenticado.')
  }
}

async function createTicket(payload: CreateTicketPayload, session: AuthSession) {
  validateSession(session)
  // No specific permission for creating tickets, as it's tied to a purchase flow
  // However, we should ensure the userId matches the session user for security
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

  // Ensure user can only view their own tickets unless they have a specific permission
  if (ticket.userId !== session.user.id) {
    // Check for a permission like 'manage_all_tickets' if needed for admins/managers
    // For now, only the owner can view their ticket
    throw new Error('Permiso denegado: No puedes ver este boleto.')
  }

  return ticket
}

async function getTicketsByUserId(userId: string, session: AuthSession) {
  validateSession(session)
  if (userId !== session.user.id) {
    // Check for a permission like 'manage_all_tickets' if needed for admins/managers
    throw new Error('Permiso denegado: No puedes ver los boletos de otro usuario.')
  }
  return prisma.ticket.findMany({ where: { userId } })
}

async function updateTicket(payload: UpdateTicketPayload, session: AuthSession) {
  validateSession(session)
  // This operation might require a specific permission, e.g., 'manage_tickets' for admins
  // For now, only an admin/manager can update a ticket's status (e.g., mark as used)
  await requirePermission('manage_events') // Reusing manage_events for now, but a more specific permission like 'manage_tickets' would be better

  const existingTicket = await prisma.ticket.findUnique({ where: { id: payload.id } })
  if (!existingTicket) {
    throw new Error('Boleto no encontrado.')
  }

  return prisma.ticket.update({
    where: { id: payload.id },
    data: { status: payload.status },
  })
}

export const ticketService = {
  createTicket,
  getTicketById,
  getTicketsByUserId,
  updateTicket,
}
