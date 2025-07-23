import { cookies } from 'next/headers'

import { AuthService, type AuthSession } from '../service'

export interface AuthConfig {
  shopId: string
  clientId: string
  clientSecret: string | undefined
  redirectUri: string
}

export type ServerSession = AuthSession | null

export async function getServerSession(): Promise<ServerSession> {
  const cookieStore = cookies()
  const accessToken = (await cookieStore).get('access_token')?.value

  if (!accessToken) {
    return null
  }

  try {
    const authConfig: AuthConfig = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    const authService = new AuthService(authConfig)
    return await authService.getSessionByAccessToken(accessToken)
  } catch (error) {
    console.error('Server session error:', error)
    return null
  }
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getServerSession()

  if (!session) {
    throw new Error('Authentication required')
  }

  return session
}

export async function requirePermission(permissions: string | string[]): Promise<AuthSession> {
  const session = await requireAuth()

  const authConfig: AuthConfig = {
    clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
    clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    shopId: process.env.SHOPIFY_SHOP_ID!,
  }

  const authService = new AuthService(authConfig)

  const permissionsToCheck = Array.isArray(permissions) ? permissions : [permissions]

  let hasAnyPermission = false
  for (const perm of permissionsToCheck) {
    if (await authService.hasPermission(session.user.id, perm)) {
      hasAnyPermission = true
      break
    }
  }

  if (!hasAnyPermission) {
    throw new Error(`Permission required: ${permissionsToCheck.join(' or ')}`)
  }

  return session
}
