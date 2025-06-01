/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Product as ProductType} from '@/modules/shopify/types';
import { unstable_ViewTransition as ViewTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import React from 'react';

type Props ={
  product: ProductType;
}

export const Product: React.FC<Props> = ({ product }) => {
  const primaryImage = product.images[0];
  const price = product.priceRange.minVariantPrice;
  const comparePrice = product.variants?.[0]?.compareAtPrice;

  const discount = comparePrice && comparePrice.amount !== price.amount
    ? Math.round(((parseFloat(comparePrice.amount) - parseFloat(price.amount)) / parseFloat(comparePrice.amount)) * 100)
    : null;

  const transitionName = `product-image-${product.id}`;

  return (
    <Link href={`/store/product/${product.handle}`} className="group block">
      <Card className="border-0 shadow-none hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {primaryImage ? (
              <ViewTransition name={transitionName}>
                 <img 
                  src={primaryImage.url} 
                  alt={primaryImage.altText || product.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  style={{ 
                    viewTransitionName: transitionName
                  }}
                />
              </ViewTransition>
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Sin imagen</span>
              </div>
            )}
            
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {!product.availableForSale && (
                <Badge variant="destructive" className="text-xs font-medium shadow-sm">
                  Agotado
                </Badge>
              )}
              {discount && (
                <Badge className="bg-green-500 hover:bg-green-600 text-xs font-medium shadow-sm">
                  -{discount}%
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2 p-4">
            {product.vendor && (
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                {product.vendor}
              </p>
            )}
            
            <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {product.title}
            </h3>
            
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-foreground">
                ${price.amount}
              </p>
              {comparePrice && comparePrice.amount !== price.amount && (
                <p className="text-sm text-muted-foreground line-through">
                  ${comparePrice.amount}
                </p>
              )}
            </div>

            
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}