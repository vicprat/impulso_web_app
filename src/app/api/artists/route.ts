import { type NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission(PERMISSIONS.MANAGE_USERS)

    const body = await request.json()
    const { userId, vendorName } = body

    if (!userId || !vendorName) {
      return NextResponse.json({ error: 'Faltan userId y vendorName' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      include: {
        UserRole: {
          include: {
            role: true,
          },
        },
        artist: true,
      },
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const existingArtist = await prisma.artist.findUnique({
      include: {
        user: true,
      },
      where: { name: vendorName },
    })

    // Si el artista existe pero no está asignado a ningún usuario, podemos reutilizarlo
    if (existingArtist && !existingArtist.user) {
      // OK: vendor libre
    } else if (existingArtist && existingArtist.user) {
      return NextResponse.json(
        {
          assignedTo: {
            email: existingArtist.user.email,
            firstName: existingArtist.user.firstName ?? null,
            id: existingArtist.user.id,
            lastName: existingArtist.user.lastName ?? null,
          },
          code: 'ARTIST_ASSIGNED',
          error: `El nombre del artista '${vendorName}' ya está asignado a otro usuario`,
          vendorName,
        },
        { status: 409 }
      )
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      let artistToUse

      if (existingArtist && !existingArtist.user) {
        // Reutilizar artista existente que no está asignado
        artistToUse = existingArtist
      } else {
        // Crear nuevo artista
        artistToUse = await tx.artist.create({
          data: {
            name: vendorName,
          },
        })
      }

      const artistRole = await tx.role.findUnique({ where: { name: 'artist' } })
      if (!artistRole) {
        throw new Error("El rol 'artist' no se encuentra en la base de datos.")
      }

      // Actualizar el usuario con la relación al artista (si ya tenía uno, reemplazar)
      await tx.user.update({
        data: { artistId: artistToUse.id },
        where: { id: userId },
      })

      // Eliminar roles existentes y asignar el rol de artista
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

    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes("El rol 'artist' no se encuentra")) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'El vendor ya existe y está asignado a otro usuario' },
          { status: 409 }
        )
      }
    }

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
