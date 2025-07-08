import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'

export async function GET() {
  await requirePermission('manage_private_rooms')

  const privateRooms = await prisma.privateRoom.findMany({
    include: { products: true, user: true },
  })

  return NextResponse.json(privateRooms)
}

export async function POST(req: Request) {
  await requirePermission('manage_private_rooms')

  const { description, name, productIds, userId } = await req.json()

  const privateRoom = await prisma.privateRoom.create({
    data: {
      description,
      name,
      products: {
        create: productIds.map((productId: string) => ({ productId })),
      },
      userId,
    },
  })

  return NextResponse.json(privateRoom)
}
