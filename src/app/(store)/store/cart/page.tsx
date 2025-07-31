'use client'

import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Guard } from '@/components/Guards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCartActions } from '@/modules/cart/hook'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'
import { useAuth } from '@/src/modules/auth/context/useAuth'

export default function CartPage() {
  const { cart } = useAuth()
  const { cartSummary, isRemoving, isUpdating, removeProduct, updateQuantity } = useCartActions()

  const [ localQuantities, setLocalQuantities ] = useState<Record<string, number>>({})

  const isEmpty = cartSummary?.isEmpty ?? true
  const itemCount = cartSummary?.itemCount ?? 0

  const handleQuantityChange = (lineId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setLocalQuantities((prev) => ({ ...prev, [ lineId ]: newQuantity }))
  }

  const handleUpdateQuantity = async (lineId: string) => {
    const newQuantity = localQuantities[ lineId ]
    if (!newQuantity || newQuantity < 1) return

    try {
      await updateQuantity(lineId, newQuantity)
      setLocalQuantities((prev) => {
        const updated = { ...prev }
        delete updated[ lineId ]
        return updated
      })
      toast.success('Cantidad actualizada')
    } catch {
      toast.error('Error al actualizar cantidad')
    }
  }

  const handleRemoveItem = async (lineId: string, productTitle: string) => {
    try {
      await removeProduct(lineId)
      toast.success(`${productTitle} eliminado del carrito`)
    } catch {
      toast.error('Error al eliminar producto')
    }
  }

  return (
    <Guard.Auth>
      <div className='container mx-auto max-w-6xl px-4 py-8'>
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold'>Carrito de compras</h1>
            {itemCount > 0 && (
              <p className='mt-1 text-muted-foreground'>
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'} en tu carrito
              </p>
            )}
          </div>

          <Button variant='outline' asChild>
            <Link href={ROUTES.STORE.MAIN.PATH}>
              <ArrowLeft className='mr-2 size-4' />
              Seguir comprando
            </Link>
          </Button>
        </div>

        {isEmpty ? (
          <Card className='py-16 text-center'>
            <CardContent className='space-y-4'>
              <div className='mx-auto flex size-24 items-center justify-center rounded-full bg-muted'>
                <ShoppingBag className='size-12 text-muted-foreground' />
              </div>
              <div className='space-y-2'>
                <h2 className='text-2xl font-semibold'>Tu carrito está vacío</h2>
                <p className='text-muted-foreground'>
                  ¡Agrega algunos productos increíbles para comenzar!
                </p>
              </div>
            </CardContent>
            <CardFooter className='justify-center'>
              <Button asChild size='lg'>
                <Link href={ROUTES.STORE.MAIN.PATH}>
                  <ShoppingCart className='mr-2 size-5' />
                  Explorar productos
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className='grid gap-8 lg:grid-cols-3'>
            <div className='space-y-4 lg:col-span-2'>
              {cartSummary?.lines.map((line) => {
                const pendingQuantity = localQuantities[ line.id ]
                const currentQuantity = line.quantity
                const hasChanges = pendingQuantity && pendingQuantity !== line.quantity

                return (
                  <Card key={line.id}>
                    <CardContent className='p-6'>
                      <div className='flex gap-4'>
                        <div className='shrink-0'>
                          <Link
                            href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, {
                              handle: line.merchandise.product.handle,
                            })}
                          >
                            <div className='aspect-square size-24 overflow-hidden rounded-lg border'>
                              {line.merchandise.image ? (
                                <img
                                  src={line.merchandise.image.url}
                                  alt={line.merchandise.image.altText ?? line.merchandise.title}
                                  className='size-full object-cover transition-transform hover:scale-105'
                                />
                              ) : (
                                <div className='flex size-full items-center justify-center bg-muted'>
                                  <ShoppingCart className='size-6 text-muted-foreground' />
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>

                        <div className='flex-1 space-y-3'>
                          <div>
                            <Link
                              href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, {
                                handle: line.merchandise.product.handle,
                              })}
                              className='font-medium hover:underline'
                            >
                              {line.merchandise.product.title}
                            </Link>

                            <p className='mt-1 text-sm text-muted-foreground'>
                              {line.merchandise.title}
                            </p>

                            {line?.merchandise?.selectedOptions?.length > 0 && (
                              <div className='mt-2 flex gap-1'>
                                {line.merchandise.selectedOptions.map((option, index) => (
                                  <Badge key={index} variant='secondary' className='text-xs'>
                                    {option.name}: {option.value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className='flex items-center justify-between'>
                            <div className='space-y-1'>
                              <p className='font-medium'>
                                {formatCurrency(
                                  line.merchandise.price.amount,
                                  line.merchandise.price.currencyCode
                                )}
                              </p>

                              {line.merchandise.compareAtPrice &&
                                parseFloat(line.merchandise.compareAtPrice.amount) >
                                parseFloat(line.merchandise.price.amount) && (
                                  <p className='text-sm text-muted-foreground line-through'>
                                    {formatCurrency(
                                      line.merchandise.compareAtPrice.amount,
                                      line.merchandise.compareAtPrice.currencyCode
                                    )}
                                  </p>
                                )}
                            </div>

                            <div className='flex items-center gap-2'>
                              <div className='flex items-center rounded-md border'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='size-8 p-0'
                                  onClick={() => handleQuantityChange(line.id, currentQuantity - 1)}
                                  disabled={currentQuantity <= 1}
                                >
                                  <Minus className='size-4' />
                                </Button>

                                <span className='min-w-12 px-3 py-1 text-center'>
                                  {currentQuantity}
                                </span>

                                <Button
                                  variant='ghost'
                                  size='sm'
                                  className='size-8 p-0'
                                  onClick={() => handleQuantityChange(line.id, currentQuantity + 1)}
                                >
                                  <Plus className='size-4' />
                                </Button>
                              </div>

                              {hasChanges && (
                                <Button
                                  size='sm'
                                  onClick={() => handleUpdateQuantity(line.id)}
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <Loader2 className='size-4 animate-spin' />
                                  ) : (
                                    'Actualizar'
                                  )}
                                </Button>
                              )}

                              <Button
                                variant='outline'
                                size='sm'
                                className='text-destructive hover:bg-destructive hover:text-destructive-foreground'
                                onClick={() =>
                                  handleRemoveItem(line.id, line.merchandise.product.title)
                                }
                                disabled={isRemoving}
                              >
                                <X className='size-4' />
                              </Button>
                            </div>
                          </div>

                          <div className='text-right'>
                            <p className='text-sm font-medium'>
                              Subtotal:{' '}
                              {formatCurrency(
                                line.cost.totalAmount.amount,
                                line.cost.totalAmount.currencyCode
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg'>Resumen del pedido</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex justify-between'>
                    <span>Subtotal:</span>
                    <span>
                      {cartSummary?.subtotal &&
                        formatCurrency(
                          cartSummary.subtotal.amount,
                          cartSummary.subtotal.currencyCode
                        )}
                    </span>
                  </div>

                  {cartSummary?.tax && parseFloat(cartSummary.tax.amount) > 0 && (
                    <div className='flex justify-between'>
                      <span>Impuestos:</span>
                      <span>
                        {formatCurrency(cartSummary.tax.amount, cartSummary.tax.currencyCode)}
                      </span>
                    </div>
                  )}

                  {cart?.discountAllocations && cart.discountAllocations.length > 0 && (
                    <>
                      <Separator />
                      {cart.discountAllocations.map((discount, index) => (
                        <div key={index} className='flex justify-between text-green-600'>
                          <span>Descuento {discount.code ? `(${discount.code})` : ''}:</span>
                          <span>
                            -
                            {formatCurrency(
                              discount.discountedAmount.amount,
                              discount.discountedAmount.currencyCode
                            )}
                          </span>
                        </div>
                      ))}
                    </>
                  )}

                  <Separator />

                  <div className='flex justify-between text-lg font-medium'>
                    <span>Total:</span>
                    <span>
                      {cartSummary?.total &&
                        formatCurrency(cartSummary.total.amount, cartSummary.total.currencyCode)}
                    </span>
                  </div>
                </CardContent>

                <CardFooter>
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
                </CardFooter>
              </Card>

              <Card>
                <CardContent className='space-y-2 p-4 text-sm text-muted-foreground'>
                  <p className='flex items-center gap-2'>
                    <ShoppingCart className='size-4' />
                    Envío gratis en pedidos mayores a $1000
                  </p>
                  <p className='flex items-center gap-2'>
                    <ArrowLeft className='size-4' />
                    30 días para devoluciones
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Guard.Auth>
  )
}