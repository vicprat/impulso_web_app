import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { buildLogoutUrl } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    console.log('🚪 Logout endpoint called');
    
    const accessToken = request.cookies.get('access_token')?.value?.trim();
    const idToken = request.cookies.get('id_token')?.value?.trim();
    
    console.log('🍪 Tokens found:', {
      accessToken: accessToken ? '✅' : '❌',
      idToken: idToken ? '✅' : '❌'
    });

    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    // Invalidar sesión en la base de datos si tenemos access token
    let dbLogoutSuccess = false;
    if (accessToken) {
      try {
        const authService = new AuthService(authConfig);
        dbLogoutSuccess = await authService.logout(accessToken);
        console.log('🗃️ Database logout:', dbLogoutSuccess ? '✅' : '❌');
      } catch (error) {
        console.error('❌ Database logout error:', error);
      }
    } else {
      console.log('⚠️ No access token found, skipping database logout');
    }

    // Construir URL de logout de Shopify si tenemos ID token
    let shopifyLogoutUrl = null;
    if (idToken) {
      try {
        const postLogoutRedirectUri = `${process.env.NEXTAUTH_URL}/auth/login?logout=success`;
        shopifyLogoutUrl = buildLogoutUrl(authConfig, idToken, postLogoutRedirectUri);
        console.log('🌐 Shopify logout URL generated:', shopifyLogoutUrl);
      } catch (error) {
        console.error('❌ Error generating Shopify logout URL:', error);
      }
    } else {
      console.log('⚠️ No ID token found, no Shopify logout URL generated');
    }

    // Crear respuesta con la información de logout
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully',
      dbLogoutSuccess,
      shopifyLogoutUrl, // ← Tu AuthProvider espera este campo
      redirectUrl: shopifyLogoutUrl || `${process.env.NEXTAUTH_URL}/auth/login?logout=success`
    });

    // Limpiar todas las cookies relacionadas con autenticación
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0 // Expirar inmediatamente
    };

    response.cookies.set('access_token', '', cookieOptions);
    response.cookies.set('refresh_token', '', cookieOptions);
    response.cookies.set('id_token', '', cookieOptions);

    // También limpiar cualquier cookie temporal que pueda quedar
    response.cookies.set('oauth_state', '', cookieOptions);
    response.cookies.set('oauth_code_verifier', '', cookieOptions);
    response.cookies.set('oauth_nonce', '', cookieOptions);

    console.log('✅ Logout completed successfully');
    console.log('🧹 Cookies cleared');

    return response;
    
  } catch (error) {
    console.error('❌ Logout failed:', error);
    
    // Aún así, limpiar cookies en caso de error
    const response = NextResponse.json(
      { 
        error: 'Logout failed partially', 
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
        shopifyLogoutUrl: null
      },
      { status: 500 }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0
    };

    response.cookies.set('access_token', '', cookieOptions);
    response.cookies.set('refresh_token', '', cookieOptions);
    response.cookies.set('id_token', '', cookieOptions);

    return response;
  }
}

// También permitir GET para logout directo desde URL
export async function GET() {
  console.log('🚪 GET logout - redirigiendo a logout completo');
  
  // Para logout directo desde GET, simplemente limpiar cookies y redirigir
  const response = NextResponse.redirect(`${process.env.NEXTAUTH_URL}/`);
  
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0
  };

  response.cookies.set('access_token', '', cookieOptions);
  response.cookies.set('refresh_token', '', cookieOptions);
  response.cookies.set('id_token', '', cookieOptions);

  return response;
}