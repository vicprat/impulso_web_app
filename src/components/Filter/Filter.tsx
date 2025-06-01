'use client';

import { useCollections } from "@/modules/shopify/hooks";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Filter as FilterIcon, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type State = {
  collections: string[];
  priceRange: {
    min: string;
    max: string;
  };
  availability: 'all' | 'available' | 'unavailable';
  sortBy: 'BEST_SELLING' | 'PRICE' | 'TITLE' | 'CREATED';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: State = {
  collections: [],
  priceRange: { min: '', max: '' },
  availability: 'all',
  sortBy: 'BEST_SELLING',
  sortOrder: 'asc'
};

const availabilityOptions = [
  { value: 'all', label: 'Todos los productos' },
  { value: 'available', label: 'Solo disponibles' },
  { value: 'unavailable', label: 'Agotados' }
] as const;

const sortOptions = [
  { value: 'BEST_SELLING', label: 'Más vendidos' },
  { value: 'PRICE', label: 'Precio' },
  { value: 'TITLE', label: 'Nombre A-Z' },
  { value: 'CREATED', label: 'Más recientes' }
] as const;

const sortOrderOptions = [
  { value: 'asc', label: 'Ascendente' },
  { value: 'desc', label: 'Descendente' }
] as const;

export const Filter = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const { data: collectionsData } = useCollections();

  const handleFilterChange = <K extends keyof State>(key: K, value: State[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCollectionToggle = (collectionHandle: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      collections: checked
        ? [...prev.collections, collectionHandle]
        : prev.collections.filter(c => c !== collectionHandle)
    }));
  };

  const applyFilters = () => {
    const searchParams = new URLSearchParams();
    
    if (filters.collections.length > 0) {
      searchParams.set('collections', filters.collections.join(','));
    }
    if (filters.priceRange.min) {
      searchParams.set('price_min', filters.priceRange.min);
    }
    if (filters.priceRange.max) {
      searchParams.set('price_max', filters.priceRange.max);
    }
    if (filters.availability !== 'all') {
      searchParams.set('availability', filters.availability);
    }
    if (filters.sortBy !== 'BEST_SELLING') {
      searchParams.set('sort', filters.sortBy);
    }
    if (filters.sortOrder !== 'asc') {
      searchParams.set('order', filters.sortOrder);
    }

    const queryString = searchParams.toString();
    
    let targetPath = '/store';
    if (pathname.includes('/search') || queryString) {
      targetPath = '/store/search';
    }
    
    const newPath = queryString ? `${targetPath}?${queryString}` : '/store';
    router.push(newPath);
    setMobileSheetOpen(false);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    router.push('/store');
    setMobileSheetOpen(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.collections.length > 0) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.availability !== 'all') count++;
    if (filters.sortBy !== 'BEST_SELLING' || filters.sortOrder !== 'asc') count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-4">
      {/* Collections Filter */}
      {collectionsData?.collections && collectionsData.collections.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground font-medium">
            Colecciones
          </SidebarGroupLabel>
          <SidebarGroupContent className="space-y-2">
            {collectionsData.collections.map(collection => (
              <div key={collection.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`collection-${collection.id}`}
                  checked={filters.collections.includes(collection.handle)}
                  onCheckedChange={(checked) => 
                    handleCollectionToggle(collection.handle, checked as boolean)
                  }
                  className="data-[state=checked]:bg-sidebar-primary data-[state=checked]:border-sidebar-primary"
                />
                <Label 
                  htmlFor={`collection-${collection.id}`}
                  className="text-sm text-sidebar-foreground cursor-pointer flex-1"
                >
                  {collection.title}
                </Label>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      <Separator className="bg-sidebar-border" />

      {/* Price Range Filter */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground font-medium">
          Rango de precio
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="price-min" className="text-xs text-sidebar-foreground/70">
                Mínimo
              </Label>
              <Input
                id="price-min"
                type="number"
                placeholder="$0"
                value={filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { 
                  ...filters.priceRange, 
                  min: e.target.value 
                })}
                className="h-9 bg-sidebar-accent border-sidebar-border focus:border-sidebar-primary text-sidebar-foreground"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="price-max" className="text-xs text-sidebar-foreground/70">
                Máximo
              </Label>
              <Input
                id="price-max"
                type="number"
                placeholder="$999"
                value={filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { 
                  ...filters.priceRange, 
                  max: e.target.value 
                })}
                className="h-9 bg-sidebar-accent border-sidebar-border focus:border-sidebar-primary text-sidebar-foreground"
              />
            </div>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="bg-sidebar-border" />

      {/* Availability Filter */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground font-medium">
          Disponibilidad
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <RadioGroup
            value={filters.availability}
            onValueChange={(value) => handleFilterChange('availability', value as State['availability'])}
            className="space-y-2"
          >
            {availabilityOptions.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`availability-${option.value}`}
                  className="border-sidebar-border data-[state=checked]:bg-sidebar-primary data-[state=checked]:border-sidebar-primary"
                />
                <Label 
                  htmlFor={`availability-${option.value}`}
                  className="text-sm text-sidebar-foreground cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator className="bg-sidebar-border" />

      {/* Sort Options */}
      <SidebarGroup>
        <SidebarGroupLabel className="text-sidebar-foreground font-medium">
          Ordenamiento
        </SidebarGroupLabel>
        <SidebarGroupContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-sidebar-foreground/70">Ordenar por</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange('sortBy', value as State['sortBy'])}
            >
              <SelectTrigger className="h-9 bg-sidebar-accent border-sidebar-border focus:border-sidebar-primary text-sidebar-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-sidebar-accent border-sidebar-border">
                {sortOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="focus:bg-sidebar-primary focus:text-sidebar-primary-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-sidebar-foreground/70">Orden</Label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) => handleFilterChange('sortOrder', value as State['sortOrder'])}
            >
              <SelectTrigger className="h-9 bg-sidebar-accent border-sidebar-border focus:border-sidebar-primary text-sidebar-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-sidebar-accent border-sidebar-border">
                {sortOrderOptions.map(option => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="focus:bg-sidebar-primary focus:text-sidebar-primary-foreground"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger */}
      <div className="lg:hidden fixed bottom-4 left-4 z-40">
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              size="lg"
              className={cn(
                "shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground",
                "rounded-full h-14 px-6"
              )}
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filtros
              {getActiveFiltersCount() > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-primary-foreground text-primary rounded-full min-w-[20px] h-5 text-xs"
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-80 bg-sidebar border-sidebar-border p-0"
          >
            <SheetHeader className="p-6 pb-4 border-b border-sidebar-border">
              <SheetTitle className="text-lg font-semibold text-sidebar-foreground flex items-center">
                <FilterIcon className="w-5 h-5 mr-2 text-sidebar-primary" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 bg-sidebar-primary text-sidebar-primary-foreground rounded-full"
                  >
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="p-6 h-full overflow-y-auto">
              <FilterContent />
              
              <div className="space-y-3 pt-6 mt-6 border-t border-sidebar-border">
                <Button
                  onClick={applyFilters}
                  className="w-full h-10 bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
                >
                  Aplicar filtros
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full h-10 border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
    

<Sidebar
  side="left"
  variant="sidebar"
  collapsible="offcanvas" 
  className="hidden lg:flex border-r border-sidebar-border"
>
     
        
        <SidebarContent className="p-4 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <FilterContent />
          </div>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
          <div className="space-y-2 group-data-[collapsible=icon]:hidden">
            <Button
              onClick={applyFilters}
              size="sm"
              className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground"
            >
              Aplicar filtros
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="w-full border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent"
            >
              Limpiar filtros
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};