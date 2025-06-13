import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { api } from './api';
import { CartLineInput, CartLineUpdateInput } from './types';

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

export function useCreateCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createCart,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
    },
    onError: (error) => {
      console.error('Error creating cart:', error);
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, lines }: { cartId: string; lines: CartLineInput[] }) =>
      api.addToCart(cartId, lines),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
    },
  });
}

export function useUpdateCartLines() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, lines }: { cartId: string; lines: CartLineUpdateInput[] }) =>
      api.updateCartLines(cartId, lines),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error updating cart lines:', error);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, lineIds }: { cartId: string; lineIds: string[] }) =>
      api.removeFromCart(cartId, lineIds),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error removing from cart:', error);
    },
  });
}

export function useApplyDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, discountCodes }: { cartId: string; discountCodes: string[] }) =>
      api.applyDiscountCode(cartId, discountCodes),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error applying discount code:', error);
    },
  });
}

export function useCartActions() {
  const { data: cart, isLoading, error } = useCart();
  const createCart = useCreateCart();
  const addToCart = useAddToCart();
  const updateCartLines = useUpdateCartLines();
  const removeFromCart = useRemoveFromCart();
  const applyDiscountCode = useApplyDiscountCode();

  // Función para agregar un producto al carrito
  const addProduct = async (variantId: string, quantity: number = 1) => {
    try {
      let currentCart = cart;
      
      // Si no hay carrito, crear uno nuevo
      if (!currentCart) {
        const newCartResult = await createCart.mutateAsync({});
        currentCart = newCartResult.cart;
      }
      
      // Agregar el producto al carrito
      await addToCart.mutateAsync({
        cartId: currentCart.id,
        lines: [{ merchandiseId: variantId, quantity }]
      });
    } catch (error) {
      console.error('Error adding product to cart:', error);
      throw error;
    }
  };

  // Función para actualizar cantidad de un producto
  const updateQuantity = async (lineId: string, quantity: number) => {
    if (!cart) return;
    
    try {
      await updateCartLines.mutateAsync({
        cartId: cart.id,
        lines: [{ id: lineId, quantity }]
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  // Función para remover un producto
  const removeProduct = async (lineId: string) => {
    if (!cart) return;
    
    try {
      await removeFromCart.mutateAsync({
        cartId: cart.id,
        lineIds: [lineId]
      });
    } catch (error) {
      console.error('Error removing product:', error);
      throw error;
    }
  };

  // Función para aplicar código de descuento
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

  // Calcular totales
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
    isAdding: addToCart.isPending || createCart.isPending,
    isUpdating: updateCartLines.isPending,
    isRemoving: removeFromCart.isPending,
    isApplyingDiscount: applyDiscountCode.isPending,
  };
}
