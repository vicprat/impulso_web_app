'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/modules/auth/context/useAuth';
import { ShoppingCart, Plus, Minus, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Product, Variant } from '@/modules/shopify/types';
import { useCartActions } from '@/modules/cart/hook';

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
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  const { addProduct, isAdding, cartSummary } = useCartActions();
  const [quantity, setQuantity] = useState(initialQuantity);

  const variantToAdd = selectedVariant || product.variants[0];
  
  if (!variantToAdd) {
    return (
      <Button disabled size={size} className={className}>
        <AlertCircle className="mr-2 h-4 w-4" />
        No disponible
      </Button>
    );
  }

  const existingLine = cartSummary?.lines.find(
    line => line.merchandise.id === variantToAdd.id
  );

  const handleAddToCart = async () => {
    if (!isAuthenticated && !authLoading) {
      toast.error('Debes iniciar sesión para agregar productos al carrito');
      login();
      return;
    }
    if (!variantToAdd.availableForSale) {
      toast.error('Este producto no está disponible para la venta');
      return;
    }

    addProduct(variantToAdd.id, quantity);
    
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  if (authLoading) {
    return (
      <Button disabled size={size} className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Verificando...
      </Button>
    );
  }

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
            Agregando...
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