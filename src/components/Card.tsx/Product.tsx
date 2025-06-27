/* eslint-disable @next/next/no-img-element */
'use client'

import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Badge } from '@/components/ui/badge'
import { type Product as ProductType } from '@/modules/shopify/types'

interface Props {
  product: ProductType
  showAddToCart?: boolean
}

export const Product: React.FC<Props> = ({ product }) => {
  const primaryImage = product.images[0]
  const minPrice = product.priceRange.minVariantPrice
  const maxPrice = product.priceRange.maxVariantPrice
  const hasVariations = minPrice?.amount !== maxPrice?.amount || product.variants.length > 1

  const variant = product.variants[0]
  const hasDiscount =
    variant?.compareAtPrice &&
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount)

  const discountPercentage =
    hasDiscount && variant.compareAtPrice
      ? Math.round(
          ((parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)) /
            parseFloat(variant.compareAtPrice.amount)) *
            100
        )
      : 0

  return (
    <div className='bg-surface-container border-outline-variant group relative overflow-hidden rounded-xl border hover:shadow-lg'>
      {hasDiscount && (
        <Badge className='absolute left-3 top-3 z-10 bg-red-500 text-white hover:bg-red-600'>
          -{discountPercentage}%
        </Badge>
      )}

      {!product.availableForSale && (
        <Badge variant='destructive' className='absolute right-3 top-3 z-10'>
          Agotado
        </Badge>
      )}

      <Link href={`/store/product/${product.handle}`} className='block'>
        <div className='bg-surface-container-high aspect-square overflow-hidden'>
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              className='size-full object-cover transition-transform duration-300 group-hover:scale-105'
              loading='lazy'
            />
          ) : (
            <div className='bg-surface-container-highest flex size-full items-center justify-center'>
              <Logo />
            </div>
          )}
        </div>

        <div className='space-y-3 p-4'>
          <div className='space-y-1'>
            <h3 className='text-on-surface line-clamp-2 font-medium transition-colors group-hover:text-primary'>
              {product.title}
            </h3>
            {product.vendor && <p className='text-on-surface-variant text-sm'>{product.vendor}</p>}
          </div>

          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              {hasVariations ? (
                <span className='text-on-surface text-lg font-semibold'>
                  Desde ${minPrice.amount}
                </span>
              ) : (
                <span className='text-on-surface text-lg font-semibold'>${minPrice.amount}</span>
              )}

              {hasDiscount && variant.compareAtPrice && (
                <span className='text-on-surface-variant text-sm line-through'>
                  ${variant.compareAtPrice.amount}
                </span>
              )}
            </div>

            <p className='text-on-surface-variant text-xs'>{minPrice.currencyCode}</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
