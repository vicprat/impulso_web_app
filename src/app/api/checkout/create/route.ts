import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { storeClient } from '@/lib/shopify';
import { CREATE_CHECKOUT_MUTATION } from '@/modules/customer/checkout-queries';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { cartId, email, shippingAddress } = await request.json();

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    // Primero obtenemos el carrito para extraer los line items
    const getCartQuery = `
      query GetCart {
        customer {
          cart {
            id
            lines(first: 250) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    // Hacer la consulta del carrito usando Customer Account API
    const cartResponse = await fetch(`https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.tokens.accessToken,
      },
      body: JSON.stringify({ query: getCartQuery }),
    });

    if (!cartResponse.ok) {
      throw new Error('Failed to fetch cart data');
    }

    const cartData = await cartResponse.json();
    const cart = cartData.data?.customer?.cart;

    if (!cart) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      );
    }

    // Convertir las líneas del carrito a formato de checkout
    const lineItems = cart.lines.edges.map((edge: any) => ({
      variantId: edge.node.merchandise.id,
      quantity: edge.node.quantity,
    }));

    // Crear el checkout usando Storefront API
    const checkoutInput = {
      lineItems,
      email: email || session.user.email,
      ...(shippingAddress && { shippingAddress }),
    };

    const { data, errors } = await storeClient.request(CREATE_CHECKOUT_MUTATION, {
      variables: {
        input: checkoutInput
      }
    });

    if (errors) {
      console.error('Checkout creation errors:', errors);
      return NextResponse.json(
        { error: 'Failed to create checkout', details: errors },
        { status: 400 }
      );
    }

    if (data.checkoutCreate.checkoutUserErrors?.length > 0) {
      return NextResponse.json(
        { 
          error: 'Checkout validation errors', 
          details: data.checkoutCreate.checkoutUserErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      checkout: data.checkoutCreate.checkout,
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