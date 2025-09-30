import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const { id: artistId } = await params
    const body = await request.json()
    const { artistType } = body

    if (!artistType || !['IMPULSO', 'COLLECTIVE'].includes(artistType)) {
      return NextResponse.json(
        { error: 'Tipo de artista inválido. Debe ser IMPULSO o COLLECTIVE' },
        { status: 400 }
      )
    }

    const existingArtist = await prisma.artist.findUnique({
      include: {
        user: true,
      },
      where: { id: artistId },
    })

    if (!existingArtist) {
      return NextResponse.json({ error: 'Artista no encontrado' }, { status: 404 })
    }

    const updatedArtist = await prisma.artist.update({
      data: {
        artistType: artistType as 'IMPULSO' | 'COLLECTIVE',
      },
      include: {
        user: {
          include: {
            UserRole: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      where: { id: artistId },
    })

    const transformedUser = {
      ...updatedArtist.user,
      artist: {
        ...updatedArtist,
        user: undefined,
      },
      permissions:
        updatedArtist.user?.UserRole.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name)
        ) ?? [],
      roles: updatedArtist.user?.UserRole.map((ur) => ur.role.name) ?? [],
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error updating artist type:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
