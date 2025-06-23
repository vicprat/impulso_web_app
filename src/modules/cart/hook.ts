import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { api } from './api';
import { CartLineInput, CartLineUpdateInput } from './types';
import { toast } from 'sonner';

export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'current'] as const,
  checkout: (checkoutId: string) => [...cartKeys.all, 'checkout', checkoutId] as const,
};

export function useCart() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: api.getCart,
    enabled: isAuthenticated, 
    staleTime: 1 * 60 * 1000, 
    gcTime: 5 * 60 * 1000, 
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lines: CartLineInput[]) => api.addToCart(lines),
    
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(cartKeys.cart(), updatedCart);
    },
    onError: (error) => {
      toast.error(`Error adding to cart: ${error.message}`);
    },
  });
}

export function useUpdateCartLines() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lines: CartLineUpdateInput[]) => api.updateCartLines(lines), // Ya no necesita cartId
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      toast.error(`Error updating cart lines: ${error.message}`);
    }
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (lineIds: string[]) => api.removeFromCart(lineIds), // Ya no necesita cartId
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      toast.error(`Error removing from cart: ${error.message}`);
    }
  });
}

export function useApplyDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { cartId: string; discountCodes: string[] }) => 
      api.applyDiscountCode(params.cartId, params.discountCodes),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      toast.error(`Error applying discount code: ${error.message}`);
    }
  });
}

export function useCartActions() {
  const { data: cart, isLoading, error } = useCart();
  const addToCart = useAddToCart();
  const updateCartLines = useUpdateCartLines();
  const removeFromCart = useRemoveFromCart();
  const applyDiscountCode = useApplyDiscountCode();

  const addProduct = async (variantId: string, quantity: number = 1) => {
    if (!cart) return;
    
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
    if (!cart) return;
    
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
    if (!cart) return;
    try {
      await removeFromCart.mutateAsync([lineId]);
    } catch (error) {
      console.error('Error removing product:', error);
      throw error;
    }
  };

  const applyDiscount = async (code: string) => {
    if (!cart) return;
    
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
