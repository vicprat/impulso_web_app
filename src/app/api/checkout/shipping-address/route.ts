import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { storeClient } from '@/lib/shopify';
import { UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION } from '@/modules/customer/checkout-queries';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { checkoutId, shippingAddress } = await request.json();

    if (!checkoutId || !shippingAddress) {
      return NextResponse.json(
        { error: 'Checkout ID and shipping address are required' },
        { status: 400 }
      );
    }

    const { data, errors } = await storeClient.request(UPDATE_CHECKOUT_SHIPPING_ADDRESS_MUTATION, {
      variables: {
        checkoutId,
        shippingAddress
      }
    });

    if (errors) {
      console.error('Shipping address update errors:', errors);
      return NextResponse.json(
        { error: 'Failed to update shipping address', details: errors },
        { status: 400 }
      );
    }

    if (data.checkoutShippingAddressUpdateV2.checkoutUserErrors?.length > 0) {
      return NextResponse.json(
        { 
          error: 'Shipping address validation errors', 
          details: data.checkoutShippingAddressUpdateV2.checkoutUserErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      checkout: data.checkoutShippingAddressUpdateV2.checkout,
      success: true
    });

  } catch (error) {
    console.error('Error updating shipping address:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update shipping address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
