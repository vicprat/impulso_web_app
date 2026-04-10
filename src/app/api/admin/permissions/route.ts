import { NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { prisma } from '@/src/lib/prisma'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function GET() {
  try {
    await requirePermission(PERMISSIONS.MANAGE_ROLES)

    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(permissions, { status: 200 })
  } catch (error) {
    console.error('Error fetching permissions:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
