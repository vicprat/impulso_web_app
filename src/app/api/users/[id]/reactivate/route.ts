import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { reactivateUser } from '@/modules/user/user.service'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requirePermission('manage_users')

    const targetUserId = params.id

    await reactivateUser(targetUserId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reactivating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
