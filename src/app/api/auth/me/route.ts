import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '@/modules/auth/service'
import { getOrCreateCartForUser } from '@/modules/cart/server'

export async function GET(request: NextRequest) {
  try {
    const accessTokenCookie = request.cookies.get('access_token')
    const accessToken = accessTokenCookie?.value

    if (!accessToken) {
      return NextResponse.json(
        {
          details: 'No access token in cookies',
          error: 'Not authenticated',
        },
        { status: 401 }
      )
    }

    const trimmedToken = accessToken.trim()
    if (!trimmedToken) {
      return NextResponse.json(
        { details: 'Empty access token', error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (!process.env.SHOPIFY_SHOP_ID || !process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
      return NextResponse.json(
        { details: 'Missing environment variables', error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const authConfig = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    const authService = new AuthService(authConfig)
    let session = await authService.getSessionByAccessToken(trimmedToken)
    let refreshed = false

    if (!session) {
      const refreshToken = request.cookies.get('refresh_token')?.value.trim()
      if (refreshToken) {
        try {
          const refreshedSession = await authService.refreshSession(refreshToken)
          if (refreshedSession) {
            session = refreshedSession
            refreshed = true
          }
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError)
        }
      }

      if (!session) {
        return NextResponse.json(
          {
            details: 'Token expired or not found in database',
            error: 'Invalid session',
            suggestion: 'Please login again',
          },
          { status: 401 }
        )
      }
    }

    let cart = null
    try {
      if (session.user.id && session.user.email) {
        cart = await getOrCreateCartForUser(session.user.id, session.user.email)
      }
    } catch (cartError) {
      console.error('Error getting cart:', cartError)
    }

    const responseData = {
      cart,
      expiresAt: session.tokens.expiresAt,
      refreshed,
      user: session.user,
    }

    if (refreshed) {
      const response = NextResponse.json(responseData)

      const tokenExpiresInSeconds = Math.floor(
        (session.tokens.expiresAt.getTime() - Date.now()) / 1000
      )
      const accessTokenCookieOptions = {
        httpOnly: true,
        maxAge: Math.max(tokenExpiresInSeconds, 0),
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      }

      const refreshTokenCookieOptions = {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax' as const,
        secure: process.env.NODE_ENV === 'production',
      }

      response.cookies.set('access_token', session.tokens.accessToken, accessTokenCookieOptions)
      if (session.tokens.refreshToken) {
        response.cookies.set(
          'refresh_token',
          session.tokens.refreshToken,
          refreshTokenCookieOptions
        )
      }

      return response
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Failed to get user:', error)
    return NextResponse.json(
      {
        details: error instanceof Error ? error.message : 'Unknown error',
        error: 'Failed to get user',
      },
      { status: 500 }
    )
  }
}
