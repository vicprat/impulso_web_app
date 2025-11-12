import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { type UserFilters } from '@/modules/user/types'
import { getAllUsers } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'
import { prisma } from '@/src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as UserFilters['sortBy']
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as UserFilters['sortOrder']

    // Obtener todos los valores de 'role' (puede haber múltiples)
    const roleParams = searchParams.getAll('role')
    const roleFilter = roleParams.length > 0 ? (roleParams.length === 1 ? roleParams[0] : roleParams) : undefined

    const filters: UserFilters = {
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      limit,
      page,
      role: roleFilter,
      search: searchParams.get('search') ?? undefined,
      sortBy,
      sortOrder,
    }

    const { total, users } = await getAllUsers(filters)

    const pagination = {
      hasNext: page * limit < total,
      hasPrev: page > 1,
      limit,
      page,
      total,
    }

    return NextResponse.json({
      pagination,
      users,
    })
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

    const body = await request.json()
    const { email, firstName, isActive = true, lastName, role } = body

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email y rol son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 409 }
      )
    }

    // Obtener el rol
    const roleRecord = await prisma.role.findFirst({
      where: { 
        isActive: true,
        name: role 
      },
    })

    if (!roleRecord) {
      return NextResponse.json(
        { error: `Rol '${role}' no válido o inactivo` },
        { status: 400 }
      )
    }

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        UserRole: {
          create: {
            assignedAt: new Date(),
            assignedBy: null,
            roleId: roleRecord.id,
          },
        },
        email,
        firstName,
        isActive,
        lastName,
      },
      include: {
        UserRole: {
          include: {
            role: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        isActive: user.isActive,
        lastName: user.lastName,
        role
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Ya existe un usuario con este email' },
          { status: 409 }
        )
      }
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { error: 'El rol especificado no existe o no está activo' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
