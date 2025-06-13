// src/components/Cart/AddToCartButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCartActions } from '@/modules/customer/hooks/cart';
import { useAuth } from '@/modules/auth/context/useAuth';
import { ShoppingCart, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Variant } from '@/modules/shopify/types';
import { AuthenticationError } from '@/modules/customer/cart-api';

interface AddToCartButtonProps {
  product: Product;
  selectedVariant?: Variant;
  quantity?: number;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showQuantitySelector?: boolean;
}

export function AddToCartButton({
  product,
  selectedVariant,
  quantity: initialQuantity = 1,
  size = 'default',
  className = '',
  showQuantitySelector = false
}: AddToCartButtonProps) {
  const { isAuthenticated, login, refresh, isLoading: authLoading } = useAuth();
  const { addProduct, isAdding, cartSummary } = useCartActions();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [authRetryCount, setAuthRetryCount] = useState(0);

  // Reset retry count when authentication status changes
  useEffect(() => {
    setAuthRetryCount(0);
  }, [isAuthenticated]);

  // Determinar la variante a usar
  const variantToAdd = selectedVariant || product.variants[0];
  
  if (!variantToAdd) {
    return (
      <Button disabled size={size} className={className}>
        <AlertCircle className="mr-2 h-4 w-4" />
        No disponible
      </Button>
    );
  }

  // Verificar si el producto ya está en el carrito
  const existingLine = cartSummary?.lines.find(
    line => line.merchandise.id === variantToAdd.id
  );

  const handleAddToCart = async () => {
    // Check authentication first
    if (!isAuthenticated && !authLoading) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      login();
      return;
    }

    // Don't proceed if still loading auth
    if (authLoading) {
      return;
    }

    if (!variantToAdd.availableForSale) {
      toast.error('Este producto no está disponible para la venta');
      return;
    }

    try {
      await addProduct(variantToAdd.id, quantity);
      
      toast.success(
        `${product.title} agregado al carrito`,
        {
          description: `Cantidad: ${quantity}`,
          action: {
            label: 'Ver carrito',
            onClick: () => window.location.href = '/cart'
          }
        }
      );
      
      // Reset retry count on success
      setAuthRetryCount(0);
    } catch (error) {
      console.error('Error adding to cart:', error);
      
      if (error instanceof AuthenticationError) {
        // Handle authentication errors with retry logic
        if (authRetryCount < 1) {
          setAuthRetryCount(prev => prev + 1);
          toast.error('Verificando sesión...');
          
          try {
            await refresh();
            // If refresh succeeds, retry the add to cart operation
            setTimeout(() => handleAddToCart(), 500);
            return;
          } catch (refreshError) {
            console.error('Refresh failed:', refreshError);
          }
        }
        
        // If retry limit reached or refresh failed
        toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        login();
      } else {
        // Handle other errors
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        toast.error(`Error al agregar al carrito: ${errorMessage}`);
      }
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Show loading state during auth loading
  if (authLoading) {
    return (
      <Button disabled size={size} className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Verificando...
      </Button>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <Button 
        onClick={login} 
        size={size} 
        className={className}
        variant="outline"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        Iniciar sesión para comprar
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showQuantitySelector && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Cantidad:</span>
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isAdding}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="px-3 py-1 min-w-[3rem] text-center">{quantity}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={incrementQuantity}
              disabled={isAdding}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={!variantToAdd.availableForSale || isAdding}
        size={size}
        className={className}
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {authRetryCount > 0 ? 'Reintentando...' : 'Agregando...'}
          </>
        ) : existingLine ? (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar más
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Agregar al carrito
          </>
        )}
      </Button>

      {existingLine && (
        <p className="text-sm text-muted-foreground text-center">
          Ya tienes {existingLine.quantity} en tu carrito
        </p>
      )}  
    </div>
  );
}