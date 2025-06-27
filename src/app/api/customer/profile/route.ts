import { type NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/modules/auth/server/server'
import { api } from '@/modules/customer/api'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const result = await api.getProfile()
    return NextResponse.json(result.data, { status: result.statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to fetch profile',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const customerInput = await request.json()
    const result = await api.updateProfile(customerInput)
    return NextResponse.json(result.data, { status: result.statusCode })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation errors')) {
      return NextResponse.json(
        {
          details: error.message,
          error: 'Validation error',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to update profile',
      },
      { status: 500 }
    )
  }
}
