// src/components/Cart/CartIndicator.tsx
'use client';

import { useCartActions } from '@/modules/customer/hooks/cart';
import { useAuth } from '@/modules/auth/context/useAuth';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface CartIndicatorProps {
  showIcon?: boolean;
  showCount?: boolean;
  showTotal?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

export function CartIndicator({ 
  showIcon = true,
  showCount = true,
  showTotal = false,
  variant = 'default',
  className = ''
}: CartIndicatorProps) {
  const { isAuthenticated } = useAuth();
  const { cartSummary, isLoading } = useCartActions();

  if (!isAuthenticated) {
    return null;
  }

  const itemCount = cartSummary?.itemCount || 0;
  const isEmpty = cartSummary?.isEmpty ?? true;

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <ShoppingCart className="h-4 w-4 animate-pulse" />}
        {showCount && <div className="w-4 h-4 bg-muted rounded-full animate-pulse" />}
      </div>
    );
  }

  if (variant === 'minimal') {
    return itemCount > 0 ? (
      <Badge variant="destructive" className={`h-5 w-5 rounded-full p-0 text-xs ${className}`}>
        {itemCount > 99 ? '99+' : itemCount}
      </Badge>
    ) : null;
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2">
          {showIcon && <ShoppingCart className="h-4 w-4" />}
          {showCount && (
            <span className="text-sm font-medium">
              {isEmpty ? 'Carrito vacío' : `${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
            </span>
          )}
        </div>
        
        {showTotal && cartSummary?.total && !isEmpty && (
          <Badge variant="secondary" className="text-xs">
            {cartSummary.total.amount} {cartSummary.total.currencyCode}
          </Badge>
        )}
      </div>
    );
  }

  // Variant default
  return (
    <div className={`flex items-center gap-2 relative ${className}`}>
      {showIcon && <ShoppingCart className="h-4 w-4" />}
      
      {showCount && itemCount > 0 && (
        <Badge 
          variant="destructive" 
          className="h-5 w-5 rounded-full p-0 text-xs absolute -top-2 -right-2"
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}

      {showTotal && cartSummary?.total && !isEmpty && (
        <span className="text-xs font-medium ml-6">
          ${cartSummary.total.amount}
        </span>
      )}
    </div>
  );
}

// Hook personalizado para obtener solo el estado del carrito
export function useCartStatus() {
  const { isAuthenticated } = useAuth();
  const { cartSummary, isLoading } = useCartActions();

  return {
    isAuthenticated,
    isLoading,
    itemCount: cartSummary?.itemCount || 0,
    isEmpty: cartSummary?.isEmpty ?? true,
    total: cartSummary?.total,
    hasItems: (cartSummary?.itemCount || 0) > 0
  };
}