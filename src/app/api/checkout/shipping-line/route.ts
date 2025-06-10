import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { storeClient } from '@/lib/shopify';
import { UPDATE_CHECKOUT_SHIPPING_LINE_MUTATION } from '@/modules/customer/checkout-queries';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { checkoutId, shippingRateHandle } = await request.json();

    if (!checkoutId || !shippingRateHandle) {
      return NextResponse.json(
        { error: 'Checkout ID and shipping rate handle are required' },
        { status: 400 }
      );
    }

    const { data, errors } = await storeClient.request(UPDATE_CHECKOUT_SHIPPING_LINE_MUTATION, {
      variables: {
        checkoutId,
        shippingRateHandle
      }
    });

    if (errors) {
      console.error('Shipping line update errors:', errors);
      return NextResponse.json(
        { error: 'Failed to update shipping line', details: errors },
        { status: 400 }
      );
    }

    if (data.checkoutShippingLineUpdate.checkoutUserErrors?.length > 0) {
      return NextResponse.json(
        { 
          error: 'Shipping line validation errors', 
          details: data.checkoutShippingLineUpdate.checkoutUserErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      checkout: data.checkoutShippingLineUpdate.checkout,
      success: true
    });

  } catch (error) {
    console.error('Error updating shipping line:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update shipping line',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}