import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function POST(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const body = await request.json()
    const { vendorName, targetUserId } = body as { vendorName?: string; targetUserId?: string }

    if (!vendorName || !targetUserId) {
      return NextResponse.json({ error: 'Faltan vendorName y targetUserId' }, { status: 400 })
    }

    const artist = await prisma.artist.findUnique({
      where: { name: vendorName },
    })

    if (!artist) {
      return NextResponse.json({ error: 'Artista no encontrado' }, { status: 404 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Desvincular al usuario anterior (si existe)
      const previousUser = await tx.user.findFirst({ where: { artistId: artist.id } })

      if (previousUser) {
        await tx.user.update({ data: { artistId: null }, where: { id: previousUser.id } })
      }

      // Vincular artista al nuevo usuario
      const updated = await tx.user.update({
        data: { artistId: artist.id },
        include: {
          UserRole: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
          },
          artist: true,
        },
        where: { id: targetUserId },
      })

      return updated
    })

    return NextResponse.json({ success: true, user: result })
  } catch (error) {
    console.error('Error en reasignación de artista:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
