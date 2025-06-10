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
    if (!session || !session.user.permissions.includes('manage_users')) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const targetUserId = params.id;

    await prisma.user.update({
      where: { id: targetUserId },
      data: { 
        isActive: true,
        updatedAt: new Date()
      }
    });


    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error reactivating user:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}