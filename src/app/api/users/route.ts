import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
    if (!session || !session.user.permissions.includes('manage_users')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const isActive = searchParams.get('isActive');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const where: PrismaClient['user']['findMany']['arguments']['where'] = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (isActive !== null && isActive !== '') {
      where.isActive = isActive === 'true';
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role
          }
        }
      };
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
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
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });

    const transformedUsers = users.map(user => ({
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
    }));

    const pagination = {
      page,
      limit,
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    };

    return NextResponse.json({
      users: transformedUsers,
      pagination
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}