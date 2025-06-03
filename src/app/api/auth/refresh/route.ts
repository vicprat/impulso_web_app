// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Refresh token endpoint called');
    
    const refreshToken = request.cookies.get('refresh_token')?.value?.trim();
    
    if (!refreshToken) {
      console.log('❌ No refresh token found in cookies');
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    console.log('✅ Refresh token found, attempting refresh...');

    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    const authService = new AuthService(authConfig);
    const refreshedSession = await authService.refreshSession(refreshToken);

    if (!refreshedSession) {
      console.log('❌ Refresh session failed');
      return NextResponse.json(
        { error: 'Failed to refresh session' },
        { status: 401 }
      );
    }

    console.log('✅ Session refreshed successfully');

    // Actualizar cookies con los nuevos tokens
    const response = NextResponse.json({
      user: refreshedSession.user,
      expiresAt: refreshedSession.tokens.expiresAt,
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
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/',
    };

    response.cookies.set('access_token', refreshedSession.tokens.accessToken, accessTokenCookieOptions);
    if (refreshedSession.tokens.refreshToken) {
      response.cookies.set('refresh_token', refreshedSession.tokens.refreshToken, refreshTokenCookieOptions);
    }

    return response;
    
  } catch (error) {
    console.error('❌ Refresh failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to refresh session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}