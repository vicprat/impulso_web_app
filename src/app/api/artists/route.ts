// src/app/api/artists/route.ts
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

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Verificar que el vendor name no existe
    const existingArtist = await prisma.artist.findUnique({
      where: { name: vendorName },
    })

    if (existingArtist) {
      return NextResponse.json({ error: 'El nombre del vendor ya existe.' }, { status: 409 })
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Crear el nuevo artista
      const newArtist = await tx.artist.create({
        data: {
          name: vendorName,
        },
      })

      // 2. Buscar el rol de artista
      const artistRole = await tx.role.findUnique({ where: { name: 'artist' } })
      if (!artistRole) {
        throw new Error("El rol 'artist' no se encuentra en la base de datos.")
      }

      // 3. Actualizar el usuario con el artistId
      await tx.user.update({
        data: {
          artistId: newArtist.id,
        },
        where: { id: userId },
      })

      // 4. ✅ CORREGIDO: Usar UserRole en lugar de roles directo
      // Primero eliminar roles existentes del usuario
      await tx.userRole.deleteMany({
        where: { userId },
      })

      // Crear el nuevo rol de artista
      await tx.userRole.create({
        data: {
          assignedBy: session.user.id,
          roleId: artistRole.id,
          userId,
        },
      })

      // 5. Retornar el usuario actualizado con las relaciones correctas
      return tx.user.findUnique({
        include: {
          // ✅ CORREGIDO: Usar UserRole en lugar de roles
          UserRole: {
            include: {
              role: true,
            },
          },

          artist: true,
        },
        where: { id: userId },
      })
    })

    // ✅ TRANSFORMAR: Convertir UserRole a formato esperado por frontend
    const transformedUser = {
      ...updatedUser,
      permissions:
        updatedUser?.UserRole.flatMap(
          (ur) => ur.role.permissions?.map((rp) => rp.permission.name) || []
        ) || [],
      roles: updatedUser?.UserRole.map((ur) => ur.role.name) || [],
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
