'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useRoutes } from '@/hooks/useRoutes';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/modules/customer/hooks/cart';

export const StoreNav = () => {
  const pathname = usePathname();
  const { storeNavRoutes } = useRoutes();
  const { data } = useCart();

  return (
    <nav className="flex items-center space-x-6">
      {storeNavRoutes.map((route) => (
        <Link
          key={route.path}
          href={route.path}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === route.path 
              ? "text-foreground" 
              : "text-muted-foreground"
          )}
        >
          {route.label}
        </Link>
      ))}
      
      {/* Carrito con badge dinámico */}
      <Link href="/store/cart">
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {(data?.totalQuantity ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
              {data?.totalQuantity ?? 0}
            </span>
          )}
        </Button>
      </Link>
    </nav>
  );
};