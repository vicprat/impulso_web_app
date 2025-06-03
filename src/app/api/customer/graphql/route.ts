// app/api/customer/graphql/route.ts - VERSIÓN CORREGIDA
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 GraphQL API - Verificando sesión...');
    const session = await getServerSession();
    
    if (!session) {
      console.log('❌ No session found');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('✅ Session found for user:', session.user.email);

    const { query, variables } = await request.json();
    console.log('📝 GraphQL Query:', query.substring(0, 100) + '...');
    console.log('📝 GraphQL Variables:', variables);

    const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`;
    console.log('🌐 API URL:', apiUrl);

    // ✅ CRÍTICO: Sin "Bearer" prefix para Shopify Customer Account API
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': session.tokens.accessToken, // ← SIN "Bearer"
      'Accept': 'application/json',
    };

    console.log('📋 Request headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': session.tokens.accessToken.substring(0, 20) + '...',
      'Accept': headers['Accept']
    });

    const requestBody = JSON.stringify({
      query,
      variables: variables || {},
    });

    console.log('📤 Request body length:', requestBody.length);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    console.log('📡 Shopify response status:', response.status);
    console.log('📡 Shopify response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Shopify API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 500) // Solo los primeros 500 chars para evitar spam
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
    console.log('✅ GraphQL response received successfully');
    console.log('📊 Response data keys:', Object.keys(data));
    
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

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Customer GraphQL API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute GraphQL query',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}