import { PrismaClient } from '@prisma/client'
import { type NextRequest, NextResponse } from 'next/server'

import { AuthService } from '@/modules/auth/service'

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const userId = params.id

    if (session.user.id !== userId && !session.user.permissions.includes('manage_users')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const transformedUser = {
      createdAt: user.createdAt,
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      lastName: user.lastName,
      permissions: Array.from(
        new Set(user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.name)))
      ),
      roles: user.roles.map((ur) => ur.role.name),
      shopifyCustomerId: user.shopifyCustomerId,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
