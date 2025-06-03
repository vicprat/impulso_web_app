import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🛒 Orders API - Verificando sesión...');
    const session = await getServerSession();
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.email);

    const searchParams = request.nextUrl.searchParams;
    const first = parseInt(searchParams.get('first') || '10');
    const after = searchParams.get('after');

    console.log('📊 Query params:', { first, after });

    const query = `
      query GetCustomerOrders($first: Int!, $after: String) {
        customer {
          orders(first: $first, after: $after) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                name
                processedAt
                fulfillmentStatus
                financialStatus
                currentTotalPrice {
                  amount
                  currencyCode
                }
                lineItems(first: 10) {
                  edges {
                    node {
                      title
                      quantity
                      variant {
                        id
                        title
                        image {
                          url
                          altText
                        }
                        price {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
                shippingAddress {
                  firstName
                  lastName
                  address1
                  address2
                  city
                  province
                  zip
                  country
                }
              }
            }
          }
        }
      }
    `;

    const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`;
    console.log('🌐 API URL:', apiUrl);

    // ✅ CORREGIDO: Sin "Bearer" prefix
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session.tokens.accessToken, // ← SIN "Bearer"
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { first, after },
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
    console.log('✅ Orders response received');
    
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

    type OrderEdge = {
      node: {
        id: string;
        name: string;
        processedAt: string;
        fulfillmentStatus: string;
        financialStatus: string;
        currentTotalPrice: {
          amount: string;
          currencyCode: string;
        };
        lineItems: {
          edges: Array<{
            node: {
              title: string;
              quantity: number;
              variant: {
                id: string;
                title: string;
                image: {
                  url: string;
                  altText: string | null;
                } | null;
                price: {
                  amount: string;
                  currencyCode: string;
                };
              } | null;
            };
          }>;
        };
        shippingAddress: {
          firstName: string;
          lastName: string;
          address1: string;
          address2: string | null;
          city: string;
          province: string;
          zip: string;
          country: string;
        } | null;
      };
    };

    return NextResponse.json({
      orders: (data.data.customer.orders.edges as OrderEdge[]).map((edge) => edge.node),
      pageInfo: data.data.customer.orders.pageInfo,
    });
  } catch (error) {
    console.error('❌ Get orders error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
