import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'
import { requirePermission } from '@/src/modules/auth/server/server'

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

export async function GET(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_PRIVATE_ROOMS)

    const { searchParams } = new URL(req.url)
    const roomId = searchParams.get('roomId')

    const whereClause = roomId ? { privateRoomId: roomId } : {}

    const invites = await prisma.privateRoomInvite.findMany({
      include: {
        privateRoom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      where: whereClause,
    })

    return NextResponse.json(invites)
  } catch (error) {
    console.error('Error fetching invites:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_PRIVATE_ROOMS)

    const session = await import('@/src/modules/auth/server/server').then((m) =>
      m.getServerSession()
    )
    const userId = session?.user?.id

    const { email, expiresInDays, privateRoomId } = await req.json()

    if (!privateRoomId) {
      return NextResponse.json({ error: 'El ID de la sala es requerido' }, { status: 400 })
    }

    const privateRoom = await prisma.privateRoom.findUnique({
      where: { id: privateRoomId },
    })

    if (!privateRoom) {
      return NextResponse.json({ error: 'Sala no encontrada' }, { status: 404 })
    }

    const token = generateToken()
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null

    const invite = await prisma.privateRoomInvite.create({
      data: {
        token,
        privateRoomId,
        email: email || null,
        expiresAt,
        createdBy: userId || null,
      },
      include: {
        privateRoom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(invite, { status: 201 })
  } catch (error) {
    console.error('Error creating invite:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_PRIVATE_ROOMS)

    const { searchParams } = new URL(req.url)
    const inviteId = searchParams.get('id')

    if (!inviteId) {
      return NextResponse.json({ error: 'El ID de la invitación es requerido' }, { status: 400 })
    }

    await prisma.privateRoomInvite.delete({
      where: { id: inviteId },
    })

    return NextResponse.json({ message: 'Invitación eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting invite:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
