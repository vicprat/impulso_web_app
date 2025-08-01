/* eslint-disable @next/next/no-img-element */

'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Package,
  Palette,
  Ruler,
  User,
  Warehouse,
  ZoomIn
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState, unstable_ViewTransition as ViewTransition } from 'react'

import { AddToCartButton } from '@/components/Cart/AddToCartButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { type IProductForCart, type Variant } from '@/modules/shopify/types'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

// Tipo para producto plano (sin métodos de clase)
interface ProductData {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  productType: string
  vendor: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  images: {
    id?: string
    url: string
    altText: string | null
    width?: number
    height?: number
  }[]
  media: {
    id: string
    mediaContentType: string
    status: string
    image?: {
      id: string
      url: string
      altText: string | null
      width?: number
      height?: number
    }
  }[]
  variants: {
    id: string
    title: string
    availableForSale: boolean
    price: {
      amount: string
      currencyCode: string
    }
    compareAtPrice: {
      amount: string
      currencyCode: string
    } | null
    sku: string | null
    selectedOptions: {
      name: string
      value: string
    }[]
    inventoryQuantity: number | null
    inventoryManagement: 'SHOPIFY' | 'NOT_MANAGED' | null
    inventoryPolicy: 'DENY' | 'CONTINUE'
  }[]
  tags: string[]
  manualTags: string[]
  autoTags: string[]
  artworkDetails: {
    artist: string | null
    medium: string | null
    year: string | null
    height: string | null
    width: string | null
    depth: string | null
    serie: string | null
    location: string | null
  }
  // Getters
  primaryImage: {
    id?: string
    url: string
    altText: string | null
    width?: number
    height?: number
  } | null
  primaryVariant: {
    id: string
    title: string
    availableForSale: boolean
    price: {
      amount: string
      currencyCode: string
    }
    compareAtPrice: {
      amount: string
      currencyCode: string
    } | null
    sku: string | null
    selectedOptions: {
      name: string
      value: string
    }[]
    inventoryQuantity: number | null
    inventoryManagement: 'SHOPIFY' | 'NOT_MANAGED' | null
    inventoryPolicy: 'DENY' | 'CONTINUE'
  } | null
  formattedPrice: string
  isAvailable: boolean
  statusLabel: string
}

interface Props {
  product: ProductData
  relatedProducts: ProductData[]
}

