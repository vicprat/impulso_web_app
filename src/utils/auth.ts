import { AuthService } from "@/lib/auth/service";
import { NextRequest, NextResponse } from "next/server";

export async function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const accessToken = req.cookies.get('access_token')?.value?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authService = new AuthService({
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    });

    const session = await authService.getSessionByAccessToken(accessToken);
    if (!session?.user.permissions.includes(permission)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).user = session.user;
    return null;
  };
}