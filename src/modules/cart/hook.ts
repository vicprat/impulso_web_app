import { useState } from 'react'
import { toast } from 'sonner'

import { api } from './api'
import { type CartLineInput, type CartLineUpdateInput } from './types'

import { useAuth } from '@/modules/auth/context/useAuth'

export function useCart() {
  const { cart, isAuthenticated, isLoading } = useAuth()

  return {
    data: cart,
    error: null,
    isEnabled: isAuthenticated,
    isLoading,
  }
}

export function useAddToCart() {
  const { updateCart } = useAuth()
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (lines: CartLineInput[]) => {
    setIsPending(true)
    try {
      const updatedCart = await api.addToCart(lines)
      updateCart(updatedCart)
      toast.success('Producto agregado al carrito')
      return updatedCart
    } catch (error) {
      toast.error(`Error adding to cart: ${(error as Error).message}`)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    isPending,
    mutateAsync,
  }
}

export function useUpdateCartLines() {
  const { updateCart } = useAuth()
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (lines: CartLineUpdateInput[]) => {
    setIsPending(true)
    try {
      const updatedCart = await api.updateCartLines(lines)
      updateCart(updatedCart)
      return updatedCart
    } catch (error) {
      toast.error(`Error updating cart lines: ${(error as Error).message}`)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    isPending,
    mutateAsync,
  }
}

export function useRemoveFromCart() {
  const { updateCart } = useAuth()
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (lineIds: string[]) => {
    setIsPending(true)
    try {
      const updatedCart = await api.removeFromCart(lineIds)
      updateCart(updatedCart)
      toast.success('Producto eliminado del carrito')
      return updatedCart
    } catch (error) {
      toast.error(`Error removing from cart: ${(error as Error).message}`)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    isPending,
    mutateAsync,
  }
}

export function useApplyDiscountCode() {
  const { updateCart } = useAuth()
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (params: { cartId: string; discountCodes: string[] }) => {
    setIsPending(true)
    try {
      const updatedCart = await api.applyDiscountCode(params.cartId, params.discountCodes)
      updateCart(updatedCart)
      toast.success('Código de descuento aplicado')
      return updatedCart
    } catch (error) {
      toast.error(`Error applying discount code: ${(error as Error).message}`)
      throw error
    } finally {
      setIsPending(false)
    }
  }

  return {
    isPending,
    mutateAsync,
  }
}

export function useCartActions() {
  const { data: cart, error, isLoading } = useCart()
  const addToCart = useAddToCart()
  const updateCartLines = useUpdateCartLines()
  const removeFromCart = useRemoveFromCart()
  const applyDiscountCode = useApplyDiscountCode()

  const addProduct = async (variantId: string, quantity = 1) => {
    if (!cart) {
      toast.error('Cart not available')
      return
    }

    const lines: CartLineInput[] = [
      {
        merchandiseId: variantId,
        quantity,
      },
    ]

    try {
      await addToCart.mutateAsync(lines)
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) {
      toast.error('Cart not available')
      return
    }

    const lines: CartLineUpdateInput[] = [
      {
        id: lineId,
        quantity,
      },
    ]

    try {
      await updateCartLines.mutateAsync(lines)
    } catch (error) {
      console.error('Error updating quantity:', error)
      throw error
    }
  }

  const removeProduct = async (lineId: string) => {
    if (!cart) {
      toast.error('Cart not available')
      return
    }

    try {
      await removeFromCart.mutateAsync([lineId])
    } catch (error) {
      console.error('Error removing product:', error)
      throw error
    }
  }

  const applyDiscount = async (code: string) => {
    if (!cart) {
      toast.error('Cart not available')
      return
    }

    try {
      await applyDiscountCode.mutateAsync({
        cartId: cart.id,
        discountCodes: [code],
      })
    } catch (error) {
      console.error('Error applying discount:', error)
      throw error
    }
  }

  const cartSummary = cart
    ? {
        isEmpty: cart.totalQuantity === 0,
        itemCount: cart.totalQuantity,
        lines: cart.lines.edges.map((edge) => edge.node),
        subtotal: cart.cost.subtotalAmount,
        tax: cart.cost.totalTaxAmount,
        total: cart.cost.totalAmount,
      }
    : null

  return {
    addProduct,
    applyDiscount,
    cart,
    cartSummary,
    error,
    isAdding: addToCart.isPending,
    isApplyingDiscount: applyDiscountCode.isPending,
    isLoading,
    isRemoving: removeFromCart.isPending,
    isUpdating: updateCartLines.isPending,
    removeProduct,
    updateQuantity,
  }
}

export function useCartStatus() {
  const { cart, isAuthenticated, isLoading } = useAuth()

  return {
    hasItems: (cart?.totalQuantity ?? 0) > 0,
    isAuthenticated,
    isEmpty: cart?.totalQuantity === 0 || !cart,
    isLoading,
    itemCount: cart?.totalQuantity ?? 0,
    total: cart?.cost.totalAmount,
  }
}
