import { getServerSession } from '@/modules/auth/server/server';
import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { query, variables } = await request.json();

    const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': session.tokens.accessToken,
      'Accept': 'application/json',
    };

    const requestBody = JSON.stringify({
      query,
      variables: variables || {},
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500)
      });
      
      return NextResponse.json(
        { 
          error: `Shopify API error: ${response.status} ${response.statusText}`,
          details: errorText,
          status: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json(
        { 
          error: 'GraphQL errors',
          graphqlErrors: data.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Customer GraphQL API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute GraphQL query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}