import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '../service'

export async function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const accessToken = req.cookies.get('access_token')?.value?.trim()
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authService = new AuthService({
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    })

    const session = await authService.getSessionByAccessToken(accessToken)
    if (!session?.user.permissions.includes(permission)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(req as any).user = session.user
    return null
  }
}
