// src/app/api/users/route.ts
import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { type UserFilters } from '@/modules/user/types'
import { getAllUsers } from '@/modules/user/user.service'

export async function GET(request: NextRequest) {
  try {
    await requirePermission('manage_users')

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '10')
    const sortBy = (searchParams.get('sortBy') ?? 'createdAt') as UserFilters['sortBy']
    const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as UserFilters['sortOrder']

    const filters: UserFilters = {
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      limit,
      page,
      role: searchParams.get('role') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      sortBy,
      sortOrder,
    }

    console.log('🔍 API - Filtros recibidos:', filters)

    // ✅ El service ya devuelve users transformados con roles array
    const { total, users } = await getAllUsers(filters)

    console.log('✅ API - Usuarios obtenidos:', {
      firstUserRoles: users[0]?.roles || 'No users',
      total,
      usersCount: users.length,
    })

    const pagination = {
      hasNext: page * limit < total,
      hasPrev: page > 1,
      limit,
      page,
      total,
    }

    return NextResponse.json({
      pagination,
      users, // Ya vienen transformados del service
    })
  } catch (error) {
    console.error('❌ API - Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
