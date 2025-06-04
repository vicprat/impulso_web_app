import { AuthService } from '@/modules/auth/service';
import { getNonceFromIdToken } from '@/modules/auth/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=${encodeURIComponent(error)}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=missing_code`
      );
    }

    const codeVerifier = request.cookies.get('oauth_code_verifier')?.value;
    const storedState = request.cookies.get('oauth_state')?.value;
    const storedNonce = request.cookies.get('oauth_nonce')?.value;

    if (!state || !storedState || state !== storedState) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=invalid_state`
      );
    }

    if (!codeVerifier) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=missing_verifier`
      );
    }

    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    const authService = new AuthService(authConfig);
    
    try {
      const session = await authService.authenticateWithCode(code, codeVerifier);

      if (session.tokens.idToken && storedNonce) {
        const tokenNonce = getNonceFromIdToken(session.tokens.idToken);
        if (tokenNonce !== storedNonce) {
          console.warn('Nonce mismatch detected');
        }
      }

      const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);

      const tokenExpiresInSeconds = Math.floor((session.tokens.expiresAt.getTime() - Date.now()) / 1000);

      const accessTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: Math.max(tokenExpiresInSeconds, 0),
        path: '/',
      };

      const refreshTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
      };

      const cleanAccessToken = session.tokens.accessToken.trim();
      const cleanRefreshToken = session.tokens.refreshToken.trim();

      response.cookies.set('access_token', cleanAccessToken, accessTokenCookieOptions);
      response.cookies.set('refresh_token', cleanRefreshToken, refreshTokenCookieOptions);
      
      if (session.tokens.idToken) {
        response.cookies.set('id_token', session.tokens.idToken.trim(), accessTokenCookieOptions);
      }

      response.cookies.delete('oauth_code_verifier');
      response.cookies.delete('oauth_state');
      response.cookies.delete('oauth_nonce');

      try {
        await authService.getSessionByAccessToken(cleanAccessToken);
      } catch (verifyError) {
        console.error('Error in immediate verification:', verifyError);
      }

      return response;
      
    } catch (authError) {
      console.error('Authentication failed:', authError);
      throw authError;
    }

  } catch (error) {
    console.error('Callback failed:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/login?error=auth_failed`
    );
  }
}