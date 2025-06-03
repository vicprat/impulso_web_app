// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { 
  generateCodeVerifier, 
  generateCodeChallenge, 
  generateState, 
  generateNonce, 
  buildAuthorizationUrl 
} from '@/lib/auth/utils';

export async function GET() {
  try {
    console.log('🚀 Iniciando proceso de login');
    console.log('Environment check:', {
      shopId: process.env.SHOPIFY_SHOP_ID ? '✅' : '❌',
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ? '✅' : '❌',
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET ? '✅' : '❌',
      nextAuthUrl: process.env.NEXTAUTH_URL
    });

    const config = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    console.log('🔧 Config generada:', config);

    // Generar parámetros PKCE y seguridad
    const codeVerifier = await generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    const nonce = generateNonce();

    console.log('🔐 Parámetros de seguridad generados:', {
      codeVerifier: codeVerifier.substring(0, 10) + '...',
      codeChallenge: codeChallenge.substring(0, 10) + '...',
      state,
      nonce
    });

    // Construir URL de autorización
    const authUrl = buildAuthorizationUrl(config, codeChallenge, state, nonce);
    console.log('🌐 URL de autorización:', authUrl);

    // Crear respuesta con cookies seguras para almacenar estado
    const response = NextResponse.redirect(authUrl);
    
    // Configurar cookies httpOnly para seguridad
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 600, // 10 minutos
      path: '/',
    };

    response.cookies.set('oauth_code_verifier', codeVerifier, cookieOptions);
    response.cookies.set('oauth_state', state, cookieOptions);
    response.cookies.set('oauth_nonce', nonce, cookieOptions);

    console.log('🍪 Cookies configuradas correctamente');

    return response;
  } catch (error) {
    console.error('❌ Login initiation failed:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}