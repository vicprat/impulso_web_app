import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET() {
  await requirePermission(PERMISSIONS.MANAGE_PRIVATE_ROOMS)

  const privateRooms = await prisma.privateRoom.findMany({
    include: {
      products: true,
      users: {
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              id: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  return NextResponse.json(privateRooms)
}

export async function POST(req: Request) {
  await requirePermission(PERMISSIONS.MANAGE_PRIVATE_ROOMS)

  const { description, name, productIds, userIds } = await req.json()

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return NextResponse.json({ error: 'At least one userId is required' }, { status: 400 })
  }

  const privateRoom = await prisma.privateRoom.create({
    data: {
      description,
      name,
      products: {
        create: productIds.map((productId: string) => ({ productId })),
      },
      users: {
        create: userIds.map((userId: string) => ({ userId })),
      },
    },
    include: {
      products: true,
      users: {
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              id: true,
              lastName: true,
            },
          },
        },
      },
    },
  })

  return NextResponse.json(privateRoom)
}
