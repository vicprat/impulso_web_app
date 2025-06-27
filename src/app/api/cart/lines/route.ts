import { NextResponse } from 'next/server'

import { handleGraphQLErrors } from '@/lib/graphql'
import { makeStorefrontRequest } from '@/lib/shopify'
import { getServerSession } from '@/modules/auth/server/server'
import {
  ADD_TO_CART_MUTATION,
  UPDATE_CART_LINES_MUTATION,
  REMOVE_FROM_CART_MUTATION,
} from '@/modules/cart/queries'
import { getOrCreateCartForUser } from '@/modules/cart/server'
import { type CartLineInput, type CartLineUpdateInput } from '@/modules/cart/types'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const lines = (await request.json()) as CartLineInput[]

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Cart lines are required' }, { status: 400 })
    }

    for (const line of lines) {
      if (!line.merchandiseId || typeof line.quantity !== 'number' || line.quantity <= 0) {
        return NextResponse.json(
          {
            details: 'Each line must have merchandiseId and positive quantity',
            error: 'Invalid cart line data',
          },
          { status: 400 }
        )
      }
    }

    const cart = await getOrCreateCartForUser(session.user.id, session.user.email)

    console.log('Adding to cart:', { cartId: cart.id, lines })

    const data = await makeStorefrontRequest(ADD_TO_CART_MUTATION, {
      cartId: cart.id,
      lines,
    })

    if (!data.cartLinesAdd) {
      throw new Error('cartLinesAdd mutation failed - no response data')
    }

    handleGraphQLErrors(data.cartLinesAdd.userErrors)

    return NextResponse.json(data.cartLinesAdd.cart)
  } catch (error) {
    console.error('Cart add error:', error)
    return NextResponse.json(
      {
        details: (error as Error).message,
        error: 'Failed to add items to cart',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const lines = (await request.json()) as CartLineUpdateInput[]

    if (!lines || !Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: 'Cart lines are required' }, { status: 400 })
    }

    for (const line of lines) {
      if (!line.id || typeof line.quantity !== 'number' || line.quantity < 0) {
        return NextResponse.json(
          {
            details: 'Each line must have id and non-negative quantity',
            error: 'Invalid cart line data',
          },
          { status: 400 }
        )
      }
    }

    const cart = await getOrCreateCartForUser(session.user.id, session.user.email)

    console.log('Updating cart lines:', { cartId: cart.id, lines })

    const data = await makeStorefrontRequest(UPDATE_CART_LINES_MUTATION, {
      cartId: cart.id,
      lines,
    })

    if (!data.cartLinesUpdate) {
      throw new Error('cartLinesUpdate mutation failed - no response data')
    }

    handleGraphQLErrors(data.cartLinesUpdate.userErrors)

    return NextResponse.json(data.cartLinesUpdate.cart)
  } catch (error) {
    console.error('Cart update error:', error)
    return NextResponse.json(
      {
        details: (error as Error).message,
        error: 'Failed to update cart lines',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { lineIds } = await request.json()
    if (!lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
      return NextResponse.json({ error: 'Line IDs are required' }, { status: 400 })
    }

    const cart = await getOrCreateCartForUser(session.user.id, session.user.email)

    console.log('Removing from cart:', { cartId: cart.id, lineIds })

    const data = await makeStorefrontRequest(REMOVE_FROM_CART_MUTATION, {
      cartId: cart.id,
      lineIds,
    })

    if (!data.cartLinesRemove) {
      throw new Error('cartLinesRemove mutation failed - no response data')
    }

    handleGraphQLErrors(data.cartLinesRemove.userErrors)

    return NextResponse.json(data.cartLinesRemove.cart)
  } catch (error) {
    console.error('Cart remove error:', error)
    return NextResponse.json(
      {
        details: (error as Error).message,
        error: 'Failed to remove items from cart',
      },
      { status: 500 }
    )
  }
}
