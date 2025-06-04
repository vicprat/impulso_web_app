import { AuthService } from '@/modules/auth/service';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const accessTokenCookie = request.cookies.get('access_token');
    const accessToken = accessTokenCookie?.value;

    if (!accessToken) {
      return NextResponse.json(
        { 
          error: 'Not authenticated', 
          details: 'No access token in cookies'
        },
        { status: 401 }
      );
    }

    const trimmedToken = accessToken.trim();
    if (!trimmedToken) {
      return NextResponse.json(
        { error: 'Not authenticated', details: 'Empty access token' },
        { status: 401 }
      );
    }

    if (!process.env.SHOPIFY_SHOP_ID || !process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Server configuration error', details: 'Missing environment variables' },
        { status: 500 }
      );
    }

    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    const authService = new AuthService(authConfig);
    const session = await authService.getSessionByAccessToken(trimmedToken);

    if (!session) {
      const refreshToken = request.cookies.get('refresh_token')?.value?.trim();
      if (refreshToken) {
        try {
          const refreshedSession = await authService.refreshSession(refreshToken);
          if (refreshedSession) {
            const response = NextResponse.json({
              user: refreshedSession.user,
              expiresAt: refreshedSession.tokens.expiresAt,
              refreshed: true
            });
            
            const tokenExpiresInSeconds = Math.floor((refreshedSession.tokens.expiresAt.getTime() - Date.now()) / 1000);
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
            
            response.cookies.set('access_token', refreshedSession.tokens.accessToken, accessTokenCookieOptions);
            if (refreshedSession.tokens.refreshToken) {
              response.cookies.set('refresh_token', refreshedSession.tokens.refreshToken, refreshTokenCookieOptions);
            }
            
            return response;
          }
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
        }
      }
      
      return NextResponse.json(
        { 
          error: 'Invalid session', 
          details: 'Token expired or not found in database',
          suggestion: 'Please login again'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: session.user,
      expiresAt: session.tokens.expiresAt,
      refreshed: false
    });
    
  } catch (error) {
    console.error('Failed to get user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get user', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}