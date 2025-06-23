import { prisma } from '@/lib/prisma';
import { makeStorefrontRequest } from '@/lib/shopify';
import { CREATE_CART_MUTATION, GET_CART_QUERY } from '@/modules/cart/queries';
import { Cart } from '@/modules/cart/types';


export async function getOrCreateCartForUser(userId: string, email: string): Promise<Cart> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { cartId: true },
  });

  if (!user) {
    throw new Error(`User with session ID ${userId} not found in the database.`);
  }

  if (user.cartId) {
    try {
      const { cart } = await makeStorefrontRequest(GET_CART_QUERY, { cartId: user.cartId });
      if (cart) {
        return cart;
      }
    } catch  {
      throw new Error('Cart not found or expired, creating a new one.');
    }
  }

  const input = {
    buyerIdentity: {
      email: email,
      countryCode: 'MX',
    },
  };

  const { cartCreate } = await makeStorefrontRequest(CREATE_CART_MUTATION, { input });

  if (cartCreate.userErrors && cartCreate.userErrors.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(cartCreate.userErrors.map((e: { message: any; }) => e.message).join(', '));
  }
  
  if (!cartCreate.cart) {
    throw new Error('Shopify cartCreate mutation failed to return a cart.');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { cartId: cartCreate.cart.id },
  });

  return cartCreate.cart;
}
