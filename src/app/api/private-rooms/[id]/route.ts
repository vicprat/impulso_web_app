import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/modules/auth/server/server'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requirePermission('manage_private_rooms')

    const privateRoom = await prisma.privateRoom.findUnique({
      include: {
        products: true,
        user: {
          select: {
            email: true,
            firstName: true,
            id: true,
            lastName: true,
          },
        },
      },
      where: { id },
    })

    if (!privateRoom) {
      return NextResponse.json({ error: 'Private room not found' }, { status: 404 })
    }

    return NextResponse.json(privateRoom)
  } catch (error) {
    console.error('Error fetching private room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requirePermission('manage_private_rooms')

    const { description, name, productIds, userId } = await req.json()

    const updatedPrivateRoom = await prisma.$transaction(async (tx) => {
      await tx.privateRoomProduct.deleteMany({
        where: { privateRoomId: id },
      })

      await tx.privateRoom.update({
        data: {
          description,
          name,
          userId,
        },
        where: { id },
      })

      if (productIds && productIds.length > 0) {
        await tx.privateRoomProduct.createMany({
          data: productIds.map((productId: string) => ({
            privateRoomId: id,
            productId,
          })),
        })
      }

      return tx.privateRoom.findUnique({
        include: {
          products: true,
          user: {
            select: {
              email: true,
              firstName: true,
              id: true,
              lastName: true,
            },
          },
        },
        where: { id },
      })
    })

    return NextResponse.json(updatedPrivateRoom)
  } catch (error) {
    console.error('Error updating private room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requirePermission('manage_private_rooms')

    await prisma.privateRoom.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Private room deleted successfully' })
  } catch (error) {
    console.error('Error deleting private room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requirePermission('manage_private_rooms')

    const body = await req.json()
    const { description, name, productIds, userId, ...otherFields } = body

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (userId !== undefined) updateData.userId = userId

    Object.assign(updateData, otherFields)

    let updatedPrivateRoom

    if (productIds !== undefined) {
      updatedPrivateRoom = await prisma.$transaction(async (tx) => {
        await tx.privateRoomProduct.deleteMany({
          where: { privateRoomId: id },
        })

        await tx.privateRoom.update({
          data: updateData,
          where: { id },
        })

        if (productIds.length > 0) {
          await tx.privateRoomProduct.createMany({
            data: productIds.map((productId: string) => ({
              privateRoomId: id,
              productId,
            })),
          })
        }

        return tx.privateRoom.findUnique({
          include: {
            products: true,
            user: {
              select: {
                email: true,
                firstName: true,
                id: true,
                lastName: true,
              },
            },
          },
          where: { id },
        })
      })
    } else {
      updatedPrivateRoom = await prisma.privateRoom.update({
        data: updateData,
        include: {
          products: true,
          user: {
            select: {
              email: true,
              firstName: true,
              id: true,
              lastName: true,
            },
          },
        },
        where: { id },
      })
    }

    return NextResponse.json(updatedPrivateRoom)
  } catch (error) {
    console.error('Error partially updating private room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
