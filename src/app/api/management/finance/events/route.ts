import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/src/modules/auth/server/server'

export async function GET() {
  try {
    // Verificar permisos: solo usuarios con 'manage_events' pueden acceder
    const session = await requirePermission('manage_events')
    console.log(
      'User with manage_events permission accessed finance events API:',
      session.user.email
    )

    const events = await prisma.event.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        shopifyProductId: true,
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events for financial management:', error)
    // Manejo de errores, incluyendo errores de permiso
    if (error instanceof Error && error.message.includes('Permission denied')) {
      return NextResponse.json({ message: 'Permission denied' }, { status: 403 })
    }
    return NextResponse.json({ message: 'Error fetching events' }, { status: 500 })
  }
}
