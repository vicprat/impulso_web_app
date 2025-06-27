"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SlidersHorizontal,
  ArrowLeft,
  Home,
  ChevronRight,
  Store,
  FolderOpen,
  Menu,
  X,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";

type Props = {
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
};

export const Content: React.FC<Props> = ({
  onOpenFilters,
  activeFiltersCount = 0,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile(); // Initial check

    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const navItems = [
    {
      href: "/store",
      label: "Todos los productos",
      shortLabel: "Productos",
      exact: true,
      description: "Explora todo nuestro catálogo",
      icon: Store,
    },
    {
      href: "/store/collections",
      label: "Colecciones",
      shortLabel: "Colecciones",
      exact: false,
      description: "Productos organizados por categorías",
      icon: FolderOpen,
    },
    {
      href: "/store/private-rooms",
      label: "Private Rooms",
      shortLabel: "Private",
      exact: true,
      description: "Exclusive art for VIPs",
      icon: Lock,
    },
  ];

  const isSearchPage = pathname.includes("/search");
  const searchQuery = searchParams.get("q");

  const isCollectionPage =
    pathname.includes("/collections/") && pathname.split("/").length > 3;
  const collectionHandle = isCollectionPage ? pathname.split("/").pop() : null;

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="relative">
      {/* Main navigation container */}
      <div className="mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between min-h-[60px] md:min-h-[70px]">
          {/* Left section - Filters and Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-1">
            {/* Desktop filter button */}
            <div className="hidden lg:flex">
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenFilters}
                className={cn(
                  "gap-2 px-3 xl:px-4 py-2 h-9 xl:h-10",
                  "text-on-surface-variant hover:text-on-surface",
                  "hover:bg-surface-container-high",
                  "transition-colors duration-200",
                  "border border-outline-variant/40 hover:border-outline-variant/60",
                  "shadow-sm hover:shadow-md",
                  "rounded-full"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium text-sm xl:text-base">
                  Filtrar productos
                </span>
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

            {/* Mobile filter button */}
            <div className="flex lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenFilters}
                className={cn(
                  "gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 h-8 sm:h-9",
                  "text-on-surface-variant hover:text-on-surface",
                  "hover:bg-surface-container-high",
                  "transition-colors duration-200",
                  "border border-outline-variant/40 hover:border-outline-variant/60",
                  "shadow-sm hover:shadow-md",
                  "rounded-full"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="font-medium text-xs sm:text-sm">Filtros</span>
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 bg-primary text-primary-foreground rounded-full min-w-[16px] h-4 text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Desktop Navigation items */}
            <div className="hidden md:flex space-x-1 lg:space-x-2">
              {navItems.map((item) => {
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
                      "flex-col h-auto py-2 lg:py-3 px-2 lg:px-4 gap-1 min-w-[90px] lg:min-w-[120px]",
                      "transition-all duration-200 rounded-xl",
                      isActive
                        ? "bg-primary-container text-on-primary-container shadow-md border border-primary/20"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon
                        className={cn(
                          "w-4 h-4 lg:w-5 lg:h-5 mb-1",
                          isActive
                            ? "text-primary"
                            : "text-on-surface-variant"
                        )}
                      />
                      <span className="text-xs lg:text-sm font-medium text-center leading-tight">
                        {isMobile ? item.shortLabel : item.label}
                      </span>
                      <span className="text-xs text-on-surface-variant/70 hidden lg:block leading-tight text-center">
                        {item.description}
                      </span>
                    </Link>
                  </Button>
                );
              })}

              {/* Search page indicator - Desktop */}
              {isSearchPage && (
                <div className="flex flex-col h-auto py-2 lg:py-3 px-2 lg:px-4 gap-1 min-w-[90px] lg:min-w-[120px] bg-primary-container text-on-primary-container shadow-md border border-primary/20 rounded-xl">
                  <Store className="w-4 h-4 lg:w-5 lg:h-5 mb-1 text-primary mx-auto" />
                  <span className="text-xs lg:text-sm font-medium text-center leading-tight">
                    {searchQuery && searchQuery.length > 10
                      ? `"${searchQuery.substring(0, 10)}..."`
                      : searchQuery
                      ? `"${searchQuery}"`
                      : "Búsqueda"}
                  </span>
                  <span className="text-xs text-on-surface-variant/70 hidden lg:block leading-tight text-center">
                    Productos filtrados
                  </span>
                </div>
              )}

              {/* Collection page indicator - Desktop */}
              {isCollectionPage && (
                <div className="flex flex-col h-auto py-2 lg:py-3 px-2 lg:px-4 gap-1 min-w-[90px] lg:min-w-[120px] bg-primary-container text-on-primary-container shadow-md border border-primary/20 rounded-xl">
                  <FolderOpen className="w-4 h-4 lg:w-5 lg:h-5 mb-1 text-primary mx-auto" />
                  <span className="text-xs lg:text-sm font-medium capitalize text-center leading-tight">
                    {collectionHandle?.replace("-", " ")}
                  </span>
                  <span className="text-xs text-on-surface-variant/70 hidden lg:block leading-tight text-center">
                    Colección especial
                  </span>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="p-2 h-8 w-8 hover:bg-surface-container-high rounded-full"
              >
                {mobileMenuOpen ? (
                  <X className="w-4 h-4" />
                ) : (
                  <Menu className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Right section - Back button */}
          <div className="hidden md:flex items-center space-x-4">
            {(pathname.includes("/product/") || isCollectionPage) && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="gap-2 text-primary hover:text-primary/80 hover:bg-primary-container rounded-full px-3 lg:px-4 h-8 lg:h-9"
              >
                <Link href="/store">
                  <ArrowLeft className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  <span className="font-medium text-sm lg:text-base">
                    Volver a la tienda
                  </span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden ">
          <div
            className="fixed inset-0 bg-surface-variant"
            onClick={toggleMobileMenu}
          />
          <div className="fixed top-16 left-0 right-0 bg-gray-300 dark:bg-gray-900  shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <div className="flex items-center justify-end mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMobileMenu}
                  className="p-2 h-8 w-8 hover:bg-surface-container-high rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {navItems.map((item) => {
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
                    onClick={toggleMobileMenu}
                    className={cn(
                      "w-full justify-start gap-3 h-12 px-4 rounded-xl",
                      isActive
                        ? "bg-primary-container text-on-primary-container"
                        : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive
                            ? "text-primary"
                            : "text-on-surface-variant"
                        )}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {item.label}
                        </span>
                        <span className="text-xs text-on-surface-variant/70">
                          {item.description}
                        </span>
                      </div>
                    </Link>
                  </Button>
                );
              })}

              {/* Mobile back button for product/collection pages */}
              {(pathname.includes("/product/") || isCollectionPage) && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  onClick={toggleMobileMenu}
                  className="w-full justify-start gap-3 h-12 px-4 rounded-xl text-primary hover:text-primary/80 hover:bg-primary-container border-t border-outline-variant/20 mt-4 pt-6"
                >
                  <Link href="/store">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Volver a la tienda
                    </span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs - Enhanced responsiveness */}
      {(pathname.includes("/product/") || isCollectionPage) && (
        <div className="bg-surface-container border-t border-outline-variant/10">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-2 lg:py-3">
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-5 sm:h-6 px-1 sm:px-2 text-on-surface-variant hover:text-on-surface shrink-0"
              >
                <Link href="/" className="flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  <span className="hidden sm:inline">Inicio</span>
                </Link>
              </Button>

              <ChevronRight className="w-3 h-3 text-on-surface-variant/50 shrink-0" />

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="h-5 sm:h-6 px-1 sm:px-2 text-on-surface-variant hover:text-on-surface shrink-0"
              >
                <Link href="/store">Tienda</Link>
              </Button>

              {isCollectionPage && (
                <>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50 shrink-0" />
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-5 sm:h-6 px-1 sm:px-2 text-on-surface-variant hover:text-on-surface shrink-0"
                  >
                    <Link href="/store/collections">
                      <span className="hidden sm:inline">Colecciones</span>
                      <span className="sm:hidden">Col.</span>
                    </Link>
                  </Button>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50 shrink-0" />
                  <span className="text-on-surface font-medium capitalize px-1 sm:px-2 truncate">
                    {collectionHandle?.replace("-", " ")}
                  </span>
                </>
              )}

              {pathname.includes("/product/") && (
                <>
                  <ChevronRight className="w-3 h-3 text-on-surface-variant/50 shrink-0" />
                  <span className="text-on-surface font-medium px-1 sm:px-2 shrink-0">
                    Producto
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};