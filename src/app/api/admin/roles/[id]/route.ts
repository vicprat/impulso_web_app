import { NextResponse } from 'next/server'
import { z } from 'zod'

import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'

const RoleUpdateSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, 'Role name is required').optional(),
  permissionIds: z.array(z.string()).optional(),
})

const isAdminRole = (roleName: string) => roleName.toLowerCase() === 'admin'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ROLES)
    const { id } = await params

    const role = await prisma.role.findUnique({
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
      where: { id },
    })

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    const formattedRole = {
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
    }

    return NextResponse.json(formattedRole, { status: 200 })
  } catch (error) {
    console.error('Error fetching role:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ROLES)
    const { id } = await params

    const json = await request.json()
    const validatedData = RoleUpdateSchema.parse(json)

    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    const isAdmin = isAdminRole(existingRole.name)

    if (isAdmin) {
      if (validatedData.name !== undefined && validatedData.name !== existingRole.name) {
        return NextResponse.json({ error: 'Cannot modify admin role name' }, { status: 403 })
      }
      if (validatedData.permissionIds !== undefined) {
        return NextResponse.json({ error: 'Cannot modify admin role permissions' }, { status: 403 })
      }
    }

    if (validatedData.name && validatedData.name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name: validatedData.name },
      })

      if (nameExists) {
        return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 })
      }
    }

    const updateData: any = {}

    if (validatedData.name !== undefined) updateData.name = validatedData.name
    if (validatedData.description !== undefined) updateData.description = validatedData.description

    if (validatedData.permissionIds !== undefined && !isAdmin) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })

      if (validatedData.permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: validatedData.permissionIds.map((permissionId) => ({
            permissionId,
            roleId: id,
          })),
        })
      }
    }

    const role = await prisma.role.update({
      data: updateData,
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
      where: { id },
    })

    const formattedRole = {
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
    }

    return NextResponse.json(formattedRole, { status: 200 })
  } catch (error) {
    console.error('Error updating role:', error)

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ROLES)
    const { id } = await params

    const existingRole = await prisma.role.findUnique({
      include: {
        UserRole: {
          select: {
            userId: true,
          },
        },
      },
      where: { id },
    })

    if (!existingRole) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (isAdminRole(existingRole.name)) {
      return NextResponse.json({ error: 'Cannot delete admin role' }, { status: 403 })
    }

    if (existingRole.UserRole.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users. Please reassign users first.' },
        { status: 409 }
      )
    }

    await prisma.role.delete({
      where: { id },
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting role:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
