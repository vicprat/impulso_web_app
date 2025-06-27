import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '@/modules/auth/service'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('access_token')?.value
    const permission = request.nextUrl.searchParams.get('permission')

    if (!accessToken) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    if (!permission) {
      return NextResponse.json({ error: 'Permission parameter required' }, { status: 400 })
    }

    const authConfig = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    const authService = new AuthService(authConfig)
    const session = await authService.getSessionByAccessToken(accessToken)

    if (!session) {
      return NextResponse.json({ hasPermission: false }, { status: 401 })
    }

    const hasPermission = await authService.hasPermission(session.user.id, permission)

    return NextResponse.json({ hasPermission })
  } catch {
    return NextResponse.json({ hasPermission: false }, { status: 500 })
  }
}
