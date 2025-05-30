/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Product as ProductType} from '@/modules/shopify/types';
import React from 'react';

type Props ={
  product: ProductType;
}

export const Product: React.FC<Props> = ({ product }) => {
  const primaryImage = product.images[0];
  const secondaryImage = product.images[1];
  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.variants?.[0]?.compareAtPrice;

  // Calcular descuento si hay precio de comparación
  const discount = comparePrice && comparePrice.amount !== price.amount
    ? Math.round(((parseFloat(comparePrice.amount) - parseFloat(price.amount)) / parseFloat(comparePrice.amount)) * 100)
    : null;

  return (
    <Link href={`/store/product/${product.handle}`} className="group block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage && (
            <>
              <img 
                src={primaryImage.url} 
                alt={primaryImage.altText || product.title}
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              />
              {secondaryImage && (
                <img 
                  src={secondaryImage.url} 
                  alt={secondaryImage.altText || product.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              )}
            </>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {!product.availableForSale && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                Agotado
              </span>
            )}
            {discount && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <span className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
              Ver detalles
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-2">
          {/* Vendor */}
          {product.vendor && (
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {product.vendor}
            </p>
          )}
          
          {/* Title */}
          <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              ${price.amount} {price.currencyCode}
            </span>
            {comparePrice && comparePrice.amount !== price.amount && (
              <span className="text-sm text-gray-500 line-through">
                ${comparePrice.amount}
              </span>
            )}
          </div>

          {/* Product Type */}
          {product.productType && (
            <p className="text-xs text-gray-400">
              {product.productType}
            </p>
          )}

          {/* Availability Status */}
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${
              product.availableForSale 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {product.availableForSale ? 'Disponible' : 'Agotado'}
            </span>
            
            {/* Variants count */}
            {product.variants && product.variants.length > 1 && (
              <span className="text-xs text-gray-500">
                {product.variants.length} opciones
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

