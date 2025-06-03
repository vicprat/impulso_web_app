// src/app/api/auth/me/route.ts - VERSIÓN MEJORADA
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/auth/me - Iniciando verificación de sesión');
    
    // Debugging completo de cookies
    const allCookies = request.cookies.getAll();
    console.log('🍪 Todas las cookies disponibles:', allCookies.map(c => ({
      name: c.name,
      valueLength: c.value?.length || 0,
      valueStart: c.value?.substring(0, 30) || '',
      hasWhitespace: c.value ? c.value !== c.value.trim() : false
    })));
    
    const accessTokenCookie = request.cookies.get('access_token');
    const accessToken = accessTokenCookie?.value;
    
    console.log('🍪 Access token cookie details:', {
      found: !!accessTokenCookie,
      length: accessToken?.length || 0,
      start: accessToken?.substring(0, 50) || '',
      end: accessToken?.substring(accessToken?.length - 10) || '',
      type: typeof accessToken,
      hasWhitespace: accessToken ? accessToken !== accessToken.trim() : false,
      encoding: accessToken ? Buffer.from(accessToken).toString('base64').substring(0, 20) + '...' : 'N/A'
    });

    if (!accessToken) {
      console.log('❌ No access token found in cookies');
      return NextResponse.json(
        { 
          error: 'Not authenticated', 
          details: 'No access token in cookies',
          availableCookies: allCookies.map(c => c.name)
        },
        { status: 401 }
      );
    }

    // Verificar que el token no esté vacío después de trim
    const trimmedToken = accessToken.trim();
    if (!trimmedToken) {
      console.log('❌ Access token is empty after trim');
      return NextResponse.json(
        { error: 'Not authenticated', details: 'Empty access token' },
        { status: 401 }
      );
    }

    // Verificar configuración
    const envCheck = {
      shopId: process.env.SHOPIFY_SHOP_ID ? '✅' : '❌',
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ? '✅' : '❌',
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET ? '✅' : '❌',
      nextAuthUrl: process.env.NEXTAUTH_URL || 'MISSING'
    };
    
    console.log('🔧 Configuración de autenticación:', envCheck);

    if (!process.env.SHOPIFY_SHOP_ID || !process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) {
      console.error('❌ Missing required environment variables');
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
    console.log('🔐 AuthService instanciado, validando token...');
    
    // Intentar obtener sesión
    const session = await authService.getSessionByAccessToken(trimmedToken);

    if (!session) {
      console.log('❌ Sesión inválida - intentando refresh si está disponible...');
      
      // Intentar refresh automático
      const refreshToken = request.cookies.get('refresh_token')?.value?.trim();
      if (refreshToken) {
        console.log('🔄 Intentando renovar sesión con refresh token...');
        try {
          const refreshedSession = await authService.refreshSession(refreshToken);
          if (refreshedSession) {
            console.log('✅ Sesión renovada exitosamente');
            
            // Actualizar cookies con los nuevos tokens
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
              maxAge: 30 * 24 * 60 * 60, // 30 días
              path: '/',
            };
            
            response.cookies.set('access_token', refreshedSession.tokens.accessToken, accessTokenCookieOptions);
            if (refreshedSession.tokens.refreshToken) {
              response.cookies.set('refresh_token', refreshedSession.tokens.refreshToken, refreshTokenCookieOptions);
            }
            
            return response;
          } else {
            console.log('❌ Refresh falló - sesión no válida');
          }
        } catch (refreshError) {
          console.error('❌ Error al renovar sesión:', refreshError);
        }
      } else {
        console.log('❌ No refresh token disponible');
      }
      
      // Si llegamos aquí, no se pudo obtener o renovar la sesión
      console.log('❌ No se pudo obtener sesión válida');
      return NextResponse.json(
        { 
          error: 'Invalid session', 
          details: 'Token expired or not found in database',
          suggestion: 'Please login again'
        },
        { status: 401 }
      );
    }

    console.log('✅ Sesión válida encontrada para usuario:', {
      email: session.user?.email || 'N/A',
      id: session.user?.id || 'N/A',
      roles: session.user?.roles || [],
      expiresAt: session.tokens.expiresAt
    });

    return NextResponse.json({
      user: session.user,
      expiresAt: session.tokens.expiresAt,
      refreshed: false
    });
    
  } catch (error) {
    console.error('❌ Get user failed:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { 
        error: 'Failed to get user', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}