/* eslint-disable @next/next/no-img-element */

'use client';

import { useState, useEffect } from 'react';
import { Product, Variant } from '@/modules/shopify/types';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {  Truck, Shield, RotateCcw, CreditCard } from 'lucide-react';

type Props = {
  product: Product;
}

type State = {
  variant: Variant | null;
  image: number;
}

const INITIAL_STATE: State = {
  variant: null,
  image: 0,
}

// Mock policies - en un caso real vendrían de props o context
const policies = [
  { 
    name: 'Envío gratis', 
    icon: Truck, 
    description: 'En pedidos mayores a $1000' 
  },
  { 
    name: 'Garantía', 
    icon: Shield, 
    description: '30 días de garantía' 
  },
  { 
    name: 'Devoluciones', 
    icon: RotateCcw, 
    description: 'Fácil y sin costo' 
  },
  { 
    name: 'Pago seguro', 
    icon: CreditCard, 
    description: 'Transacciones protegidas' 
  },
];

export const Client: React.FC<Props> = ({ product }) =>  {
  const [state, setState] = useState(INITIAL_STATE);

  const currentPrice = state.variant?.price ?? product.priceRange.minVariantPrice;
  const comparePrice = state.variant?.compareAtPrice;
  const discount = comparePrice && comparePrice.amount !== currentPrice.amount
    ? Math.round(((parseFloat(comparePrice.amount) - parseFloat(currentPrice.amount)) / parseFloat(comparePrice.amount)) * 100)
    : null;

  const transitionName = `product-image-${product.id}`;

  useEffect(() => {
    if (product.variants && product.variants.length > 0 && !state.variant) {
      setState(previous => ({ ...previous, variant: product.variants[0] }));
    }
  }, [product.variants, state.variant]);

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
          
          {/* Product Info Section - Mobile First, Desktop Right */}
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-foreground lg:text-3xl">{product.title}</h1>
                {product.vendor && (
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mt-1">
                    {product.vendor}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-2xl font-bold text-foreground lg:text-3xl">
                    ${currentPrice.amount}
                  </span>
                  {comparePrice && comparePrice.amount !== currentPrice.amount && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${comparePrice.amount}
                    </span>
                  )}
                </div>
                {discount && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-xs mt-1">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Availability Status */}
            <div className="mt-4">
              <Badge 
                variant={product.availableForSale ? "default" : "destructive"}
                className="text-sm"
              >
                {product.availableForSale ? 'En stock' : 'Agotado'}
              </Badge>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mt-8 lg:col-span-7 lg:col-start-1 lg:row-span-3 lg:row-start-1 lg:mt-0">
            <h2 className="sr-only">Imágenes del producto</h2>

            {product.images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <ViewTransition name={transitionName}>
                    <img
                      src={product.images[state.image]?.url}
                      alt={product.images[state.image]?.altText || product.title}
                      className="w-full h-full object-cover view-transition-image hover:scale-105 transition-transform duration-300"
                      style={{ viewTransitionName: transitionName }}
                    />
                  </ViewTransition>
                </div>
                
                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 lg:grid-cols-6">
                    {product.images.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setState(previous => ({ ...previous, image: index }))}
                        className={classNames(
                          'aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 hover:scale-105',
                          state.image === index 
                            ? 'border-primary ring-2 ring-primary/20' 
                            : 'border-border hover:border-muted-foreground'
                        )}
                      >
                        <img 
                          src={image.url} 
                          alt={image.altText ?? `${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground">Sin imágenes disponibles</span>
              </div>
            )}
          </div>

          {/* Product Options and Add to Cart */}
          <div className="mt-8 lg:col-span-5">
            <form className="space-y-6">
              {/* Variant Options */}
              {product.variants && product.variants.length > 1 && (
                <div className="space-y-4">
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
                      <div key={optionName} className="space-y-3">
                        <h3 className="text-sm font-medium text-foreground">{optionName}</h3>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {Array.from(values).map(value => {
                            const variantWithThisOption = product.variants.find(v => 
                              v.selectedOptions.some(opt => 
                                opt.name === optionName && opt.value === value
                              )
                            );

                            const isSelected = state.variant?.selectedOptions.some(opt =>
                              opt.name === optionName && opt.value === value
                            );

                            return (
                              <Button
                                key={value}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => variantWithThisOption && setState(previous => ({ ...previous, variant: variantWithThisOption }))}
                                disabled={!variantWithThisOption?.availableForSale}
                                className={classNames(
                                  "justify-center text-sm font-medium uppercase transition-colors",
                                  !variantWithThisOption?.availableForSale ? "opacity-50 cursor-not-allowed" : ""
                                )}
                              >
                                {value}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                type="button"
                size="lg"
                disabled={!product.availableForSale || !state.variant?.availableForSale}
                className="w-full"
              >
                {product.availableForSale ? 'Agregar al carrito' : 'Producto agotado'}
              </Button>
            </form>

            {/* Product Description */}
            {product.description && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-foreground">Descripción</h3>
                <div 
                  className="mt-4 prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                />
              </div>
            )}

            {/* Product Details */}
            <div className="mt-8 border-t border-border pt-8">
              <h3 className="text-sm font-medium text-foreground">Detalles del producto</h3>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="text-foreground">{product.productType || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="text-foreground">{state.variant?.sku || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proveedor:</span>
                  <span className="text-foreground">{product.vendor || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Policies Section */}
            <div className="mt-8">
              <h3 className="sr-only">Nuestras políticas</h3>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 xl:grid-cols-2">
                {policies.map((policy) => (
                  <Card key={policy.name} className="border-border">
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <policy.icon className="h-6 w-6 text-muted-foreground" />
                        <div>
                          <h4 className="text-sm font-medium text-foreground">{policy.name}</h4>
                          <p className="text-xs text-muted-foreground">{policy.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}