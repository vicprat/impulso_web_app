import { type NextRequest, NextResponse } from 'next/server'

import { getServerSession } from '@/modules/auth/server/server'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()

    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { query, variables } = await request.json()

    const apiUrl = `https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`

    const headers = {
      Accept: 'application/json',
      Authorization: session.tokens.accessToken,
      'Content-Type': 'application/json',
    }

    const requestBody = JSON.stringify({
      query,
      variables: variables || {},
    })

    const response = await fetch(apiUrl, {
      body: requestBody,
      headers,
      method: 'POST',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Shopify API error:', {
        body: errorText.substring(0, 500),
        status: response.status,
        statusText: response.statusText,
      })

      return NextResponse.json(
        {
          details: errorText,
          error: `Shopify API error: ${response.status} ${response.statusText}`,
          status: response.status,
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return NextResponse.json(
        {
          error: 'GraphQL errors',
          graphqlErrors: data.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Customer GraphQL API error:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to execute GraphQL query',
      },
      { status: 500 }
    )
  }
}
