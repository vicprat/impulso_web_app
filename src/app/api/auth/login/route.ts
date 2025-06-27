import { NextResponse } from 'next/server'

import {
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from '@/modules/auth/utils'

export async function GET() {
  try {
    const config = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    const codeVerifier = await generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    const state = generateState()
    const nonce = generateNonce()

    const authUrl = buildAuthorizationUrl(config, codeChallenge, state, nonce)
    const response = NextResponse.redirect(authUrl)

    const cookieOptions = {
      httpOnly: true,
      maxAge: 600,
      path: '/',
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
    }

    response.cookies.set('oauth_code_verifier', codeVerifier, cookieOptions)
    response.cookies.set('oauth_state', state, cookieOptions)
    response.cookies.set('oauth_nonce', nonce, cookieOptions)

    return response
  } catch {
    return NextResponse.json({ error: 'Failed to initiate login' }, { status: 500 })
  }
}
