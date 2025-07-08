'use client'

import { ShoppingCart } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/modules/auth/context/useAuth'

interface CartIndicatorProps {
  showIcon?: boolean
  showCount?: boolean
  showTotal?: boolean
  variant?: 'default' | 'minimal' | 'detailed'
  className?: string
}

export function CartIndicator({
  className = '',
  showCount = true,
  showIcon = true,
  showTotal = false,
  variant = 'default',
}: CartIndicatorProps) {
  const { cart, isAuthenticated, isLoading } = useAuth()

  if (!isAuthenticated) {
    return null
  }

  const itemCount = cart?.totalQuantity ?? 0
  const isEmpty = itemCount === 0
  const total = cart?.cost.totalAmount

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIcon && <ShoppingCart className='size-4 animate-pulse' />}
        {showCount && <div className='size-4 animate-pulse rounded-full bg-muted' />}
      </div>
    )
  }

  if (variant === 'minimal') {
    return itemCount > 0 ? (
      <Badge variant='destructive' className={`size-5 rounded-full p-0 text-xs ${className}`}>
        {itemCount > 99 ? '99+' : itemCount}
      </Badge>
    ) : null
  }

  if (variant === 'detailed') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className='flex items-center gap-2'>
          {showIcon && <ShoppingCart className='size-4' />}
          {showCount && (
            <span className='text-sm font-medium'>
              {isEmpty
                ? 'Carrito vacío'
                : `${itemCount} ${itemCount === 1 ? 'artículo' : 'artículos'}`}
            </span>
          )}
        </div>

        {showTotal && total && !isEmpty && (
          <Badge variant='secondary' className='text-xs'>
            {total.amount} {total.currencyCode}
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={`relative flex items-center gap-2 ${className}`}>
      {showIcon && <ShoppingCart className='size-4' />}

      {showCount && itemCount > 0 && (
        <Badge
          variant='destructive'
          className='absolute -right-2 -top-2 size-5 rounded-full p-0 text-xs'
        >
          {itemCount > 99 ? '99+' : itemCount}
        </Badge>
      )}

      {showTotal && total && !isEmpty && (
        <span className='ml-6 text-xs font-medium'>${total.amount}</span>
      )}
    </div>
  )
}
