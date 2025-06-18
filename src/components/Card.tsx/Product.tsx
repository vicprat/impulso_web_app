/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Product as ProductType } from '@/modules/shopify/types';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';

type Props = {
  product: ProductType;
  showAddToCart?: boolean;
};

export const Product: React.FC<Props> = ({ 
  product, 
}) => {
  const primaryImage = product.images[0];
  const minPrice = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasVariations = minPrice?.amount !== maxPrice?.amount || product.variants.length > 1;
  
  const variant = product.variants[0];
  const hasDiscount = variant?.compareAtPrice && 
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);
  
  const discountPercentage = hasDiscount && variant.compareAtPrice
    ? Math.round(
        ((parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)) /
          parseFloat(variant.compareAtPrice.amount)) *
          100
      )
    : 0;

  return (
    <div className="group relative bg-surface-container rounded-xl overflow-hidden border border-outline-variant hover:shadow-lg">
      {hasDiscount && (
        <Badge 
          className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600 text-white"
        >
          -{discountPercentage}%
        </Badge>
      )}

      {!product.availableForSale && (
        <Badge 
          variant="destructive" 
          className="absolute top-3 right-3 z-10"
        >
          Agotado
        </Badge>
      )}

      <Link 
        href={`/store/product/${product.handle}`}
        className="block"
      >
        <div className="aspect-square overflow-hidden bg-surface-container-high">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-surface-container-highest">
              <Logo />
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-medium text-on-surface line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            {product.vendor && (
              <p className="text-sm text-on-surface-variant">
                {product.vendor}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {hasVariations ? (
                <span className="text-lg font-semibold text-on-surface">
                  Desde ${minPrice.amount}
                </span>
              ) : (
                <span className="text-lg font-semibold text-on-surface">
                  ${minPrice.amount}
                </span>
              )}
              
              {hasDiscount && variant.compareAtPrice && (
                <span className="text-sm text-on-surface-variant line-through">
                  ${variant.compareAtPrice.amount}
                </span>
              )}
            </div>
            
            <p className="text-xs text-on-surface-variant">
              {minPrice.currencyCode}
            </p>
          </div>
        </div>
      </Link>

    </div>
  );
};

