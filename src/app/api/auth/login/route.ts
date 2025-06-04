import { buildAuthorizationUrl, generateCodeChallenge, generateCodeVerifier, generateNonce, generateState } from '@/modules/auth/utils';
import { NextResponse } from 'next/server';


export async function GET() {
  try {
    const config = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    const nonce = generateNonce();

    const authUrl = buildAuthorizationUrl(config, codeChallenge, state, nonce);
    const response = NextResponse.redirect(authUrl);
    
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 600,
      path: '/',
    };

    response.cookies.set('oauth_code_verifier', codeVerifier, cookieOptions);
    response.cookies.set('oauth_state', state, cookieOptions);
    response.cookies.set('oauth_nonce', nonce, cookieOptions);

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}