import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Asegúrate de tener una instancia de Prisma

/**
 * @description Crea un perfil de Artista y lo vincula a un usuario existente.
 * Esta acción requiere permisos de administrador.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('manage_users');

    const body = await request.json();
    const { userId, vendorName } = body;

    if (!userId || !vendorName) {
      return NextResponse.json({ error: 'Faltan userId y vendorName' }, { status: 400 });
    }

    const existingArtist = await prisma.artist.findUnique({
      where: { name: vendorName },
    });

    if (existingArtist) {
      return NextResponse.json({ error: 'El nombre del vendor ya existe.' }, { status: 409 });
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const newArtist = await tx.artist.create({
        data: {
          name: vendorName,
        },
      });

      const artistRole = await tx.role.findUnique({ where: { name: 'artist' } });
      if (!artistRole) {
        throw new Error("El rol 'artist' no se encuentra en la base de datos.");
      }

      // VINCULACIÓN FINAL CON connectOrCreate
      await tx.user.update({
        where: { id: userId },
        data: {
          // 1. Vincula el ID del nuevo artista al usuario
          artistId: newArtist.id,
          // 2. Conecta o crea la relación de rol
          roles: {
            connectOrCreate: {
              where: {
                // Usa el campo único compuesto de la tabla user_roles
                userId_roleId: {
                  userId: userId,
                  roleId: artistRole.id,
                },
              },
              create: {
                // Los datos para crear la nueva fila en user_roles
                roleId: artistRole.id,
                assignedBy: session.user.id, // Guarda quién hizo la asignación
              },
            },
          },
        },
      });
      
      // Devuelve el usuario actualizado para confirmar
      return tx.user.findUnique({
          where: { id: userId },
          include: { artist: true, roles: { include: { role: true } } }
      });
    });

    return NextResponse.json(updatedUser);

  } catch (error: any) {
    console.error("Error al crear el perfil de artista:", error);
    if (error.message.includes("El rol 'artist' no se encuentra")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}