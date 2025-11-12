import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const session = await requirePermission(PERMISSIONS.VIEW_PRIVATE_ROOMS)

    const isOwner = session.user.id === id
    const isAdmin = session.user.roles.includes('admin') || session.user.roles.includes('manager')

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Can only access your own private rooms' },
        { status: 401 }
      )
    }

    const privateRooms = await prisma.privateRoom.findMany({
      include: { 
        products: true,
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      where: {
        users: {
          some: {
            userId: id,
          },
        },
      },
    })

    if (!privateRooms || privateRooms.length === 0) {
      return NextResponse.json({ error: 'No private rooms found' }, { status: 404 })
    }

    return NextResponse.json(privateRooms)
  } catch (error) {
    console.error('Error fetching private rooms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
