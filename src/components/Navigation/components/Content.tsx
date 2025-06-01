"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  SlidersHorizontal, 
  ArrowLeft, 
  Home, 
  ChevronRight,
  Store,
  FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Content = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toggleSidebar } = useSidebar();
  
  const navItems = [
    { 
      href: '/store', 
      label: 'Todos los productos', 
      exact: true,
      description: 'Explora todo nuestro catálogo',
      icon: Store
    },
    { 
      href: '/store/collections', 
      label: 'Colecciones', 
      exact: false,
      description: 'Productos organizados por categorías',
      icon: FolderOpen
    },
  ];

  const isSearchPage = pathname.includes('/search');
  const searchQuery = searchParams.get('q');
  
  const isCollectionPage = pathname.includes('/collections/') && pathname.split('/').length > 3;
  const collectionHandle = isCollectionPage ? pathname.split('/').pop() : null;

  const activeFiltersCount = 0; 

  return (
    <div >
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="hidden lg:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className={cn(
                  "gap-2 px-4 py-2 h-10",
                  "text-on-surface-variant hover:text-on-surface",
                  "hover:bg-surface-container-high",
                  "transition-colors duration-200",
                  "border border-outline-variant/40 hover:border-outline-variant/60",
                  "shadow-sm hover:shadow-md",
                  "rounded-full"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium">Filtrar productos</span>
                {activeFiltersCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-1 bg-primary text-primary-foreground rounded-full min-w-[20px] h-5 text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
            
            
            {/* Navigation items */}
            <div className="flex space-x-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = item.exact 
                  ? pathname === item.href 
                  : pathname.startsWith(item.href) && !isSearchPage;
                  
                return (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    asChild
                    className={cn(
                      "flex-col h-auto py-3 px-4 gap-1 min-w-[120px]",
                      "transition-all duration-200 rounded-xl",
                      isActive
                        ? "bg-primary-container text-on-primary-container shadow-md border border-primary/20"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className={cn(
                        "w-5 h-5 mb-1",
                        isActive ? "text-primary" : "text-on-surface-variant"
                      )} />
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-on-surface-variant/70 hidden sm:block leading-tight">
                        {item.description}
                      </span>
                    </Link>
                  </Button>
                );
              })}
              
              {/* Search page indicator */}
              {isSearchPage && (
                <div className="flex flex-col h-auto py-3 px-4 gap-1 min-w-[120px] bg-primary-container text-on-primary-container shadow-md border border-primary/20 rounded-xl">
                  <Store className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-sm font-medium">
                    {searchQuery ? `"${searchQuery}"` : 'Búsqueda'}
                  </span>
                  <span className="text-xs text-on-surface-variant/70 hidden sm:block leading-tight">
                    Productos filtrados
                  </span>
                </div>
              )}
              
              {/* Collection page indicator */}
              {isCollectionPage && (
                <div className="flex flex-col h-auto py-3 px-4 gap-1 min-w-[120px] bg-primary-container text-on-primary-container shadow-md border border-primary/20 rounded-xl">
                  <FolderOpen className="w-5 h-5 mb-1 text-primary" />
                  <span className="text-sm font-medium capitalize">
                    {collectionHandle?.replace('-', ' ')}
                  </span>
                  <span className="text-xs text-on-surface-variant/70 hidden sm:block leading-tight">
                    Colección especial
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {(pathname.includes('/product/') || isCollectionPage) && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 text-primary hover:text-primary/80 hover:bg-primary-container/50 rounded-full px-4"
              >
                <Link href="/store">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Volver a la tienda</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {(pathname.includes('/product/') || isCollectionPage) && (
        <div className="bg-surface-container/30">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center space-x-2 text-sm">
              <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-on-surface-variant hover:text-on-surface">
                <Link href="/" className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Inicio
                </Link>
              </Button>
              
              <ChevronRight className="w-3 h-3 text-on-surface-variant/50" />
              
              <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-on-surface-variant hover:text-on-surface">
                <Link href="/store">Tienda</Link>
              </Button>
              
              {isCollectionPage && (
                <>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50" />
                  <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-on-surface-variant hover:text-on-surface">
                    <Link href="/store/collections">Colecciones</Link>
                  </Button>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50" />
                  <span className="text-on-surface font-medium capitalize px-2">
                    {collectionHandle?.replace('-', ' ')}
                  </span>
                </>
              )}
              
              {pathname.includes('/product/') && (
                <>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50" />
                  <span className="text-on-surface font-medium px-2">Producto</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};