import { type NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/modules/auth/server/server'
import { api } from '@/modules/customer/api'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const first = 10
    const result = await api.getAddresses(first)
    return NextResponse.json({ addresses: result.data }, { status: result.statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to fetch addresses',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const addressInput = await request.json()
    const result = await api.createAddress(addressInput)
    return NextResponse.json({ address: result.data }, { status: result.statusCode })
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
        error: 'Failed to create address',
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

    const { address, id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const result = await api.updateAddress(id, address)
    return NextResponse.json({ address: result.data }, { status: result.statusCode })
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
        error: 'Failed to update address',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 })
    }

    const result = await api.deleteAddress(id)
    return NextResponse.json({ deletedId: result.data.deletedId }, { status: result.statusCode })
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
        error: 'Failed to delete address',
      },
      { status: 500 }
    )
  }
}
