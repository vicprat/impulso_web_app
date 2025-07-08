'use client'

import { Loader2, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCartActions } from '@/modules/cart/hook'
import { type IProductForCart, type Variant } from '@/modules/shopify/types'

interface AddToCartButtonProps {
  product: IProductForCart
  selectedVariant?: Variant
  quantity?: number
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showQuantitySelector?: boolean
  disabled?: boolean
}

export function AddToCartButton({
  className = '',
  product,
  quantity: initialQuantity = 1,
  selectedVariant,
  showQuantitySelector = false,
  size = 'default',
}: AddToCartButtonProps) {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const { addProduct, cartSummary, isAdding } = useCartActions()
  const [quantity, setQuantity] = useState(initialQuantity)

  const variantToAdd = selectedVariant ?? product.variants[0]

  const existingLine = cartSummary?.lines.find((line) => line.merchandise.id === variantToAdd.id)

  const handleAddToCart = async () => {
    if (!isAuthenticated && !authLoading) {
      toast.error('Debes iniciar sesión para agregar productos al carrito')
      login()
      return
    }
    if (!variantToAdd.availableForSale) {
      toast.error('Este producto no está disponible para la venta')
      return
    }

    void addProduct(variantToAdd.id, quantity)
  }

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  if (authLoading) {
    return (
      <Button disabled size={size} className={className}>
        <Loader2 className='mr-2 size-4 animate-spin' />
        Verificando...
      </Button>
    )
  }

  if (!isAuthenticated) {
    return (
      <Button onClick={login} size={size} className={className} variant='outline'>
        <ShoppingCart className='mr-2 size-4' />
        Iniciar sesión para comprar
      </Button>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {showQuantitySelector && (
        <div className='flex items-center gap-3'>
          <span className='text-sm font-medium'>Cantidad:</span>
          <div className='flex items-center rounded-md border'>
            <Button
              variant='ghost'
              size='sm'
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isAdding}
              className='size-8 p-0'
            >
              <Minus className='size-4' />
            </Button>
            <span className='min-w-12 px-3 py-1 text-center'>{quantity}</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={incrementQuantity}
              disabled={isAdding}
              className='size-8 p-0'
            >
              <Plus className='size-4' />
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
            <Loader2 className='mr-2 size-4 animate-spin' />
            Agregando...
          </>
        ) : existingLine ? (
          <>
            <ShoppingCart className='mr-2 size-4' />
            Agregar más
          </>
        ) : (
          <>
            <ShoppingCart className='mr-2 size-4' />
            Agregar al carrito
          </>
        )}
      </Button>

      {existingLine && (
        <p className='text-center text-sm text-muted-foreground'>
          Ya tienes {existingLine.quantity} en tu carrito
        </p>
      )}
    </div>
  )
}
