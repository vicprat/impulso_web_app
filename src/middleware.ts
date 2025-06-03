import { NextRequest, NextResponse } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/orders',
  '/account',
  '/admin',
];

// Rutas que requieren permisos específicos
const permissionRoutes: Record<string, string[]> = {
  '/admin': ['access_admin'],
  '/orders/manage': ['manage_orders'],
};

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/auth/login',
  '/products',
  '/collections',
  '/about',
  '/contact',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas API sin verificación de middleware
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Verificar si la ruta es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  // Obtener tokens de las cookies
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Si es una ruta pública y no hay token, permitir acceso
  if (isPublicRoute && !accessToken) {
    return NextResponse.next();
  }

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute && !accessToken) {
    // Redirigir a login si no hay token
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si tenemos token, verificar su validez
  if (accessToken) {
    try {
      // Para Shopify Customer Account API, los tokens son opacos
      // En lugar de verificar el JWT localmente, podemos verificar con la API
      const isValid = await verifyTokenWithShopify(accessToken);
      
      if (!isValid) {
        // Intentar refrescar el token
        if (refreshToken) {
          const newTokens = await refreshTokens(refreshToken);
          
          if (newTokens) {
            // Crear respuesta con nuevos tokens
            const response = NextResponse.next();
            
            const cookieOptions = {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax' as const,
              maxAge: 30 * 24 * 60 * 60,
              path: '/',
            };

            response.cookies.set('access_token', newTokens.accessToken, cookieOptions);
            response.cookies.set('refresh_token', newTokens.refreshToken, cookieOptions);
            
            return response;
          }
        }

        // Si no se pudo refrescar, redirigir a login
        if (isProtectedRoute) {
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          
          const response = NextResponse.redirect(loginUrl);
          
          // Limpiar cookies inválidas
          response.cookies.delete('access_token');
          response.cookies.delete('refresh_token');
          response.cookies.delete('id_token');
          
          return response;
        }
      }

      // Verificar permisos específicos si la ruta lo requiere
      const requiredPermissions = permissionRoutes[pathname];
      if (requiredPermissions) {
        const hasPermissions = await checkUserPermissions(accessToken, requiredPermissions);
        
        if (!hasPermissions) {
          return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      
      if (isProtectedRoute) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        return response;
      }
    }
  }

  return NextResponse.next();
}

// Verificar token con Shopify
async function verifyTokenWithShopify(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(`https://shopify.com/${process.env.SHOPIFY_SHOP_ID}/account/customer/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: 'query { customer { id } }'
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Refrescar tokens
async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      refresh_token: refreshToken
    });

    const headers: Record<string, string> = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    // Agregar autorización si tenemos client_secret
    if (process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET) {
      const credentials = Buffer.from(
        `${process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID}:${process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET}`
      ).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(`https://shopify.com/authentication/${process.env.SHOPIFY_SHOP_ID}/oauth/token`, {
      method: 'POST',
      headers,
      body,
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

// Verificar permisos del usuario
async function checkUserPermissions(accessToken: string, requiredPermissions: string[]): Promise<boolean> {
  try {
    // Esto debería llamar a tu API interna para verificar permisos
    // ya que la información de roles/permisos está en tu DB local
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const { user } = await response.json();
    
    // Verificar si el usuario tiene todos los permisos requeridos
    return requiredPermissions.every(permission => 
      user.permissions.includes(permission)
    );
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
