import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export async function GET() {
  try {
    console.log('👤 Profile API - Verificando sesión...');
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
      query GetCustomerProfile {
        customer {
          id
          firstName
          lastName
          emailAddress {
            emailAddress
          }
          phoneNumber {
            phoneNumber
          }
          createdAt
          updatedAt
          acceptsMarketing
          defaultAddress {
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
            phone
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
    console.log('✅ Profile response received');
    
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
      customer: data.data.customer,
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('👤 Update Profile API - Verificando sesión...');
    const session = await getServerSession();
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.email);

    const customerInput = await request.json();
    console.log('📝 Customer input:', customerInput);

    const mutation = `
      mutation UpdateCustomer($input: CustomerUpdateInput!) {
        customerUpdate(input: $input) {
          customer {
            id
            firstName
            lastName
            emailAddress {
              emailAddress
            }
            phoneNumber {
              phoneNumber
            }
            acceptsMarketing
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
        variables: { input: customerInput },
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
    console.log('✅ Update profile response received');
    
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

    if (data.data.customerUpdate.userErrors.length > 0) {
      console.log('⚠️ Validation errors:', data.data.customerUpdate.userErrors);
      return NextResponse.json(
        { 
          error: 'Validation error',
          userErrors: data.data.customerUpdate.userErrors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      customer: data.data.customerUpdate.customer,
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}