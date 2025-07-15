import { NextResponse } from 'next/server'

import { getServerSession } from '@/src/modules/auth/server/server'
import { updateLinksOrder } from '@/src/modules/user/user.service'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    const userId = session?.user?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    if (!Array.isArray(body) || body.some((item) => !item.id || typeof item.order !== 'number')) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    await updateLinksOrder(userId, body)

    return NextResponse.json({ message: 'Order updated successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error reordering links:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
