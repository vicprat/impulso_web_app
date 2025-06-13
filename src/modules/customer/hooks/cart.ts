// src/modules/customer/hooks/cart.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/useAuth';
import { cartApi, checkoutApi } from '../cart-api';
import { CartLineInput, CartLineUpdateInput, Cart } from '../cart-types';

// Query Keys para Cart
export const cartKeys = {
  all: ['cart'] as const,
  cart: () => [...cartKeys.all, 'current'] as const,
  checkout: (checkoutId: string) => [...cartKeys.all, 'checkout', checkoutId] as const,
};

// Hook para obtener el carrito actual
export function useCart() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para crear carrito
export function useCreateCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cartApi.createCart,
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
    },
    onError: (error) => {
      console.error('Error creating cart:', error);
    },
  });
}

// Hook para agregar al carrito
export function useAddToCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, lines }: { cartId: string; lines: CartLineInput[] }) =>
      cartApi.addToCart(cartId, lines),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error adding to cart:', error);
    },
  });
}

// Hook para actualizar líneas del carrito
export function useUpdateCartLines() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, lines }: { cartId: string; lines: CartLineUpdateInput[] }) =>
      cartApi.updateCartLines(cartId, lines),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error updating cart lines:', error);
    },
  });
}

// Hook para remover del carrito
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, lineIds }: { cartId: string; lineIds: string[] }) =>
      cartApi.removeFromCart(cartId, lineIds),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error removing from cart:', error);
    },
  });
}

// Hook para aplicar código de descuento
export function useApplyDiscountCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cartId, discountCodes }: { cartId: string; discountCodes: string[] }) =>
      cartApi.applyDiscountCode(cartId, discountCodes),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart(), data.cart);
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error applying discount code:', error);
    },
  });
}

// Hook para crear checkout
export function useCreateCheckout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: checkoutApi.createCheckout,
    onSuccess: () => {
      // Invalidar el carrito después de crear checkout
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    onError: (error) => {
      console.error('Error creating checkout:', error);
    },
  });
}

// Hook para actualizar dirección de envío
export function useUpdateShippingAddress() {
  return useMutation({
    mutationFn: ({ checkoutId, shippingAddress }: { 
      checkoutId: string; 
      shippingAddress: any;
    }) => checkoutApi.updateShippingAddress(checkoutId, shippingAddress),
    onError: (error) => {
      console.error('Error updating shipping address:', error);
    },
  });
}

// Hook para obtener tarifas de envío
export function useShippingRates(checkoutId: string) {
  return useQuery({
    queryKey: [...cartKeys.checkout(checkoutId), 'shipping-rates'],
    queryFn: () => checkoutApi.getShippingRates(checkoutId),
    enabled: !!checkoutId,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}

// Hook para actualizar línea de envío
export function useUpdateShippingLine() {
  return useMutation({
    mutationFn: ({ checkoutId, shippingRateHandle }: { 
      checkoutId: string; 
      shippingRateHandle: string;
    }) => checkoutApi.updateShippingLine(checkoutId, shippingRateHandle),
    onError: (error) => {
      console.error('Error updating shipping line:', error);
    },
  });
}

// Hook compuesto para manejar todo el carrito
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
        const newCartResult = await createCart.mutateAsync();
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