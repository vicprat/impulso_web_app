
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { getNonceFromIdToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 CALLBACK: Iniciando proceso de callback');
    console.log('🌐 URL completa:', request.url);
    
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('📊 Parámetros recibidos:', {
      code: code ? `${code.substring(0, 10)}...` : 'null',
      state: state || 'null',
      error: error || 'null'
    });

    // Verificar si hay errores de OAuth
    if (error) {
      console.error('❌ Error de OAuth recibido:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=${encodeURIComponent(error)}`
      );
    }

    // Verificar que tenemos el código
    if (!code) {
      console.error('❌ Código faltante en callback');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=missing_code`
      );
    }

    // Obtener valores de las cookies
    const codeVerifier = request.cookies.get('oauth_code_verifier')?.value;
    const storedState = request.cookies.get('oauth_state')?.value;
    const storedNonce = request.cookies.get('oauth_nonce')?.value;

    console.log('🍪 Cookies encontradas:', {
      codeVerifier: codeVerifier ? '✅' : '❌',
      storedState: storedState || 'null',
      storedNonce: storedNonce ? '✅' : '❌'
    });

    // Verificar estado para prevenir CSRF
    if (!state || !storedState || state !== storedState) {
      console.error('❌ State mismatch:', { received: state, stored: storedState });
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=invalid_state`
      );
    }

    if (!codeVerifier) {
      console.error('❌ Code verifier faltante');
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/auth/login?error=missing_verifier`
      );
    }

    // Configurar servicio de autenticación
    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    console.log('🔧 Configuración de auth:', {
      shopId: authConfig.shopId,
      clientId: authConfig.clientId,
      clientSecret: authConfig.clientSecret ? '✅' : '❌',
      redirectUri: authConfig.redirectUri
    });

    const authService = new AuthService(authConfig);

    console.log('🔐 Intercambiando código por tokens...');
    
    // Autenticar usuario
    const session = await authService.authenticateWithCode(code, codeVerifier);

    console.log('✅ Tokens recibidos:', {
      accessToken: session.tokens.accessToken ? '✅' : '❌',
      refreshToken: session.tokens.refreshToken ? '✅' : '❌',
      idToken: session.tokens.idToken ? '✅' : '❌',
      expiresAt: session.tokens.expiresAt || 'N/A'
    });

    // ⭐ DEBUGGING: Log del token completo para comparar
    console.log('🔍 DEBUG - Token completo para verificación:', {
      accessToken: session.tokens.accessToken,
      length: session.tokens.accessToken.length,
      type: typeof session.tokens.accessToken,
      hasSpecialChars: /[^\w\-\.~]/.test(session.tokens.accessToken)
    });

    // Verificar nonce si está disponible
    if (session.tokens.idToken && storedNonce) {
      const tokenNonce = getNonceFromIdToken(session.tokens.idToken);
      if (tokenNonce !== storedNonce) {
        console.warn('⚠️ Nonce mismatch detected:', { token: tokenNonce, stored: storedNonce });
      } else {
        console.log('✅ Nonce validado correctamente');
      }
    }

    console.log('🍪 Configurando cookies de sesión...');

    // Crear respuesta de redirección
    const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard`);

    // ✅ CORREGIDO: Usar el tiempo real de expiración del token
    const tokenExpiresInSeconds = Math.floor((session.tokens.expiresAt.getTime() - Date.now()) / 1000);
    console.log('⏰ Token expirará en segundos:', tokenExpiresInSeconds);

    // Configurar cookies de sesión con tiempos correctos
    const accessTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: Math.max(tokenExpiresInSeconds, 0), // ✅ Usar expiración real del token
      path: '/',
    };

    const refreshTokenCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 30 * 24 * 60 * 60, // 30 días para refresh token
      path: '/',
    };

    // ⭐ CRÍTICO: Limpiar cualquier encoding y espacios
    const cleanAccessToken = session.tokens.accessToken.trim();
    const cleanRefreshToken = session.tokens.refreshToken.trim();

    console.log('🍪 Estableciendo cookies con valores:', {
      accessTokenLength: cleanAccessToken.length,
      refreshTokenLength: cleanRefreshToken.length,
      accessTokenMaxAge: accessTokenCookieOptions.maxAge,
      refreshTokenMaxAge: refreshTokenCookieOptions.maxAge
    });

    response.cookies.set('access_token', cleanAccessToken, accessTokenCookieOptions);
    response.cookies.set('refresh_token', cleanRefreshToken, refreshTokenCookieOptions);
    
    if (session.tokens.idToken) {
      response.cookies.set('id_token', session.tokens.idToken.trim(), accessTokenCookieOptions);
    }

    // Limpiar cookies temporales
    response.cookies.delete('oauth_code_verifier');
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_nonce');

    // ✅ VERIFICACIÓN INMEDIATA: Verificar que el token se puede encontrar
    console.log('🔍 Verificación inmediata: intentando encontrar la sesión recién creada...');
    try {
      const immediateVerification = await authService.getSessionByAccessToken(cleanAccessToken);
      console.log('✅ Verificación inmediata resultado:', immediateVerification ? 'ENCONTRADA' : 'NO ENCONTRADA');
      if (!immediateVerification) {
        console.error('❌ ALERTA: La sesión no se puede encontrar inmediatamente después de crearla');
      }
    } catch (verifyError) {
      console.error('❌ Error en verificación inmediata:', verifyError);
    }

    console.log('✅ Autenticación completada exitosamente');
    console.log('🔄 Redirigiendo a dashboard...');

    return response;
  } catch (error) {
    console.error('❌ Authentication callback failed:', error);
    console.error('📊 Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/auth/login?error=auth_failed`
    );
  }
}