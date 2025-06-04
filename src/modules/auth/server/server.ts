import { cookies } from 'next/headers';
import { AuthService } from '../service';

export async function getServerSession() {
  const cookieStore = cookies();
  const accessToken = (await cookieStore).get('access_token')?.value;

  if (!accessToken) {
    return null;
  }

  try {
    const authConfig = {
      shopId: process.env.SHOPIFY_SHOP_ID!,
      clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
      clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
      redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
    };

    const authService = new AuthService(authConfig);
    return await authService.getSessionByAccessToken(accessToken);
  } catch (error) {
    console.error('Server session error:', error);
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}

export async function requirePermission(permission: string) {
  const session = await requireAuth();
  
  const authConfig = {
    shopId: process.env.SHOPIFY_SHOP_ID!,
    clientId: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID!,
    clientSecret: process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET,
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
  };

  const authService = new AuthService(authConfig);
  const hasPermission = await authService.hasPermission(session.user.id, permission);
  
  if (!hasPermission) {
    throw new Error(`Permission required: ${permission}`);
  }
  
  return session;
}