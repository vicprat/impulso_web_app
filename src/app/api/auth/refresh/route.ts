import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '@/modules/auth/service'
import { getOrCreateCartForUser } from '@/modules/cart/server'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value?.trim()

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 })
    }

    if (!process.env.SHOPIFY_SHOP_ID || !process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const authConfig = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    const authService = new AuthService(authConfig)
    const refreshedSession = await authService.refreshSession(refreshToken)

    if (!refreshedSession) {
      return NextResponse.json({ error: 'Failed to refresh session' }, { status: 401 })
    }

    let cart = null
    try {
      if (refreshedSession.user.id && refreshedSession.user.email) {
        cart = await getOrCreateCartForUser(refreshedSession.user.id, refreshedSession.user.email)
      }
    } catch (cartError) {
      console.error('Error getting cart during refresh:', cartError)
    }

    const response = NextResponse.json({
      cart,
      expiresAt: refreshedSession.tokens.expiresAt,
      refreshed: true,
      user: refreshedSession.user,
    })

    const tokenExpiresInSeconds = Math.floor(
      (refreshedSession.tokens.expiresAt.getTime() - Date.now()) / 1000
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

    response.cookies.set(
      'access_token',
      refreshedSession.tokens.accessToken,
      accessTokenCookieOptions
    )
    if (refreshedSession.tokens.refreshToken) {
      response.cookies.set(
        'refresh_token',
        refreshedSession.tokens.refreshToken,
        refreshTokenCookieOptions
      )
    }

    return response
  } catch (error) {
    console.error('Refresh session error:', error)
    return NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })
  }
}
