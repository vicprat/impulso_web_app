'use client';

import Link from 'next/link';
import { Product as ProductType } from '@/modules/shopify/types';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/Cart/AddToCartButton';

type ProductCardProps = {
  product: ProductType;
  showAddToCart?: boolean;
};

export const Product: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = true 
}) => {
  const primaryImage = product.images[0];
  const minPrice = product.priceRange.minVariantPrice;
  const maxPrice = product.priceRange.maxVariantPrice;
  const hasVariations = minPrice?.amount !== maxPrice?.amount || product.variants.length > 1;
  
  // Verificar si hay descuento
  const variant = product.variants[0];
  const hasDiscount = variant?.compareAtPrice && 
    parseFloat(variant.compareAtPrice.amount) > parseFloat(variant.price.amount);
  
  const discountPercentage = hasDiscount 
    ? Math.round(((parseFloat(variant.compareAtPrice.amount) - parseFloat(variant.price.amount)) / parseFloat(variant.compareAtPrice.amount)) * 100)
    : 0;

  return (
    <div className="group relative bg-surface-container rounded-xl overflow-hidden border border-outline-variant hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      {/* Badge de descuento */}
      {hasDiscount && (
        <Badge 
          className="absolute top-3 left-3 z-10 bg-red-500 hover:bg-red-600 text-white"
        >
          -{discountPercentage}%
        </Badge>
      )}

      {/* Badge de disponibilidad */}
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
        {/* Imagen del producto */}
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
              <span className="text-on-surface-variant text-sm">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4 space-y-3">
          {/* Título y marca */}
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

          {/* Precio */}
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

      {/* Botón de agregar al carrito */}
      {showAddToCart && product.availableForSale && (
        <div className="p-4 pt-0">
          <AddToCartButton 
            product={product}
            selectedVariant={product.variants[0]}
            size="sm"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

