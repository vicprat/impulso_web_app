import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'

const RoleCreateSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, 'Role name is required'),
  permissionIds: z.array(z.string()).default([]),
})

const isAdminRole = (roleName: string) => roleName.toLowerCase() === 'admin'

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ROLES)

    const roles = await prisma.role.findMany({
      include: {
        UserRole: {
          select: {
            userId: true,
          },
        },
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    const formattedRoles = roles.map((role) => ({
      description: role.description,
      id: role.id,
      isAdmin: isAdminRole(role.name),
      name: role.name,
      permissions: role.permissions.map((rp) => ({
        description: rp.permission.description,
        id: rp.permission.id,
        name: rp.permission.name,
      })),
      userCount: role.UserRole.length,
    }))

    return NextResponse.json(formattedRoles, { status: 200 })
  } catch (error) {
    console.error('Error fetching roles:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ROLES)

    const json = await request.json()
    const validatedData = RoleCreateSchema.parse(json)

    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    })

    if (existingRole) {
      return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 })
    }

    const role = await prisma.role.create({
      data: {
        description: validatedData.description,
        name: validatedData.name,
        permissions: {
          create: validatedData.permissionIds.map((permissionId) => ({
            permission: {
              connect: { id: permissionId },
            },
          })),
        },
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    })

    const formattedRole = {
      description: role.description,
      id: role.id,
      isActive: role.isActive,
      name: role.name,
      permissions: role.permissions.map((rp) => ({
        description: rp.permission.description,
        id: rp.permission.id,
        name: rp.permission.name,
      })),
      userCount: 0,
    }

    return NextResponse.json(formattedRole, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
