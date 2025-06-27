import { useState } from 'react';
import { useAuth } from '@/modules/auth/context/useAuth';
import { api } from './api';
import { CartLineInput, CartLineUpdateInput } from './types';
import { toast } from 'sonner';

export function useCart() {
  const { cart, isLoading, isAuthenticated } = useAuth();
  
  return {
    data: cart,
    isLoading,
    error: null,
    isEnabled: isAuthenticated,
  };
}

export function useAddToCart() {
  const { updateCart } = useAuth();
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = async (lines: CartLineInput[]) => {
    setIsPending(true);
    try {
      const updatedCart = await api.addToCart(lines);
      updateCart(updatedCart);
      toast.success('Producto agregado al carrito');
      return updatedCart;
    } catch (error) {
      toast.error(`Error adding to cart: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
  };
}

export function useUpdateCartLines() {
  const { updateCart } = useAuth();
  const [isPending, setIsPending] = useState(false);
  
  const mutateAsync = async (lines: CartLineUpdateInput[]) => {
    setIsPending(true);
    try {
      const updatedCart = await api.updateCartLines(lines);
      updateCart(updatedCart);
      return updatedCart;
    } catch (error) {
      toast.error(`Error updating cart lines: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
  };
}

export function useRemoveFromCart() {
  const { updateCart } = useAuth();
  const [isPending, setIsPending] = useState(false);
  
  const mutateAsync = async (lineIds: string[]) => {
    setIsPending(true);
    try {
      const updatedCart = await api.removeFromCart(lineIds);
      updateCart(updatedCart);
      toast.success('Producto eliminado del carrito');
      return updatedCart;
    } catch (error) {
      toast.error(`Error removing from cart: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
  };
}

export function useApplyDiscountCode() {
  const { updateCart } = useAuth();
  const [isPending, setIsPending] = useState(false);
  
  const mutateAsync = async (params: { cartId: string; discountCodes: string[] }) => {
    setIsPending(true);
    try {
      const updatedCart = await api.applyDiscountCode(params.cartId, params.discountCodes);
      updateCart(updatedCart);
      toast.success('Código de descuento aplicado');
      return updatedCart;
    } catch (error) {
      toast.error(`Error applying discount code: ${(error as Error).message}`);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
  };
}

export function useCartActions() {
  const { data: cart, isLoading, error } = useCart();
  const addToCart = useAddToCart();
  const updateCartLines = useUpdateCartLines();
  const removeFromCart = useRemoveFromCart();
  const applyDiscountCode = useApplyDiscountCode();

  const addProduct = async (variantId: string, quantity: number = 1) => {
    if (!cart) {
      toast.error('Cart not available');
      return;
    }
    
    const lines: CartLineInput[] = [{
      merchandiseId: variantId,
      quantity,
    }];

    try {
      await addToCart.mutateAsync(lines);
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) {
      toast.error('Cart not available');
      return;
    }
    
    const lines: CartLineUpdateInput[] = [{
      id: lineId,
      quantity,
    }];

    try {
      await updateCartLines.mutateAsync(lines);
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  const removeProduct = async (lineId: string) => {
    if (!cart) {
      toast.error('Cart not available');
      return;
    }
    
    try {
      await removeFromCart.mutateAsync([lineId]);
    } catch (error) {
      console.error('Error removing product:', error);
      throw error;
    }
  };

  const applyDiscount = async (code: string) => {
    if (!cart) {
      toast.error('Cart not available');
      return;
    }
    
    try {
      await applyDiscountCode.mutateAsync({
        cartId: cart.id,
        discountCodes: [code]
      });
    } catch (error) {
      console.error('Error applying discount:', error);
      throw error;
    }
  };

  const cartSummary = cart ? {
    itemCount: cart.totalQuantity,
    subtotal: cart.cost.subtotalAmount,
    total: cart.cost.totalAmount,
    tax: cart.cost.totalTaxAmount,
    isEmpty: cart.totalQuantity === 0,
    lines: cart.lines.edges.map(edge => edge.node),
  } : null;

  return {
    cart,
    cartSummary,
    isLoading,
    error,
    addProduct,
    updateQuantity,
    removeProduct,
    applyDiscount,
    isAdding: addToCart.isPending,
    isUpdating: updateCartLines.isPending,
    isRemoving: removeFromCart.isPending,
    isApplyingDiscount: applyDiscountCode.isPending,
  };
}

// Hook simplificado para obtener el estado del cart
export function useCartStatus() {
  const { isAuthenticated, cart, isLoading } = useAuth();

  return {
    isAuthenticated,
    isLoading,
    itemCount: cart?.totalQuantity || 0,
    isEmpty: cart?.totalQuantity === 0 || !cart,
    total: cart?.cost.totalAmount,
    hasItems: (cart?.totalQuantity || 0) > 0
  };
}