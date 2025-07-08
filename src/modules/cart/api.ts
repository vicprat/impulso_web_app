import { handleGraphQLErrors } from '@/src/lib/graphql'
import { makeStorefrontRequest } from '@/src/lib/shopify'

import { APPLY_DISCOUNT_CODE_MUTATION } from './queries'
import { type Cart, type CartLineInput, type CartLineUpdateInput } from './types'

export const api = {
  addToCart: async (lines: CartLineInput[]): Promise<Cart> => {
    const response = await fetch('/api/cart/lines', {
      body: JSON.stringify(lines),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.details ?? 'Failed to add to cart')
    }
    return response.json()
  },

  applyDiscountCode: async (cartId: string, discountCodes: string[]): Promise<Cart> => {
    const data = await makeStorefrontRequest(APPLY_DISCOUNT_CODE_MUTATION, {
      cartId,
      discountCodes,
    })
    handleGraphQLErrors(data.cartDiscountCodesUpdate.userErrors)
    return data.cartDiscountCodesUpdate.cart
  },

  getCart: async (): Promise<Cart | null> => {
    try {
      const response = await fetch('/api/cart', { credentials: 'include' })
      if (!response.ok) {
        if (response.status === 401) return null
        throw new Error('Failed to fetch cart')
      }
      return await response.json()
    } catch (error) {
      console.error('Error getting cart:', error)
      return null
    }
  },

  removeFromCart: async (lineIds: string[]): Promise<Cart> => {
    const response = await fetch('/api/cart/lines', {
      body: JSON.stringify({ lineIds }),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.details ?? 'Failed to remove from cart')
    }
    return response.json()
  },

  updateCartLines: async (lines: CartLineUpdateInput[]): Promise<Cart> => {
    const response = await fetch('/api/cart/lines', {
      body: JSON.stringify(lines),
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.details ?? 'Failed to update cart lines')
    }
    return response.json()
  },
}
