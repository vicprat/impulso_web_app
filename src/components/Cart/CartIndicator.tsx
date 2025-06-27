'use client';

import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/useAuth';

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
  const { isAuthenticated, cart, isLoading } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const itemCount = cart?.totalQuantity || 0;
  const isEmpty = itemCount === 0;
  const total = cart?.cost.totalAmount;

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
        
        {showTotal && total && !isEmpty && (
          <Badge variant="secondary" className="text-xs">
            {total.amount} {total.currencyCode}
          </Badge>
        )}
      </div>
    );
  }

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

      {showTotal && total && !isEmpty && (
        <span className="text-xs font-medium ml-6">
          ${total.amount}
        </span>
      )}
    </div>
  );
}