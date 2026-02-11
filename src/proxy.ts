import { type NextRequest, NextResponse } from 'next/server'

import { getRouteMeta, isPublicRoute, ROUTES } from '@/config/routes'
const tokenVerificationCache = new Map<string, { valid: boolean; timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // Reduced to 1 minute

function parseJwt(token: string) {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  } catch (e) {
    console.error('Failed to parse JWT:', e)
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const routeMeta = getRouteMeta(pathname)

  if (isPublicRoute(pathname)) {
    const accessToken = request.cookies.get('access_token')?.value
    if (accessToken && pathname === ROUTES.AUTH.LOGIN.PATH) {
      return NextResponse.redirect(new URL(ROUTES.CUSTOMER.DASHBOARD.PATH, request.url))
    }
    return NextResponse.next()
  }

  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  if (!accessToken) {
    console.error('[Middleware] No access token found. Redirecting to login.')
    const loginUrl = new URL(ROUTES.AUTH.LOGIN.PATH, request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const payload = parseJwt(accessToken)
    const now = Math.floor(Date.now() / 1000)
    let isValid = false

    if (payload?.exp) {
      const expiresIn = payload.exp - now
      console.error(
        `[Middleware] Token check: exp=${payload.exp}, now=${now}, expiresIn=${expiresIn}s`
      )

      if (expiresIn < 60) {
        console.log('[Middleware] Token expiring soon or expired. Attempting refresh.')
        if (refreshToken) {
          const newTokens = await refreshTokens(refreshToken)
          if (newTokens) {
            console.log('[Middleware] Token refresh successful.')
            const response = NextResponse.next()

            const newPayload = parseJwt(newTokens.accessToken)
            const newExpiresIn = newPayload?.exp ? newPayload.exp - now : 3600

            const accessTokenOptions = {
              httpOnly: true,
              maxAge: newExpiresIn,
              path: '/',
              sameSite: 'lax' as const,
              secure: process.env.NODE_ENV === 'production',
            }

            const refreshTokenOptions = {
              ...accessTokenOptions,
              maxAge: 30 * 24 * 60 * 60,
            }

            response.cookies.set('access_token', newTokens.accessToken, accessTokenOptions)
            response.cookies.set('refresh_token', newTokens.refreshToken, refreshTokenOptions)

            tokenVerificationCache.set(newTokens.accessToken, {
              timestamp: Date.now(),
              valid: true,
            })

            return response
          } else {
            console.log('[Middleware] Refresh failed.')
          }
        }
      } else {
        isValid = true
      }
    } else {
      console.log('[Middleware] Could not parse token expiry. Falling back to verification.')
    }

    if (isValid) {
      isValid = await verifyTokenWithCache(accessToken)
      if (!isValid) {
        console.log('[Middleware] Token failed revocation check.')
      }
    }

    if (!isValid && refreshToken) {
      console.log('[Middleware] Token invalid. Trying fallback refresh.')
    }

    if (!isValid) {
      console.error('[Middleware] Session invalid. Redirecting to login.')
      const loginUrl = new URL(ROUTES.AUTH.LOGIN.PATH, request.url)
      loginUrl.searchParams.set('redirect', pathname)

      const response = NextResponse.redirect(loginUrl)

      response.cookies.delete('access_token')
      response.cookies.delete('refresh_token')
      response.cookies.delete('id_token')

      return response
    }

    if (routeMeta.requiredRoles || routeMeta.requiredPermissions) {
      const hasAccess = await checkUserAccess(
        accessToken,
        [...(routeMeta.requiredRoles ?? [])],
        [...(routeMeta.requiredPermissions ?? [])]
      )

      if (!hasAccess) {
        console.error('[Middleware] User lacks required permissions.')
        return NextResponse.redirect(new URL(ROUTES.UTILITY.UNAUTHORIZED.PATH, request.url))
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error)

    const loginUrl = new URL(ROUTES.AUTH.LOGIN.PATH, request.url)
    loginUrl.searchParams.set('redirect', pathname)

    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')
    response.cookies.delete('id_token')

    return response
  }
}

async function verifyTokenWithCache(accessToken: string): Promise<boolean> {
  const cached = tokenVerificationCache.get(accessToken)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.valid
  }

  console.error('[Middleware] Verifying token with Shopify...')
  const isValid = await verifyTokenWithShopify(accessToken)
  console.error(`[Middleware] Token verification result: ${isValid}`)

  tokenVerificationCache.set(accessToken, {
    timestamp: Date.now(),
    valid: isValid,
  })

  // Cleanup old cache entries
  for (const [token, data] of tokenVerificationCache.entries()) {
    if (Date.now() - data.timestamp > CACHE_DURATION) {
      tokenVerificationCache.delete(token)
    }
  }

  return isValid
}

async function verifyTokenWithShopify(accessToken: string): Promise<boolean> {
  try {
    const shopId = process.env.SHOPIFY_SHOP_ID
    const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2025-04'

    const response = await fetch(
      `https://shopify.com/${shopId}/account/customer/api/${apiVersion}/graphql`,
      {
        body: JSON.stringify({
          query: `
            query VerifyToken {
              customer {
                id
              }
            }
          `,
        }),
        headers: {
          Authorization: accessToken,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    )

    return response.ok
  } catch (error) {
    console.error('[Middleware] Token verification error:', error)
    return false
  }
}

async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
} | null> {
  try {
    console.error('[Middleware] Refreshing tokens...')
    const shopId = process.env.SHOPIFY_SHOP_ID
    const clientId = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID
    const clientSecret = process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET

    const body = new URLSearchParams({
      client_id: clientId!,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    })

    const headers: Record<string, string> = {
      'content-type': 'application/x-www-form-urlencoded',
    }

    if (clientSecret) {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      headers['Authorization'] = `Basic ${credentials}`
    }

    const response = await fetch(`https://shopify.com/authentication/${shopId}/oauth/token`, {
      body,
      headers,
      method: 'POST',
    })

    if (!response.ok) {
      console.error('[Middleware] Token refresh failed:', response.status)
      return null
    }

    const data = await response.json()

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    }
  } catch (error) {
    console.error('[Middleware] Token refresh error:', error)
    return null
  }
}

async function checkUserAccess(
  accessToken: string,
  requiredRoles: string[],
  requiredPermissions: string[]
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/me`, {
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
    })

    if (!response.ok) {
      return false
    }

    const { user } = await response.json()

    if (requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => user.roles.includes(role))
      if (!hasRequiredRole) {
        return false
      }
    }

    if (requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.some((permission) =>
        user.permissions.includes(permission)
      )
      if (!hasAllPermissions) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error('Permission check error:', error)
    return false
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
}
