import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/modules/auth/server/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requirePermission('manage_private_rooms');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const privateRoom = await prisma.privateRoom.findUnique({
      where: { id },
      include: { 
        products: true, 
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        }
      },
    });

    if (!privateRoom) {
      return NextResponse.json({ error: 'Private room not found' }, { status: 404 });
    }

    return NextResponse.json(privateRoom);
  } catch (error) {
    console.error('Error fetching private room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requirePermission('manage_private_rooms');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, userId, productIds } = await req.json();

    // ✅ CORRECCIÓN: Usar transacción para actualizar productos correctamente
    const updatedPrivateRoom = await prisma.$transaction(async (tx) => {
      // 1. Eliminar todos los productos existentes
      await tx.privateRoomProduct.deleteMany({
        where: { privateRoomId: id }
      });

      // 2. Actualizar el private room
      const room = await tx.privateRoom.update({
        where: { id },
        data: {
          name,
          description,
          userId,
        }
      });

      // 3. Crear nuevos productos si existen
      if (productIds && productIds.length > 0) {
        await tx.privateRoomProduct.createMany({
          data: productIds.map((productId: string) => ({
            privateRoomId: id,
            productId
          }))
        });
      }

      // 4. Retornar el room actualizado con productos y usuario
      return tx.privateRoom.findUnique({
        where: { id },
        include: { 
          products: true, 
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });
    });

    return NextResponse.json(updatedPrivateRoom);
  } catch (error) {
    console.error('Error updating private room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requirePermission('manage_private_rooms');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Los productos se eliminan automáticamente por cascade
    await prisma.privateRoom.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Private room deleted successfully' });
  } catch (error) {
    console.error('Error deleting private room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ✅ BONUS: Agregar método PATCH para actualizaciones parciales
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await requirePermission('manage_private_rooms');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, userId, productIds, ...otherFields } = body;

    // Construir el objeto de actualización dinámicamente
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (userId !== undefined) updateData.userId = userId;

    // Si hay otros campos, agregarlos
    Object.assign(updateData, otherFields);

    let updatedPrivateRoom;

    if (productIds !== undefined) {
      // Si se actualizan productos, usar transacción
      updatedPrivateRoom = await prisma.$transaction(async (tx) => {
        // Eliminar productos existentes
        await tx.privateRoomProduct.deleteMany({
          where: { privateRoomId: id }
        });

        // Actualizar room
        const room = await tx.privateRoom.update({
          where: { id },
          data: updateData
        });

        // Crear nuevos productos
        if (productIds.length > 0) {
          await tx.privateRoomProduct.createMany({
            data: productIds.map((productId: string) => ({
              privateRoomId: id,
              productId
            }))
          });
        }

        return tx.privateRoom.findUnique({
          where: { id },
          include: { 
            products: true, 
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        });
      });
    } else {
      // Solo actualizar campos del room
      updatedPrivateRoom = await prisma.privateRoom.update({
        where: { id },
        data: updateData,
        include: { 
          products: true, 
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });
    }

    return NextResponse.json(updatedPrivateRoom);
  } catch (error) {
    console.error('Error partially updating private room:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}