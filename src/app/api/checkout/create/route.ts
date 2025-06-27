import { type NextRequest, NextResponse } from 'next/server'

import { storeClient } from '@/lib/shopify'
import { getServerSession } from '@/modules/auth/server/server'
import { CREATE_CHECKOUT_MUTATION } from '@/modules/checkout/queries'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { cartId, email } = await request.json()

    if (!cartId) {
      return NextResponse.json({ error: 'Cart ID is required' }, { status: 400 })
    }

    const { data, errors } = await storeClient.request(CREATE_CHECKOUT_MUTATION, {
      variables: {
        buyerIdentity: {
          countryCode: 'MX',
          email: email || session.user.email,
        },
        cartId,
      },
    })

    if (errors) {
      console.error('Checkout creation errors:', errors)
      return NextResponse.json(
        { details: errors, error: 'Failed to create checkout' },
        { status: 400 }
      )
    }

    if (data.cartBuyerIdentityUpdate.userErrors?.length > 0) {
      return NextResponse.json(
        {
          details: data.cartBuyerIdentityUpdate.userErrors,
          error: 'Checkout validation errors',
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      checkout: {
        webUrl: data.cartBuyerIdentityUpdate.cart.checkoutUrl,
      },
      success: true,
    })
  } catch (error) {
    console.error('Error creating checkout:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to create checkout',
      },
      { status: 500 }
    )
  }
}
