import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    const authService = new AuthService(authConfig);
    const accessToken = request.cookies.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const session = await authService.getSessionByAccessToken(accessToken);
    if (!session) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const userId = params.id;
    
    if (session.user.id !== userId && !session.user.permissions.includes('manage_users')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const transformedUser = {
      id: user.id,
      shopifyCustomerId: user.shopifyCustomerId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastLoginAt: user.lastLoginAt,
      roles: user.roles.map(ur => ur.role.name),
      permissions: Array.from(new Set(
        user.roles.flatMap(ur => 
          ur.role.permissions.map(rp => rp.permission.name)
        )
      ))
    };

    return NextResponse.json(transformedUser);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}