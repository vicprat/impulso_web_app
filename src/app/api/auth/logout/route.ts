import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '@/modules/auth/service'
import { buildLogoutUrl } from '@/modules/auth/utils'

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value.trim()
    const idToken = request.cookies.get('id_token')?.value.trim()

    const authConfig = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    let dbLogoutSuccess = false
    if (accessToken) {
      try {
        const authService = new AuthService(authConfig)
        dbLogoutSuccess = await authService.logout(accessToken)
      } catch (error) {
        console.error('Database logout error:', error)
      }
    }

    let shopifyLogoutUrl = null
    if (idToken) {
      try {
        const postLogoutRedirectUri = `${process.env.NEXTAUTH_URL}/auth/login?logout=success`
        shopifyLogoutUrl = buildLogoutUrl(authConfig, idToken, postLogoutRedirectUri)
      } catch (error) {
        console.error('Error generating Shopify logout URL:', error)
      }
    }

    const response = NextResponse.json({
      dbLogoutSuccess,
      message: 'Logged out successfully',
      redirectUrl: shopifyLogoutUrl ?? `${process.env.NEXTAUTH_URL}/auth/login?logout=success`,
      shopifyLogoutUrl,
      success: true,
    })

    const cookieOptions = {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    }

    response.cookies.set('access_token', '', cookieOptions)
    response.cookies.set('refresh_token', '', cookieOptions)
    response.cookies.set('id_token', '', cookieOptions)
    response.cookies.set('oauth_state', '', cookieOptions)
    response.cookies.set('oauth_code_verifier', '', cookieOptions)
    response.cookies.set('oauth_nonce', '', cookieOptions)

    return response
  } catch (error) {
    const response = NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Logout failed partially',
        shopifyLogoutUrl: null,
        success: false,
      },
      { status: 500 }
    )

    const cookieOptions = {
      httpOnly: true,
      maxAge: 0,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    }

    response.cookies.set('access_token', '', cookieOptions)
    response.cookies.set('refresh_token', '', cookieOptions)
    response.cookies.set('id_token', '', cookieOptions)

    return response
  }
}

export async function GET() {
  const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/`)

  const cookieOptions = {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }

  response.cookies.set('access_token', '', cookieOptions)
  response.cookies.set('refresh_token', '', cookieOptions)
  response.cookies.set('id_token', '', cookieOptions)

  return response
}
