import { AuthService } from '@/modules/auth/service';
import { getOrCreateCartForUser } from '@/modules/cart/server';
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
    let session = await authService.getSessionByAccessToken(trimmedToken);
    let refreshed = false;

    if (!session) {
      const refreshToken = request.cookies.get('refresh_token')?.value?.trim();
      if (refreshToken) {
        try {
          const refreshedSession = await authService.refreshSession(refreshToken);
          if (refreshedSession) {
            session = refreshedSession;
            refreshed = true;
          }
        } catch (refreshError) {
          console.error('Error refreshing session:', refreshError);
        }
      }
      
      if (!session) {
        return NextResponse.json(
          { 
            error: 'Invalid session', 
            details: 'Token expired or not found in database',
            suggestion: 'Please login again'
          },
          { status: 401 }
        );
      }
    }

    let cart = null;
    try {
      if (session.user.id && session.user.email) {
        cart = await getOrCreateCartForUser(session.user.id, session.user.email);
      }
    } catch (cartError) {
      console.error('Error getting cart:', cartError);
    }

    const responseData = {
      user: session.user,
      expiresAt: session.tokens.expiresAt,
      refreshed,
      cart 
    };

    if (refreshed) {
      const response = NextResponse.json(responseData);
      
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
      
      response.cookies.set('access_token', session.tokens.accessToken, accessTokenCookieOptions);
      if (session.tokens.refreshToken) {
        response.cookies.set('refresh_token', session.tokens.refreshToken, refreshTokenCookieOptions);
      }
      
      return response;
    }

    return NextResponse.json(responseData);
    
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