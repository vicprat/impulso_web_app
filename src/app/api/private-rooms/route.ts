
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/modules/auth/server/server';

export async function GET() {
  const session = await requirePermission('manage_private_rooms');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const privateRooms = await prisma.privateRoom.findMany({
    include: { products: true, user: true },
  });

  return NextResponse.json(privateRooms);
}

export async function POST(req: Request) {
    const session = await requirePermission('manage_private_rooms');
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, description, userId, productIds } = await req.json();

  const privateRoom = await prisma.privateRoom.create({
    data: {
      name,
      description,
      userId,
      products: {
        create: productIds.map((productId: string) => ({ productId })),
      },
    },
  });

  return NextResponse.json(privateRoom);
}

