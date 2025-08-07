import { NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { updateLinksOrder } from '@/modules/user/user.service'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_USERS)
    const { id } = await params
    const userId = id

    const body = await request.json()
    if (!Array.isArray(body) || body.some((item) => !item.id || typeof item.order !== 'number')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    await updateLinksOrder(userId, body)

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error reordering user links:', error)

    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (error instanceof Error && error.message.includes('Permission required')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
