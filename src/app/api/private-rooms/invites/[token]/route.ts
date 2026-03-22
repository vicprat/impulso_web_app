import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/src/modules/auth/server/server'

export async function GET(req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params

    const invite = await prisma.privateRoomInvite.findUnique({
      include: {
        privateRoom: {
          select: {
            description: true,
            id: true,
            name: true,
          },
        },
      },
      where: { token },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'La invitación ha expirado' }, { status: 410 })
    }

    if (invite.usedAt) {
      return NextResponse.json({ error: 'La invitación ya fue utilizada' }, { status: 410 })
    }

    return NextResponse.json({
      email: invite.email,
      expiresAt: invite.expiresAt,
      privateRoom: invite.privateRoom,
      token: invite.token,
    })
  } catch (error) {
    console.error('Error fetching invite:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(req: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params

    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para aceptar la invitación' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const invite = await prisma.privateRoomInvite.findUnique({
      include: {
        privateRoom: true,
      },
      where: { token },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
    }

    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'La invitación ha expirado' }, { status: 410 })
    }

    if (invite.usedAt) {
      return NextResponse.json({ error: 'La invitación ya fue utilizada' }, { status: 410 })
    }

    const existingMembership = await prisma.privateRoomUser.findUnique({
      where: {
        privateRoomId_userId: {
          privateRoomId: invite.privateRoomId,
          userId,
        },
      },
    })

    if (existingMembership) {
      await prisma.privateRoomInvite.update({
        data: { usedAt: new Date() },
        where: { id: invite.id },
      })

      return NextResponse.json({
        message: 'Ya eres miembro de esta sala',
        privateRoom: invite.privateRoom,
      })
    }

    await prisma.$transaction([
      prisma.privateRoomUser.create({
        data: {
          privateRoomId: invite.privateRoomId,
          userId,
        },
      }),
      prisma.privateRoomInvite.update({
        data: { usedAt: new Date() },
        where: { id: invite.id },
      }),
    ])

    return NextResponse.json({
      message: 'Te has unido a la sala exitosamente',
      privateRoom: invite.privateRoom,
    })
  } catch (error) {
    console.error('Error accepting invite:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
