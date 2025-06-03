import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export async function GET() {
  try {
    console.log('🏠 Addresses API - Verificando sesión...');
    const session = await getServerSession();
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.email);

    const query = `
      query GetCustomerAddresses {
        customer {
          addresses {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            zip
            country
          }
        }
      }
    `;

    const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`;

    // ✅ CORREGIDO: Sin "Bearer" prefix
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.tokens.accessToken, // ← SIN "Bearer"
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    console.log('📡 Shopify response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: `Shopify API error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Addresses response received');
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          graphqlErrors: data.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      addresses: data.data.customer.addresses,
    });
  } catch (error) {
    console.error('❌ Get addresses error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch addresses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏠 Create Address API - Verificando sesión...');
    const session = await getServerSession();
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.email);

    const addressInput = await request.json();
    console.log('📝 Address input:', addressInput);

    const mutation = `
      mutation CreateCustomerAddress($address: CustomerAddressInput!) {
        customerAddressCreate(address: $address) {
          customerAddress {
            id
            firstName
            lastName
            company
            address1
            address2
            city
            province
            zip
            country
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`;

    // ✅ CORREGIDO: Sin "Bearer" prefix
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.tokens.accessToken, // ← SIN "Bearer"
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: { address: addressInput },
      }),
    });

    console.log('📡 Shopify response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: `Shopify API error: ${response.status}`,
          details: errorText 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Create address response received');
    
    if (data.errors) {
      console.error('❌ GraphQL errors:', data.errors);
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          graphqlErrors: data.errors 
        },
        { status: 400 }
      );
    }

    if (data.data.customerAddressCreate.userErrors.length > 0) {
      console.log('⚠️ Validation errors:', data.data.customerAddressCreate.userErrors);
      return NextResponse.json(
        { 
          error: 'Validation error',
          userErrors: data.data.customerAddressCreate.userErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      address: data.data.customerAddressCreate.customerAddress,
    });
  } catch (error) {
    console.error('❌ Create address error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