// Adaptador para convertir Product a IProductForCart
const adaptProductForCart = (product: ProductData): IProductForCart => ({
  id: product.id,
  title: product.title,
  handle: product.handle,
  descriptionHtml: product.descriptionHtml,
  vendor: product.vendor,
  images: product.images,
  variants: product.variants,
  availableForSale: product.isAvailable,
  description: product.descriptionHtml,
  createdAt: new Date().toISOString(), // No tenemos esta info en el modelo Product
  priceRange: {
    minVariantPrice: product.primaryVariant?.price || { amount: '0', currencyCode: 'MXN' },
    maxVariantPrice: product.primaryVariant?.price || { amount: '0', currencyCode: 'MXN' },
  },
})

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

  const currentPrice = state.variant?.price ?? product.primaryVariant?.price
  const comparePrice = state.variant?.compareAtPrice
  const discount =
    comparePrice && comparePrice.amount !== currentPrice?.amount
      ? Math.round(
        ((parseFloat(comparePrice.amount) - parseFloat(currentPrice?.amount || '0')) /
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
    <div className='min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        <div className='lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8'>
          {/* Galería de Imágenes */}
          <div className='lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1'>
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

          {/* Información del Producto */}
          <div className='lg:col-span-5 lg:col-start-8'>
            <div className='space-y-6'>
              {/* Header con Título y Precio */}
              <div className='space-y-4'>
                <div>
                  <h1 className='text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl'>
                    {product.title}
                  </h1>
                  {product.vendor && (
                    <div className='mt-2 flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground sm:text-base'>
                      <User className='size-4' />
                      {product.vendor}
                    </div>
                  )}
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl'>
                        ${currentPrice?.amount || '0'}
                      </span>
                      {comparePrice && comparePrice.amount !== currentPrice?.amount && (
                        <span className='text-lg text-muted-foreground line-through sm:text-xl'>
                          ${comparePrice.amount}
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-muted-foreground'>{currentPrice?.currencyCode || 'MXN'}</p>
                  </div>
                  {discount && (
                    <Badge className='bg-green-500 text-xs hover:bg-green-600'>
                      -{discount}% OFF
                    </Badge>
                  )}
                </div>

                <div className='flex items-center gap-2'>
                  <Badge
                    variant={product.isAvailable ? 'default' : 'destructive'}
                    className='px-3 py-1 text-sm'
                  >
                    {product.isAvailable ? 'En stock' : 'Agotado'}
                  </Badge>
                  {product.status === 'DRAFT' && (
                    <Badge variant='secondary' className='px-3 py-1 text-sm'>
                      Borrador
                    </Badge>
                  )}
                </div>
              </div>

              {/* Formulario de Compra */}
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
                    product={adaptProductForCart(product)}
                    selectedVariant={state.variant ?? undefined}
                    size='lg'
                    className='w-full'
                    showQuantitySelector={true}
                  />
                </div>
              </form>

              {/* Detalles de la Obra */}
              {product.artworkDetails && (
                <Card className='border-border bg-card shadow-sm'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-foreground'>
                      <Palette className='size-5 text-primary' />
                      Detalles de la Obra
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    {product.artworkDetails.medium && (
                      <div className='flex items-center gap-2'>
                        <FileText className='size-4 text-muted-foreground' />
                        <div>
                          <p className='text-xs text-muted-foreground'>Técnica</p>
                          <p className='text-sm font-medium'>{product.artworkDetails.medium}</p>
                        </div>
                      </div>
                    )}
                    {product.artworkDetails.year && (
                      <div className='flex items-center gap-2'>
                        <Calendar className='size-4 text-muted-foreground' />
                        <div>
                          <p className='text-xs text-muted-foreground'>Año</p>
                          <p className='text-sm font-medium'>{product.artworkDetails.year}</p>
                        </div>
                      </div>
                    )}
                    {(product.artworkDetails.width || product.artworkDetails.height || product.artworkDetails.depth) && (
                      <div className='flex items-center gap-2'>
                        <Ruler className='size-4 text-muted-foreground' />
                        <div>
                          <p className='text-xs text-muted-foreground'>Medidas (cm)</p>
                          <p className='text-sm font-medium'>
                            {product.artworkDetails.height} x {product.artworkDetails.width} {product.artworkDetails.depth ? `x ${product.artworkDetails.depth}` : ''}
                          </p>
                        </div>
                      </div>
                    )}
                    {product.artworkDetails.serie && (
                      <div className='flex items-center gap-2'>
                        <ImageIcon className='size-4 text-muted-foreground' />
                        <div>
                          <p className='text-xs text-muted-foreground'>Serie</p>
                          <p className='text-sm font-medium'>{product.artworkDetails.serie}</p>
                        </div>
                      </div>
                    )}
                    {product.artworkDetails.location && (
                      <div className='flex items-center gap-2'>
                        <Warehouse className='size-4 text-muted-foreground' />
                        <div>
                          <p className='text-xs text-muted-foreground'>Ubicación</p>
                          <p className='text-sm font-medium'>{product.artworkDetails.location}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Detalles del Producto */}
              <Card className='border-border bg-card shadow-sm'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-foreground'>
                    <Package className='size-5 text-primary' />
                    Detalles del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
                        className={`font-medium ${product.isAvailable
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                          }`}
                      >
                        {product.isAvailable ? 'En stock' : 'Agotado'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Descripción */}
              {product.descriptionHtml && (
                <Card className='border-border bg-card shadow-sm'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='text-foreground'>Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className='prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-a:text-primary prose-strong:text-foreground'
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml,
                      }}
                    />
                  </CardContent>
                </Card>
              )}


            </div>
          </div>
        </div>

        {/* Productos Relacionados */}
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
                    <Card className='group relative overflow-hidden border bg-card shadow-sm transition-all duration-300 hover:shadow-md'>
                      <Link
                        href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, { handle: relatedProduct.handle })}
                        className='block focus:outline-none'
                      >
                        <div className='relative aspect-square overflow-hidden bg-muted'>
                          {relatedProduct.images[ 0 ] ? (
                            <img
                              src={relatedProduct.images[ 0 ].url}
                              alt={relatedProduct.images[ 0 ].altText ?? relatedProduct.title}
                              className='size-full object-cover transition-all duration-500 group-hover:scale-105'
                              loading='lazy'
                            />
                          ) : (
                            <div className='flex size-full items-center justify-center bg-muted'>
                              <span className='text-muted-foreground'>Sin imagen</span>
                            </div>
                          )}
                        </div>
                        <CardContent className='p-4'>
                          <div className='space-y-2'>
                            <h3 className='font-semibold text-foreground line-clamp-2'>
                              {relatedProduct.title}
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                              {relatedProduct.vendor}
                            </p>
                            <p className='font-medium text-foreground'>
                              {relatedProduct.formattedPrice}
                            </p>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
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

      {/* Lightbox */}
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
