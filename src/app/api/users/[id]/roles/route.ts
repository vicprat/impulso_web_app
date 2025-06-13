import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/modules/auth/service';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

export async function PATCH(
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
    if (!session || !session.user.permissions.includes('manage_roles')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const targetUserId = params.id;
    const { roles } = await request.json();

    if (!Array.isArray(roles)) {
      return NextResponse.json({ error: 'Roles debe ser un array' }, { status: 400 });
    }

    const existingRoles = await prisma.role.findMany({
      where: { name: { in: roles } }
    });

    if (existingRoles.length !== roles.length) {
      return NextResponse.json({ error: 'Algunos roles no existen' }, { status: 400 });
    }

    const hasAdminRole = session.user.roles.includes('admin');
    const hasSuperAdminRole = session.user.roles.includes('super_admin');

    if (!hasSuperAdminRole) {
      const restrictedRoles = ['admin', 'super_admin'];
      const hasRestrictedRole = roles.some(role => restrictedRoles.includes(role));
      
      if (hasRestrictedRole && !hasAdminRole) {
        return NextResponse.json({ 
          error: 'No tienes permisos para asignar roles administrativos' 
        }, { status: 403 });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: { userId: targetUserId }
      });

      const roleRecords = await tx.role.findMany({
        where: { name: { in: roles } }
      });

      await tx.userRole.createMany({
        data: roleRecords.map(role => ({
          userId: targetUserId,
          roleId: role.id,
          assignedBy: session.user.id
        }))
      });
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating user roles:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}