import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('manage_users')

    const body = await request.json()
    const { userId, vendorName } = body

    if (!userId || !vendorName) {
      return NextResponse.json({ error: 'Faltan userId y vendorName' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const existingArtist = await prisma.artist.findUnique({
      where: { name: vendorName },
    })

    if (existingArtist) {
      return NextResponse.json({ error: 'El nombre del vendor ya existe.' }, { status: 409 })
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const newArtist = await tx.artist.create({
        data: {
          name: vendorName,
        },
      })

      const artistRole = await tx.role.findUnique({ where: { name: 'artist' } })
      if (!artistRole) {
        throw new Error("El rol 'artist' no se encuentra en la base de datos.")
      }

      await tx.user.update({
        data: {
          artistId: newArtist.id,
        },
        where: { id: userId },
      })

      await tx.userRole.deleteMany({
        where: { userId },
      })

      await tx.userRole.create({
        data: {
          assignedBy: session.user.id,
          roleId: artistRole.id,
          userId,
        },
      })

      return tx.user.findUnique({
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

          artist: true,
        },
        where: { id: userId },
      })
    })

    const transformedUser = {
      ...updatedUser,
      permissions:
        updatedUser?.UserRole.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.name)
        ) ?? [],
      roles: updatedUser?.UserRole.map((ur) => ur.role.name) ?? [],
    }

    return NextResponse.json(transformedUser)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error al crear el perfil de artista:', error)
    if (error.message.includes("El rol 'artist' no se encuentra")) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
