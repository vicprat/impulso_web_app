import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { type UserFilters } from '@/modules/user/types'
import { getAllUsers } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)

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
