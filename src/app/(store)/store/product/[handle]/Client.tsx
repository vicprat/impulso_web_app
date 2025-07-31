/* eslint-disable @next/next/no-img-element */

'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { useCallback, useEffect, useState, unstable_ViewTransition as ViewTransition } from 'react'

import { Card } from '@/components/Card'
import { AddToCartButton } from '@/components/Cart/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { type Product, type Variant } from '@/modules/shopify/types'

interface Props {
  product: Product
  relatedProducts: Product[]
}

interface State {
  variant: Variant | null
  image: number
  lightboxOpen: boolean
  lightboxImage: number
}

const INITIAL_STATE: State = {
  image: 0,
  lightboxImage: 0,
  lightboxOpen: false,
  variant: null,
}

export const Client: React.FC<Props> = ({ product, relatedProducts }) => {
  const [ state, setState ] = useState(INITIAL_STATE)

  const [ emblaRef, emblaApi ] = useEmblaCarousel(
    {
      align: 'start',
      dragFree: true,
      loop: true,
      skipSnaps: false,
    },
    [ Autoplay({ delay: 4000, stopOnInteraction: true }) ]
  )

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [ emblaApi ])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [ emblaApi ])

  const currentPrice = state.variant?.price ?? product.priceRange.minVariantPrice
  const comparePrice = state.variant?.compareAtPrice
  const discount =
    comparePrice && comparePrice.amount !== currentPrice.amount
      ? Math.round(
        ((parseFloat(comparePrice.amount) - parseFloat(currentPrice.amount)) /
          parseFloat(comparePrice.amount)) *
        100
      )
      : null

  const transitionName = `product-image-${product.id}`

  useEffect(() => {
    if (product.variants.length > 0 && !state.variant) {
      setState((previous) => ({ ...previous, variant: product.variants[ 0 ] }))
    }
  }, [ product.variants, state.variant ])

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ')
  }

  const openLightbox = (imageIndex: number) => {
    setState((prev) => ({
      ...prev,
      lightboxImage: imageIndex,
      lightboxOpen: true,
    }))
  }

  const closeLightbox = () => {
    setState((prev) => ({
      ...prev,
      lightboxOpen: false,
    }))
  }

  const nextLightboxImage = () => {
    setState((prev) => ({
      ...prev,
      lightboxImage: (prev.lightboxImage + 1) % product.images.length,
    }))
  }

  const prevLightboxImage = () => {
    setState((prev) => ({
      ...prev,
      lightboxImage: prev.lightboxImage === 0 ? product.images.length - 1 : prev.lightboxImage - 1,
    }))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.lightboxOpen) return

      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          prevLightboxImage()
          break
        case 'ArrowRight':
          nextLightboxImage()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ state.lightboxOpen ])

  return (
    <div className='min-h-screen '>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8'>
          <div className='lg:col-span-5 lg:col-start-8'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
              <div className='flex-1'>
                <h1 className='text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl'>
                  {product.title}
                </h1>
                {product.vendor && (
                  <p className='mt-2 text-sm font-medium uppercase tracking-wide text-muted-foreground sm:text-base'>
                    {product.vendor}
                  </p>
                )}
              </div>
              <div className='text-right sm:text-left lg:text-right'>
                <div className='flex flex-row items-center justify-end gap-2 sm:flex-col sm:items-end lg:flex-row lg:items-center'>
                  <span className='text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl'>
                    ${currentPrice.amount}
                  </span>
                  {comparePrice && comparePrice.amount !== currentPrice.amount && (
                    <span className='text-lg text-muted-foreground line-through sm:text-xl'>
                      ${comparePrice.amount}
                    </span>
                  )}
                </div>
                <p className='mt-1 text-sm text-muted-foreground'>{currentPrice.currencyCode}</p>
                {discount && (
                  <Badge className='mt-2 bg-green-500 text-xs hover:bg-green-600'>
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            <div className='mt-6'>
              <Badge
                variant={product.availableForSale ? 'default' : 'destructive'}
                className='px-3 py-1 text-sm'
              >
                {product.availableForSale ? 'En stock' : 'Agotado'}
              </Badge>
            </div>
          </div>

          <div className='mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0'>
            <h2 className='sr-only'>Imágenes del producto</h2>

            {product.images.length > 0 ? (
              <div className='space-y-4'>
                <div className='group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-muted shadow-lg'>
                  <ViewTransition name={transitionName}>
                    <img
                      src={product.images[ state.image ]?.url}
                      alt={product.images[ state.image ]?.altText ?? product.title}
                      className='size-full object-cover transition-transform duration-500 hover:scale-105'
                      style={{ viewTransitionName: transitionName }}
                      onClick={() => openLightbox(state.image)}
                    />
                  </ViewTransition>

                  <div
                    className='absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100'
                    onClick={() => openLightbox(state.image)}
                  >
                    <div className='scale-90 rounded-full bg-black/50 p-3 transition-transform duration-300 group-hover:scale-100'>
                      <ZoomIn className='size-8 text-white' />
                    </div>
                  </div>
                </div>

                {product.images.length > 1 && (
                  <div className='grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-6'>
                    {product.images.map((image, index) => (
                      <div key={image.id} className='group relative'>
                        <button
                          onClick={() => setState((previous) => ({ ...previous, image: index }))}
                          className={classNames(
                            'aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-md w-full',
                            state.image === index
                              ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                              : 'border-border hover:border-muted-foreground'
                          )}
                        >
                          <img
                            src={image.url}
                            alt={image.altText ?? `${product.title} ${index + 1}`}
                            className='size-full object-cover'
                          />
                        </button>

                        <button
                          onClick={() => openLightbox(index)}
                          className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100'
                        >
                          <ZoomIn className='size-4 text-white' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className='flex aspect-square items-center justify-center rounded-2xl bg-muted shadow-inner'>
                <span className='text-lg text-muted-foreground'>Sin imágenes disponibles</span>
              </div>
            )}
          </div>

          <div className='mt-8 space-y-8 lg:col-span-5'>
            <form className='space-y-6'>
              {product.variants.length > 1 && (
                <div className='space-y-4'>
                  {(() => {
                    const optionGroups = product.variants.reduce(
                      (acc: Record<string, Set<string>>, variant) => {
                        variant.selectedOptions.forEach((option) => {
                          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                          if (!acc[ option.name ]) {
                            acc[ option.name ] = new Set()
                          }
                          acc[ option.name ].add(option.value)
                        })
                        return acc
                      },
                      {} as Record<string, Set<string>>
                    )

                    return Object.entries(optionGroups).map(([ optionName, values ]) => (
                      <div key={optionName} className='space-y-3'>
                        <h3 className='text-sm font-semibold uppercase tracking-wide text-foreground'>
                          {optionName}
                        </h3>
                        <div className='grid grid-cols-3 gap-2 sm:grid-cols-4'>
                          {Array.from(values).map((value) => {
                            const variantWithThisOption = product.variants.find((v) =>
                              v.selectedOptions.some(
                                (opt) => opt.name === optionName && opt.value === value
                              )
                            )

                            const isSelected = state.variant?.selectedOptions.some(
                              (opt) => opt.name === optionName && opt.value === value
                            )

                            return (
                              <Button
                                key={value}
                                type='button'
                                variant={isSelected ? 'default' : 'outline'}
                                size='sm'
                                onClick={() =>
                                  variantWithThisOption &&
                                  setState((previous) => ({
                                    ...previous,
                                    variant: variantWithThisOption,
                                  }))
                                }
                                disabled={!variantWithThisOption?.availableForSale}
                                className={classNames(
                                  'justify-center text-sm font-medium uppercase transition-all duration-200',
                                  !variantWithThisOption?.availableForSale
                                    ? 'opacity-50 cursor-not-allowed'
                                    : '',
                                  isSelected ? 'shadow-md scale-105' : 'hover:scale-105'
                                )}
                              >
                                {value}
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}

              <div className='pt-4'>
                <AddToCartButton
                  product={product}
                  selectedVariant={state.variant ?? undefined}
                  size='lg'
                  className='w-full'
                  showQuantitySelector={true}
                />
              </div>
            </form>

            {product.description && (
              <div className='border-t border-border pt-8'>
                <h3 className='mb-4 text-lg font-semibold text-foreground'>Descripción</h3>
                <div
                  className='prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground'
                  dangerouslySetInnerHTML={{
                    __html: product.description,
                  }}
                />
              </div>
            )}

            <div className='border-t border-border pt-8'>
              <h3 className='mb-4 text-lg font-semibold text-foreground'>Detalles del producto</h3>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='font-medium text-muted-foreground'>Tipo:</span>
                    <span className='text-foreground'>{product.productType || 'N/A'}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='font-medium text-muted-foreground'>SKU:</span>
                    <span className='font-mono text-foreground'>{state.variant?.sku ?? 'N/A'}</span>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='font-medium text-muted-foreground'>Proveedor:</span>
                    <span className='text-foreground'>{product.vendor || 'N/A'}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='font-medium text-muted-foreground'>Disponibilidad:</span>
                    <span
                      className={`font-medium ${product.availableForSale
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                        }`}
                    >
                      {product.availableForSale ? 'En stock' : 'Agotado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className='mt-16 lg:mt-24'>
            <div className='mb-8 flex items-center justify-between'>
              <div>
                <h2 className='text-2xl font-bold text-foreground sm:text-3xl'>
                  Productos relacionados
                </h2>
                <p className='mt-2 text-muted-foreground'>Descubre más obras similares</p>
              </div>
              <div className='hidden gap-2 sm:flex'>
                <Button variant='outline' size='icon' onClick={scrollPrev} className='size-10'>
                  <ChevronLeft className='size-4' />
                </Button>
                <Button variant='outline' size='icon' onClick={scrollNext} className='size-10'>
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>

            <div className='overflow-hidden' ref={emblaRef}>
              <div className='flex gap-4 md:gap-6'>
                {relatedProducts.map((relatedProduct) => (
                  <div key={relatedProduct.id} className='w-64 flex-none sm:w-72 md:w-80'>
                    <Card.Product product={relatedProduct} />
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-6 flex justify-center gap-2 sm:hidden'>
              <Button variant='outline' size='sm' onClick={scrollPrev}>
                <ChevronLeft className='mr-1 size-4' />
                Anterior
              </Button>
              <Button variant='outline' size='sm' onClick={scrollNext}>
                Siguiente
                <ChevronRight className='ml-1 size-4' />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={state.lightboxOpen} onOpenChange={closeLightbox}>
        <DialogContent className='h-[calc(100vh-4rem)] max-h-screen w-full max-w-screen-xl border-none bg-black/95 p-0'>
          <div className='relative flex size-full items-center justify-center'>
            <div className='relative flex size-full items-center justify-center p-4'>
              <img
                src={product.images[ state.lightboxImage ]?.url}
                alt={product.images[ state.lightboxImage ]?.altText ?? product.title}
                className='max-h-full max-w-full rounded-lg object-cover shadow-lg'
              />
            </div>

            {product.images.length > 1 && (
              <>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={prevLightboxImage}
                  className='absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full text-white hover:bg-white/20'
                >
                  <ChevronLeft className='size-8' />
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  onClick={nextLightboxImage}
                  className='absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full text-white hover:bg-white/20'
                >
                  <ChevronRight className='size-8' />
                </Button>
              </>
            )}
            {product.images.length > 1 && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm font-medium text-white'>
                {state.lightboxImage + 1} / {product.images.length}
              </div>
            )}

            {product.images.length > 1 && (
              <div className='absolute bottom-16 left-1/2 flex max-w-4xl -translate-x-1/2 gap-2 overflow-x-auto px-4'>
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setState((prev) => ({ ...prev, lightboxImage: index }))}
                    className={classNames(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200',
                      state.lightboxImage === index
                        ? 'border-white ring-2 ring-white/50'
                        : 'border-white/30 hover:border-white/70'
                    )}
                  >
                    <img
                      src={image.url}
                      alt={image.altText ?? `${product.title} ${index + 1}`}
                      className='size-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
