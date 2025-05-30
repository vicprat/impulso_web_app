/* eslint-disable @next/next/no-img-element */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useProductByHandle } from '@/modules/shopify/hooks';
import { Variant } from '@/modules/shopify/types';

export default function ProductPage() {
  const params = useParams();
  const productHandle = params.handle as string;
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useProductByHandle(productHandle);

  useState(() => {
    if (product?.variants && product.variants.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600">Producto no encontrado</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.priceRange.minVariantPrice;
  const comparePrice = selectedVariant?.compareAtPrice;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          {product.images.length > 0 && (
            <>
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <img 
                  src={product.images[selectedImage]?.url} 
                  alt={product.images[selectedImage]?.altText || product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square overflow-hidden rounded border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={image.url} 
                        alt={image.altText || `${product.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.title}</h1>
            <p className="text-gray-600 mt-2">{product.vendor}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-blue-600">
                ${currentPrice.amount} {currentPrice.currencyCode}
              </span>
              {comparePrice && (
                <span className="text-xl text-gray-500 line-through">
                  ${comparePrice.amount} {comparePrice.currencyCode}
                </span>
              )}
            </div>
            
            {!product.availableForSale && (
              <p className="text-red-600 font-medium">Producto agotado</p>
            )}
          </div>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Opciones:</h3>
              
              {/* Group variants by option names */}
              {(() => {
                const optionGroups = product.variants.reduce((acc, variant) => {
                  variant.selectedOptions.forEach(option => {
                    if (!acc[option.name]) {
                      acc[option.name] = new Set();
                    }
                    acc[option.name].add(option.value);
                  });
                  return acc;
                }, {} as Record<string, Set<string>>);

                return Object.entries(optionGroups).map(([optionName, values]) => (
                  <div key={optionName} className="space-y-2">
                    <label className="font-medium">{optionName}:</label>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(values).map(value => {
                        const variantWithThisOption = product.variants.find(v => 
                          v.selectedOptions.some(opt => 
                            opt.name === optionName && opt.value === value
                          )
                        );
                        
                        const isSelected = selectedVariant?.selectedOptions.some(opt => 
                          opt.name === optionName && opt.value === value
                        );

                        return (
                          <button
                            key={value}
                            onClick={() => variantWithThisOption && setSelectedVariant(variantWithThisOption)}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                              isSelected
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            } ${
                              !variantWithThisOption?.availableForSale 
                                ? 'opacity-50 cursor-not-allowed' 
                                : ''
                            }`}
                            disabled={!variantWithThisOption?.availableForSale}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* Add to Cart */}
          <button
            disabled={!product.availableForSale || !selectedVariant?.availableForSale}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {product.availableForSale ? 'Agregar al carrito' : 'Producto agotado'}
          </button>

          {/* Product Description */}
          {product.description && (
            <div className="space-y-2">
              <h3 className="font-semibold">Descripción:</h3>
              <div 
                className="text-gray-600 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
              />
            </div>
          )}

          {/* Product Details */}
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Tipo:</strong> {product.productType}</p>
            <p><strong>SKU:</strong> {selectedVariant?.sku || 'N/A'}</p>
            <p><strong>Proveedor:</strong> {product.vendor}</p>
          </div>
        </div>
      </div>
    </div>
  );
}