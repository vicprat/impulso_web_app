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
  title?: {
    primary: string // Texto principal del botón (ej: "Registrarse")
    adding: string // Texto mientras se agrega (ej: "Registrando...")
    addMore: string // Texto cuando ya hay items (ej: "Registrar más")
    loginPrompt: string // Texto para login (ej: "Iniciar sesión para registrarse")
    unavailable: string // Mensaje de no disponible (ej: "Evento no disponible")
    alreadyInCart: string // Mensaje cuando ya está en carrito (ej: "Ya estás registrado")
  }
}

const defaultTitles = {
  addMore: 'Agregar más',
  adding: 'Agregando...',
  alreadyInCart: 'Ya tienes {quantity} en tu carrito',
  loginPrompt: 'Iniciar sesión para comprar',
  primary: 'Agregar al carrito',
  unavailable: 'Este producto no está disponible para la venta',
}

const eventTitles = {
  addMore: 'Registrar más entradas',
  adding: 'Registrando...',
  alreadyInCart: 'Ya tienes {quantity} entradas registradas',
  loginPrompt: 'Iniciar sesión para registrarse',
  primary: 'Registrarse al evento',
  unavailable: 'Este evento no está disponible',
}

export function AddToCartButton({
  className = '',
  product,
  quantity: initialQuantity = 1,
  selectedVariant,
  showQuantitySelector = false,
  size = 'default',
  title,
}: AddToCartButtonProps) {
  const { isAuthenticated, isLoading: authLoading, login } = useAuth()
  const { addProduct, cartSummary, isAdding } = useCartActions()
  const [quantity, setQuantity] = useState(initialQuantity)

  // Usar títulos personalizados o detectar si es evento para usar títulos apropiados
  const isEvent = product.vendor === 'Evento' || product.title?.toLowerCase().includes('evento')
  const titles = title || (isEvent ? eventTitles : defaultTitles)

  const variantToAdd = selectedVariant ?? product.variants[0]
  const existingLine = cartSummary?.lines.find((line) => line.merchandise.id === variantToAdd.id)

  const handleAddToCart = async () => {
    if (!isAuthenticated && !authLoading) {
      toast.error(
        `Debes iniciar sesión para ${isEvent ? 'registrarte al evento' : 'agregar productos al carrito'}`
      )
      login()
      return
    }
    if (!variantToAdd.availableForSale) {
      toast.error(titles.unavailable)
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

  const getAlreadyInCartMessage = () => {
    if (!existingLine) return ''
    return titles.alreadyInCart.replace('{quantity}', existingLine.quantity.toString())
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
        {titles.loginPrompt}
      </Button>
    )
  }

  return (
    <div className='flex flex-col gap-3'>
      {showQuantitySelector && (
        <div className='flex items-center gap-3'>
          <span className='text-sm font-medium'>{isEvent ? 'Entradas:' : 'Cantidad:'}</span>
          <div className='flex items-center rounded-md border border-border'>
            <Button
              variant='ghost'
              size='sm'
              onClick={decrementQuantity}
              disabled={quantity <= 1 || isAdding}
              className='size-8 p-0 hover:bg-muted'
            >
              <Minus className='size-4' />
            </Button>
            <span className='min-w-12 px-3 py-1 text-center text-foreground'>{quantity}</span>
            <Button
              variant='ghost'
              size='sm'
              onClick={incrementQuantity}
              disabled={isAdding}
              className='size-8 p-0 hover:bg-muted'
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
            {titles.adding}
          </>
        ) : existingLine ? (
          <>
            <ShoppingCart className='mr-2 size-4' />
            {titles.addMore}
          </>
        ) : (
          <>
            <ShoppingCart className='mr-2 size-4' />
            {titles.primary}
          </>
        )}
      </Button>

      {existingLine && (
        <p className='text-center text-sm text-muted-foreground'>{getAlreadyInCartMessage()}</p>
      )}
    </div>
  )
}
