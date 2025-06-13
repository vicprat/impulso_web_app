// src/components/Cart/MiniCart.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCartActions } from '@/modules/customer/hooks/cart';
import { useAuth } from '@/modules/auth/context/useAuth';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, X, ExternalLink } from 'lucide-react';
import { formatCurrency } from '@/modules/customer/helpers';
import { toast } from 'sonner';
interface MiniCartProps {
  children?: React.ReactNode;
}

export function MiniCart({ children }: MiniCartProps) {
  const { isAuthenticated } = useAuth();
  const { cartSummary, updateQuantity, removeProduct, isUpdating, isRemoving } = useCartActions();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return children || (
      <Button variant="outline" size="sm" asChild>
        <Link href="/auth/login">
          <ShoppingCart className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  const itemCount = cartSummary?.itemCount || 0;
  const isEmpty = cartSummary?.isEmpty ?? true;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="relative">
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>
      
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>
            Carrito de compras
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            {isEmpty 
              ? 'Tu carrito está vacío' 
              : 'Revisa los productos en tu carrito'
            }
          </SheetDescription>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-1">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium">Tu carrito está vacío</p>
            <p className="text-sm text-muted-foreground">
              ¡Agrega algunos productos para comenzar!
            </p>
            <Button asChild className="mt-4">
              <Link href="/store" onClick={() => setOpen(false)}>
                Explorar productos
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-6">
              <div className="space-y-4">
                {cartSummary?.lines.map((line) => (
                  <div key={line.id} className="flex items-start space-x-4">
                    {/* Imagen del producto */}
                    <div className="aspect-square h-16 w-16 overflow-hidden rounded-md border">
                      {line.merchandise.image ? (
                        <img
                          src={line.merchandise.image.url}
                          alt={line.merchandise.image.altText || line.merchandise.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 space-y-1">
                      <h4 className="text-sm font-medium line-clamp-2">
                        {line.merchandise.product.title}
                      </h4>
                      
                      {line.merchandise?.selectedOptions?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {line.merchandise.selectedOptions
                            .map(option => `${option.name}: ${option.value}`)
                            .join(', ')
                          }
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {formatCurrency(
                            line.merchandise.price.amount, 
                            line.merchandise.price.currencyCode
                          )}
                        </p>

                        {/* Controles de cantidad */}
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            disabled={isUpdating || line.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          
                          <span className="w-8 text-center text-sm">
                            {line.quantity}
                          </span>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            disabled={isUpdating}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeProduct(line.id)}
                            disabled={isRemoving}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Total por línea */}
                      <p className="text-xs text-muted-foreground">
                        Subtotal: {formatCurrency(
                          line.cost.totalAmount.amount, 
                          line.cost.totalAmount.currencyCode
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Resumen y acciones */}
            <SheetFooter className="px-1">
              <div className="w-full space-y-4">
                {/* Resumen de precios */}
                <div className="space-y-2 rounded-lg bg-muted p-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>
                      {cartSummary?.subtotal && formatCurrency(
                        cartSummary.subtotal.amount, 
                        cartSummary.subtotal.currencyCode
                      )}
                    </span>
                  </div>
                  
                  {cartSummary?.tax && (
                    <div className="flex justify-between text-sm">
                      <span>Impuestos:</span>
                      <span>
                        {formatCurrency(
                          cartSummary.tax.amount, 
                          cartSummary.tax.currencyCode
                        )}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Total:</span>
                    <span>
                      {cartSummary?.total && formatCurrency(
                        cartSummary.total.amount, 
                        cartSummary.total.currencyCode
                      )}
                    </span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="grid gap-2">
                  <Button 
                    className="w-full"
                    onClick={async () => {
                      try {
                        if (!cartSummary?.lines?.length) {
                          toast.error('El carrito está vacío');
                          return;
                        }

                        const response = await fetch('/api/checkout/create', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            cartId: localStorage.getItem('shopify_cart_id'),
                          }),
                        });

                        const data = await response.json();

                        if (!data.success) {
                          throw new Error(data.error || 'Error al crear el checkout');
                        }

                        // Redirigir al checkout de Shopify
                        window.location.href = data.checkout.webUrl;
                      } catch (error) {
                        console.error('Error al procesar el checkout:', error);
                        toast.error('Error al procesar el checkout');
                      }
                    }}
                  >
                    Proceder al checkout
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/store/cart" onClick={() => setOpen(false)}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Ver carrito completo
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}