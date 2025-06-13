import { NextRequest, NextResponse } from 'next/server';
import { isPublicRoute, getRouteMeta } from '@/config/routes';

// Cache para evitar múltiples verificaciones
const tokenVerificationCache = new Map<string, { valid: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; 

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas API sin verificación
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos y assets
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Obtener metadata de la ruta actual
  const routeMeta = getRouteMeta(pathname);
  
  // Si es una ruta pública, permitir acceso
  if (isPublicRoute(pathname)) {
    // Si hay un usuario autenticado intentando acceder a login, redirigir a dashboard
    const accessToken = request.cookies.get('access_token')?.value;
    if (accessToken && pathname === '/auth/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // A partir de aquí, la ruta requiere autenticación
  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Si no hay token, redirigir a login
  if (!accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar validez del token (con cache para evitar múltiples llamadas)
    let isValid = await verifyTokenWithCache(accessToken);
    
    if (!isValid && refreshToken) {
      // Intentar refrescar el token
      const newTokens = await refreshTokens(refreshToken);
      
      if (newTokens) {
        // Crear respuesta con nuevos tokens
        const response = NextResponse.next();
        
        const accessTokenOptions = {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax' as const,
          maxAge: 60 * 60, // 1 hora
          path: '/',
        };

        const refreshTokenOptions = {
          ...accessTokenOptions,
          maxAge: 30 * 24 * 60 * 60, // 30 días
        };

        response.cookies.set('access_token', newTokens.accessToken, accessTokenOptions);
        response.cookies.set('refresh_token', newTokens.refreshToken, refreshTokenOptions);
        
        // Limpiar cache del token anterior
        tokenVerificationCache.delete(accessToken);
        
        // Actualizar para verificaciones subsiguientes
        isValid = true;
      }
    }

    if (!isValid) {
      // Token inválido y no se pudo refrescar
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      const response = NextResponse.redirect(loginUrl);
      
      // Limpiar cookies inválidas
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      response.cookies.delete('id_token');
      
      return response;
    }

    // Verificar roles y permisos si la ruta los requiere
    if (routeMeta.requiredRoles || routeMeta.requiredPermissions) {
      const hasAccess = await checkUserAccess(
        accessToken,
        routeMeta.requiredRoles || [],
        routeMeta.requiredPermissions || []
      );

      if (!hasAccess) {
        // Si no tiene acceso, redirigir a página de no autorizado
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    
    // En caso de error, redirigir a login por seguridad
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('id_token');
    
    return response;
  }
}

// Verificar token con Shopify (con cache)
async function verifyTokenWithCache(accessToken: string): Promise<boolean> {
  // Verificar cache
  const cached = tokenVerificationCache.get(accessToken);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.valid;
  }

  // Verificar con Shopify
  const isValid = await verifyTokenWithShopify(accessToken);
  
  // Guardar en cache
  tokenVerificationCache.set(accessToken, {
    valid: isValid,
    timestamp: Date.now()
  });

  // Limpiar entradas antiguas del cache
  for (const [token, data] of tokenVerificationCache.entries()) {
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      tokenVerificationCache.delete(token);
    }
  }

  return isValid;
}

// Verificar token con Shopify Customer Account API
async function verifyTokenWithShopify(accessToken: string): Promise<boolean> {
  try {
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || '2025-04';
    
    const response = await fetch(
      `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': accessToken,
        },
        body: JSON.stringify({
          query: `
            query VerifyToken {
              customer {
                id
              }
            }
          `
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Token verification error:', error);
    return false;
  }
}

// Refrescar tokens con Shopify
async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  try {
    const shopId = process.env.SHOPIFY_SHOP_ID;
    const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET;

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId!,
      refresh_token: refreshToken
    });

    const headers: Record<string, string> = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    // Agregar autorización Basic si tenemos client_secret
    if (clientSecret) {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(
      `https://shopify.com/authentication/${shopId}/oauth/token`,
      {
        method: 'POST',
        headers,
        body,
      }
    );

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
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

// Verificar acceso del usuario (roles y permisos)
async function checkUserAccess(
  accessToken: string, 
  requiredRoles: string[], 
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    // Llamar a tu API interna para obtener información del usuario
    // Ya que los roles/permisos están en tu DB local
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/me`, {
      headers: {
        'Cookie': `access_token=${accessToken}`,
      },
    });

    if (!response.ok) {
      return false;
    }

    const { user } = await response.json();
    
    // Verificar roles (si hay roles requeridos)
    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some(role => 
        user.roles.includes(role)
      );
      if (!hasRequiredRole) {
        return false;
      }
    }
    
    // Verificar permisos (todos los permisos requeridos deben estar presentes)
    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission => 
        user.permissions.includes(permission)
      );
      if (!hasAllPermissions) {
        return false;
      }
    }

    return true;
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
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};