import { PrismaClient } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '@/modules/auth/service'

const prisma = new PrismaClient()

export async function PATCH(request: NextRequest) {
  try {
    const authConfig = {
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
      shopId: process.env.SHOPIFY_SHOP_ID!,
    }

    const authService = new AuthService(authConfig)
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = await authService.getSessionByAccessToken(accessToken)
    if (!session) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    const { firstName, lastName } = await request.json()

    const updatedUser = await prisma.user.update({
      data: {
        firstName,
        lastName,
        updatedAt: new Date(),
      },
      where: { id: session.user.id },
    })

    return NextResponse.json({
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      id: updatedUser.id,
      lastName: updatedUser.lastName,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
