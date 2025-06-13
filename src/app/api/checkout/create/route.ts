import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { storeClient } from '@/lib/shopify';
import { CREATE_CHECKOUT_MUTATION } from '@/modules/checkout/queries';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { cartId, email } = await request.json();

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }

     const { data, errors } = await storeClient.request(CREATE_CHECKOUT_MUTATION, {
      variables: {
        cartId,
        buyerIdentity: {
          email: email || session.user.email,
          countryCode: 'MX'
        }
      }
    });

    if (errors) {
      console.error('Checkout creation errors:', errors);
      return NextResponse.json(
        { error: 'Failed to create checkout', details: errors },
        { status: 400 }
      );
    }

    if (data.cartBuyerIdentityUpdate.userErrors?.length > 0) {
      return NextResponse.json(
        { 
          error: 'Checkout validation errors', 
          details: data.cartBuyerIdentityUpdate.userErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      checkout: {
        webUrl: data.cartBuyerIdentityUpdate.cart.checkoutUrl
      },
      success: true
    });

  } catch (error) {
    console.error('Error creating checkout:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}