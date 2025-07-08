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
        { error: 'Unauthorized - Can only access your own private room' },
        { status: 401 }
      )
    }

    const privateRoom = await prisma.privateRoom.findFirst({
      include: { products: true },
      where: { userId: id },
    })

    if (!privateRoom) {
      return NextResponse.json({ error: 'Private room not found' }, { status: 404 })
    }

    return NextResponse.json(privateRoom)
  } catch (error) {
    console.error('Error fetching private room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
