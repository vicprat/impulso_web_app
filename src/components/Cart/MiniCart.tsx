/* eslint-disable @next/next/no-img-element */
'use client'

import { ArrowRight, ExternalLink, Minus, Plus, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCartActions } from '@/modules/cart/hook'
import { formatCurrency } from '@/src/helpers'

interface Props {
  children?: React.ReactNode
}

export function MiniCart({ children }: Props) {
  const { cart, isAuthenticated } = useAuth()
  const { cartSummary, isRemoving, isUpdating, removeProduct, updateQuantity } = useCartActions()
  const [open, setOpen] = useState(false)

  if (!isAuthenticated) {
    return (
      children ?? (
        <Button variant='outline' size='sm' asChild>
          <Link href='/auth/login'>
            <ShoppingCart className='size-4' />
          </Link>
        </Button>
      )
    )
  }

  const itemCount = cartSummary?.itemCount ?? 0
  const isEmpty = cartSummary?.isEmpty ?? true

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children ?? (
          <Button variant='outline' size='sm' className='relative'>
            <ShoppingCart className='size-4' />
            {itemCount > 0 && (
              <Badge
                variant='destructive'
                className='absolute -right-2 -top-2 size-5 rounded-full p-0 text-xs'
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className='flex w-full flex-col pr-0 sm:max-w-lg'>
        <SheetHeader className='px-1'>
          <SheetTitle>
            Carrito de compras
            {itemCount > 0 && (
              <Badge variant='secondary' className='ml-2'>
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEmpty ? 'Tu carrito está vacío' : 'Revisa los productos en tu carrito'}
          </SheetDescription>
        </SheetHeader>

        {isEmpty ? (
          <div className='flex flex-1 flex-col items-center justify-center space-y-1'>
            <ShoppingCart className='size-16 text-muted-foreground' />
            <p className='text-lg font-medium'>Tu carrito está vacío</p>
            <p className='text-sm text-muted-foreground'>
              ¡Agrega algunos productos para comenzar!
            </p>
            <Button asChild className='mt-4'>
              <Link href='/store' onClick={() => setOpen(false)}>
                Explorar productos
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className='flex-1 pr-6'>
              <div className='space-y-4'>
                {cartSummary?.lines.map((line) => (
                  <div key={line.id} className='flex items-start space-x-4'>
                    <div className='aspect-square size-16 overflow-hidden rounded-md border'>
                      {line.merchandise.image ? (
                        <img
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText ?? line.merchandise.title}
                          className='size-full object-cover'
                        />
                      ) : (
                        <div className='flex size-full items-center justify-center bg-muted'>
                          <ShoppingCart className='size-4 text-muted-foreground' />
                        </div>
                      )}
                    </div>

                    <div className='flex-1 space-y-1'>
                      <h4 className='line-clamp-2 text-sm font-medium'>
                        {line.merchandise.product.title}
                      </h4>

                      {line.merchandise?.selectedOptions?.length > 0 && (
                        <p className='text-xs text-muted-foreground'>
                          {line.merchandise.selectedOptions
                            .map((option) => `${option.name}: ${option.value}`)
                            .join(', ')}
                        </p>
                      )}

                      <div className='flex items-center justify-between'>
                        <p className='text-sm font-medium'>
                          {formatCurrency(
                            line.merchandise.price.amount,
                            line.merchandise.price.currencyCode
                          )}
                        </p>

                        <div className='flex items-center space-x-1'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='size-6 p-0'
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            disabled={isUpdating || line.quantity <= 1}
                          >
                            <Minus className='size-3' />
                          </Button>

                          <span className='w-8 text-center text-sm'>{line.quantity}</span>

                          <Button
                            variant='outline'
                            size='sm'
                            className='size-6 p-0'
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className='size-3' />
                          </Button>

                          <Button
                            variant='outline'
                            size='sm'
                            className='size-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground'
                            onClick={() => removeProduct(line.id)}
                            disabled={isRemoving}
                          >
                            <X className='size-3' />
                          </Button>
                        </div>
                      </div>

                      <p className='text-xs text-muted-foreground'>
                        Subtotal:{' '}
                        {formatCurrency(
                          line.cost.totalAmount.amount,
                          line.cost.totalAmount.currencyCode
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className='px-1'>
              <div className='w-full space-y-4'>
                <div className='space-y-2 rounded-lg bg-muted p-4'>
                  <div className='flex justify-between text-sm'>
                    <span>Subtotal:</span>
                    <span>
                      {cartSummary?.subtotal &&
                        formatCurrency(
                          cartSummary.subtotal.amount,
                          cartSummary.subtotal.currencyCode
                        )}
                    </span>
                  </div>

                  {cartSummary?.tax && (
                    <div className='flex justify-between text-sm'>
                      <span>Impuestos:</span>
                      <span>
                        {formatCurrency(cartSummary.tax.amount, cartSummary.tax.currencyCode)}
                      </span>
                    </div>
                  )}

                  <div className='flex justify-between border-t pt-2 font-medium'>
                    <span>Total:</span>
                    <span>
                      {cartSummary?.total &&
                        formatCurrency(cartSummary.total.amount, cartSummary.total.currencyCode)}
                    </span>
                  </div>
                </div>

                <div className='grid gap-2'>
                  <Button
                    className='w-full'
                    size='lg'
                    onClick={async () => {
                      try {
                        if (!cartSummary?.lines.length) {
                          toast.error('El carrito está vacío')
                          return
                        }

                        if (!cart?.id) {
                          toast.error('No se pudo obtener el carrito')
                          return
                        }

                        const response = await fetch('/api/checkout/create', {
                          body: JSON.stringify({
                            cartId: cart.id,
                          }),
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          method: 'POST',
                        })

                        const data = await response.json()

                        if (!data.success) {
                          throw new Error(data.error ?? 'Error al crear el checkout')
                        }

                        window.location.href = data.checkout.webUrl
                      } catch (error) {
                        console.error('Error al procesar el checkout:', error)
                        toast.error('Error al procesar el checkout')
                      }
                    }}
                  >
                    Proceder al checkout
                    <ArrowRight className='ml-2 size-4' />
                  </Button>

                  <Button variant='outline' asChild className='w-full'>
                    <Link href='/store/cart' onClick={() => setOpen(false)}>
                      <ExternalLink className='mr-2 size-4' />
                      Ver carrito completo
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
