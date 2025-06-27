/* eslint-disable @next/next/no-img-element */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product, Variant } from '@/modules/shopify/types';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { AddToCartButton } from '@/components/Cart/AddToCartButton';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/Card.tsx';

type Props = {
  product: Product;
  relatedProducts: Product[]; 
}

type State = {
  variant: Variant | null;
  image: number;
  lightboxOpen: boolean;
  lightboxImage: number;
}

const INITIAL_STATE: State = {
  variant: null,
  image: 0,
  lightboxOpen: false,
  lightboxImage: 0,
}

export const Client: React.FC<Props> = ({ product, relatedProducts }) => {
  const [state, setState] = useState(INITIAL_STATE);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: true
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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

  const openLightbox = (imageIndex: number) => {
    setState(prev => ({ 
      ...prev, 
      lightboxOpen: true, 
      lightboxImage: imageIndex 
    }));
  };

  const closeLightbox = () => {
    setState(prev => ({ 
      ...prev, 
      lightboxOpen: false 
    }));
  };

  const nextLightboxImage = () => {
    setState(prev => ({ 
      ...prev, 
      lightboxImage: (prev.lightboxImage + 1) % product.images.length 
    }));
  };

  const prevLightboxImage = () => {
    setState(prev => ({ 
      ...prev, 
      lightboxImage: prev.lightboxImage === 0 ? product.images.length - 1 : prev.lightboxImage - 1 
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.lightboxOpen) return;
      
      switch (e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          prevLightboxImage();
          break;
        case 'ArrowRight':
          nextLightboxImage();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.lightboxOpen]);

  return (
    <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="lg:grid lg:auto-rows-min lg:grid-cols-12 lg:gap-x-8">
          
          <div className="lg:col-span-5 lg:col-start-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                  {product.title}
                </h1>
                {product.vendor && (
                  <p className="text-sm sm:text-base text-muted-foreground uppercase tracking-wide font-medium mt-2">
                    {product.vendor}
                  </p>
                )}
              </div>
              <div className="text-right sm:text-left lg:text-right">
                <div className="flex flex-row sm:flex-col lg:flex-row items-center sm:items-end lg:items-center gap-2 justify-end">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                    ${currentPrice.amount}
                  </span>
                  {comparePrice && comparePrice.amount !== currentPrice.amount && (
                    <span className="text-lg sm:text-xl text-muted-foreground line-through">
                      ${comparePrice.amount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentPrice.currencyCode}
                </p>
                {discount && (
                  <Badge className="bg-green-500 hover:bg-green-600 text-xs mt-2">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>
            </div>

            {/* Availability Status */}
            <div className="mt-6">
              <Badge 
                variant={product.availableForSale ? "default" : "destructive"}
                className="text-sm px-3 py-1"
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
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-lg group cursor-pointer">
                  <ViewTransition name={transitionName}>
                    <img
                      src={product.images[state.image]?.url}
                      alt={product.images[state.image]?.altText || product.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      style={{ viewTransitionName: transitionName }}
                      onClick={() => openLightbox(state.image)}
                    />
                  </ViewTransition>
                  
                  {/* Overlay con ícono de zoom */}
                  <div 
                    className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                    onClick={() => openLightbox(state.image)}
                  >
                    <div className="bg-black/50 rounded-full p-3 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <ZoomIn className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-6">
                    {product.images.map((image, index) => (
                      <div key={image.id} className="relative group">
                        <button
                          onClick={() => setState(previous => ({ ...previous, image: index }))}
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
                            className="w-full h-full object-cover"
                          />
                        </button>
                        
                        {/* Botón para abrir lightbox en thumbnail */}
                        <button
                          onClick={() => openLightbox(index)}
                          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center"
                        >
                          <ZoomIn className="h-4 w-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square bg-muted rounded-2xl flex items-center justify-center shadow-inner">
                <span className="text-muted-foreground text-lg">Sin imágenes disponibles</span>
              </div>
            )}
          </div>

          {/* Product Options and Add to Cart */}
          <div className="mt-8 lg:col-span-5 space-y-8">
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
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                          {optionName}
                        </h3>
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
                                  "justify-center text-sm font-medium uppercase transition-all duration-200",
                                  !variantWithThisOption?.availableForSale ? "opacity-50 cursor-not-allowed" : "",
                                  isSelected ? "shadow-md scale-105" : "hover:scale-105"
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
              <div className="pt-4">
                <AddToCartButton
                  product={product}
                  selectedVariant={state.variant || undefined}
                  size="lg"
                  className="w-full"
                  showQuantitySelector={true}
                />
              </div>
            </form>

            {/* Product Description */}
            {product.description && (
              <div className="border-t border-border pt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Descripción</h3>
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml || product.description }}
                />
              </div>
            )}

            {/* Product Details */}
            <div className="border-t border-border pt-8">
              <h3 className="text-lg font-semibold text-foreground mb-4">Detalles del producto</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Tipo:</span>
                    <span className="text-foreground">{product.productType || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">SKU:</span>
                    <span className="text-foreground font-mono">{state.variant?.sku || 'N/A'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Proveedor:</span>
                    <span className="text-foreground">{product.vendor || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Disponibilidad:</span>
                    <span className={`font-medium ${product.availableForSale ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {product.availableForSale ? 'En stock' : 'Agotado'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Productos relacionados
                </h2>
                <p className="text-muted-foreground mt-2">
                  Descubre más obras similares
                </p>
              </div>
              <div className="hidden sm:flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4 md:gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div 
                    key={relatedProduct.id} 
                    className="flex-none w-64 sm:w-72 md:w-80"
                  >
                    <Card.Product 
                      product={relatedProduct} 
                      showAddToCart={true}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile carousel controls */}
            <div className="flex justify-center gap-2 mt-6 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollPrev}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollNext}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <Dialog open={state.lightboxOpen} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-screen-xl w-full h-[calc(100vh-4rem)] max-h-screen p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">

            {/* Imagen principal */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <img
                src={product.images[state.lightboxImage]?.url}
                alt={product.images[state.lightboxImage]?.altText || product.title}
                className="max-w-full max-h-full object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Controles de navegación */}
            {product.images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevLightboxImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-50"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextLightboxImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 rounded-full z-50"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Indicador de imagen actual */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-4 py-2 text-white text-sm font-medium">
                {state.lightboxImage + 1} / {product.images.length}
              </div>
            )}

            {/* Thumbnails de navegación */}
            {product.images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-4xl overflow-x-auto px-4">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setState(prev => ({ ...prev, lightboxImage: index }))}
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
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}