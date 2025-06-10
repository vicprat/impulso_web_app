import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { storeClient } from '@/lib/shopify';
import { GET_CHECKOUT_QUERY } from '@/modules/customer/checkout-queries';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const checkoutId = searchParams.get('checkoutId');

    if (!checkoutId) {
      return NextResponse.json(
        { error: 'Checkout ID is required' },
        { status: 400 }
      );
    }

    const { data, errors } = await storeClient.request(GET_CHECKOUT_QUERY, {
      variables: { id: checkoutId }
    });

    if (errors) {
      console.error('Get checkout errors:', errors);
      return NextResponse.json(
        { error: 'Failed to get checkout', details: errors },
        { status: 400 }
      );
    }

    const checkout = data.node;
    if (!checkout) {
      return NextResponse.json(
        { error: 'Checkout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      availableShippingRates: checkout.availableShippingRates,
      success: true
    });

  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get shipping rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}