// src/app/api/users/[id]/deactivate/route.ts
import { type NextRequest, NextResponse } from 'next/server'

import { requirePermission } from '@/modules/auth/server/server'
import { deactivateUser } from '@/modules/user/user.service'

// ✅ CORREGIDO: Agregar request como primer parámetro
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requirePermission('manage_users')

    const targetUserId = params.id

    if (session.user.id === targetUserId) {
      return NextResponse.json({ error: 'No puedes desactivarte a ti mismo' }, { status: 400 })
    }

    await deactivateUser(targetUserId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
