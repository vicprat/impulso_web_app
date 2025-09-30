'use client'

import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { type Product as ProductType } from '@/modules/shopify/types'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

interface Props {
  product: ProductType
}

export const Product: React.FC<Props> = ({ product }) => {
  const minPrice = product?.priceRange?.minVariantPrice ?? { amount: '0', currencyCode: 'MXN' }
  const maxPrice = product?.priceRange?.maxVariantPrice ?? { amount: '0', currencyCode: 'MXN' }

  const hasVariations = minPrice.amount !== maxPrice.amount || product.variants.length > 1

  const variant = product.variants[0]
  const hasDiscount =
    variant.compareAtPrice &&
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)

  const discountPercentage =
    hasDiscount && variant.compareAtPrice
      ? Math.round(
          ((parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)) /
            parseFloat(variant.compareAtPrice.amount)) *
            100
        )
      : 0

  // Función para formatear el precio
  const formatPrice = (price: string, currencyCode: string) => {
    const priceValue = parseFloat(price)
    if (priceValue === 0) {
      return 'Entrada gratuita'
    }
    return `$${price} ${currencyCode}`
  }

  return (
    <Card
      className='focus-within:ring-primary/20 group relative overflow-hidden border bg-card shadow-elevation-1 transition-all duration-300 focus-within:shadow-elevation-4 focus-within:ring-2 hover:shadow-elevation-3'
      style={{
        viewTransitionName: `product-image-${product.id}`,
      }}
    >
      {/* Badges Container */}
      <div className='absolute inset-x-3 top-3 z-20 flex items-start justify-between'>
        {hasDiscount && (
          <Badge className='hover:bg-error/90 bg-error-container text-on-error shadow-elevation-2 backdrop-blur-sm transition-all duration-200 hover:scale-105'>
            -{discountPercentage}%
          </Badge>
        )}

        {!product.availableForSale && (
          <Badge className='bg-error-container text-error shadow-elevation-2 backdrop-blur-sm'>
            Agotado
          </Badge>
        )}
      </div>

      <Link
        href={
          product.vendor === 'Evento'
            ? replaceRouteParams(ROUTES.STORE.EVENT_DETAIL.PATH, { handle: product.handle })
            : replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, { handle: product.handle })
        }
        className='block focus:outline-none'
        aria-label={`Ver detalles de ${product.title}`}
      >
        <div className='relative aspect-square overflow-hidden bg-muted'>
          {product.images[0] ? (
            <>
              <img
                src={product.images[0].url}
                alt={product.images[0].altText ?? product.title}
                className='size-full object-cover transition-all duration-500 group-focus-within:scale-105 group-hover:scale-110'
                loading='lazy'
                decoding='async'
                fetchPriority='low'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                style={{
                  viewTransitionName: `product-image-${product.id}`,
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </>
          ) : (
            <div className='group-hover:bg-muted/80 flex size-full items-center justify-center bg-muted transition-colors duration-300'>
              <Logo asLink={false} />
            </div>
          )}

          <div className='absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0'>
            <div className='bg-card/90 border-t border-border p-3 backdrop-blur-sm'>
              <p className='text-center text-xs text-muted-foreground'>
                {hasVariations ? 'Ver opciones disponibles' : 'Ver detalles del producto'}
              </p>
            </div>
          </div>
        </div>
      </Link>

      <CardContent className='space-y-4 bg-card p-4'>
        <div className='space-y-2'>
          <div className='space-y-1'>
            <Link
              href={
                product.vendor === 'Evento'
                  ? replaceRouteParams(ROUTES.STORE.EVENT_DETAIL.PATH, { handle: product.handle })
                  : replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, { handle: product.handle })
              }
            >
              <h3 className='line-clamp-2 font-medium leading-tight text-foreground transition-colors duration-200 hover:text-primary focus:text-primary focus:outline-none'>
                {product.title}
              </h3>
            </Link>
            {product.vendor && product.vendor !== 'Evento' && (
              <p className='text-sm font-normal uppercase tracking-wide text-muted-foreground'>
                {product.vendor}
              </p>
            )}
          </div>

          {product.description && (
            <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
              {product.description.replace(/(<([^>]+)>)/gi, '')}
            </p>
          )}
        </div>
        <div className='space-y-2'>
          <div className='flex flex-wrap items-baseline gap-2'>
            {hasVariations ? (
              <span className='text-lg font-semibold tracking-tight text-foreground'>
                Desde {formatPrice(minPrice.amount, minPrice.currencyCode)}
              </span>
            ) : (
              <span className='text-lg font-semibold tracking-tight text-foreground'>
                {formatPrice(minPrice.amount, minPrice.currencyCode)}
              </span>
            )}

            {hasDiscount && variant.compareAtPrice && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground line-through decoration-2'>
                  {formatPrice(variant.compareAtPrice.amount, variant.compareAtPrice.currencyCode)}
                </span>
                <Badge
                  variant='outline'
                  className='border-success/20 bg-success-container px-2 py-0.5 text-xs text-success'
                >
                  Ahorro:{' '}
                  {formatPrice(
                    (
                      parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)
                    ).toFixed(2),
                    variant.compareAtPrice.currencyCode
                  )}
                </Badge>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <div
                className={`size-2 rounded-full transition-colors duration-200 ${
                  product.availableForSale ? 'bg-success' : 'bg-error'
                }`}
              />
              <span className='text-xs text-muted-foreground'>
                {product.availableForSale ? 'Disponible' : 'Sin stock'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
