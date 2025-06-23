'use client';

import { useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts, useFilterOptions, useCollections } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import { ProductSearchParams, ProductSearchFilters } from '@/modules/shopify/types';
import { Card } from '@/components/Card.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, X,  RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

const sortOptions = [
  { value: 'RELEVANCE', label: 'Relevancia', supportsOrder: false },
  { value: 'BEST_SELLING', label: 'Más vendidos', supportsOrder: false },
  { value: 'PRICE', label: 'Precio', supportsOrder: true },
  { value: 'TITLE', label: 'Nombre', supportsOrder: true },
  { value: 'CREATED', label: 'Fecha de creación', supportsOrder: true }
] as const;

export const Client = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Gestión de la paginación con cursores
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  const currentPage = useMemo(() => {
    const page = searchParams.get('page');
    return page ? parseInt(page, 10) : 1;
  }, [searchParams]);

  const cursor = useMemo(() => pageHistory[currentPage - 1], [pageHistory, currentPage]);

  const searchFilters: ProductSearchFilters = useMemo(() => {
    const filters: ProductSearchFilters = {};
    const q = searchParams.get('q');
    if (q) filters.query = q;
    const collections = searchParams.get('collections');
    if (collections) filters.collections = collections.split(',');
    const productTypes = searchParams.get('product_types');
    if (productTypes) filters.productType = productTypes.split(',');
    const vendors = searchParams.get('vendor'); // Correctamente 'vendor'
    if (vendors) filters.vendor = vendors.split(',');
    const tags = searchParams.get('tags');
    if (tags) filters.tags = tags.split(',');
    const availability = searchParams.get('availability');
    if (availability === 'available') filters.available = true;
    if (availability === 'unavailable') filters.available = false;
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    if (priceMin || priceMax) {
      filters.price = {
        min: priceMin ? parseFloat(priceMin) : undefined,
        max: priceMax ? parseFloat(priceMax) : undefined
      };
    }
    return filters;
  }, [searchParams]);
  
  const currentSort = (searchParams.get('sort') as ProductSearchParams['sortKey']) || 'RELEVANCE';
  const currentOrder = searchParams.get('order');

  const { data: productsData, isLoading, error } = useProducts({
    first: 24,
    after: cursor,
    filters: searchFilters,
    sortKey: currentSort,
    reverse: currentOrder === 'desc',
  });
  
  const { data: filterOptions } = useFilterOptions();
  const { data: collectionsData } = useCollections();

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (newPage > currentPage) {
      const nextCursor = productsData?.pageInfo.endCursor;
      if (nextCursor) {
        setPageHistory(prev => {
          const newHistory = [...prev];
          newHistory[newPage] = nextCursor; // history for page n+1 is at index n
          return newHistory;
        });
        newParams.set('page', newPage.toString());
      }
    } else if (newPage < currentPage) {
      newParams.set('page', newPage.toString());
    } else {
        // Stay on the same page, but maybe refresh data
        newParams.set('page', newPage.toString());
    }
    router.push(`/store/search?${newParams.toString()}`);
  };

  const totalPages = productsData?.pageInfo.hasNextPage ? currentPage + 1 : (productsData?.products.length ? currentPage : 0);
  
  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (value === 'RELEVANCE') {
      newParams.delete('sort');
      newParams.delete('order');
    } else {
      newParams.set('sort', value);
      const sortOption = sortOptions.find(opt => opt.value === value);
      if (sortOption?.supportsOrder && !newParams.get('order')) {
        newParams.set('order', 'asc');
      }
    }
    newParams.delete('page');
    router.push(`/store/search?${newParams.toString()}`);
  };

  const toggleSortOrder = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    const sortOption = sortOptions.find(opt => opt.value === currentSort);
    if (!sortOption?.supportsOrder) return;
    newParams.set('order', currentOrder === 'desc' ? 'asc' : 'desc');
    router.push(`/store/search?${newParams.toString()}`);
  };

  const getActiveFilters = () => {
    const filters: Array<{ key: string; label: string; value: string }> = [];
    if (searchFilters.query) filters.push({ key: 'q', label: 'Búsqueda', value: `"${searchFilters.query}"` });

    if (searchFilters.collections && collectionsData) {
      const names = searchFilters.collections.map(handle => collectionsData.collections.find(c => c.handle === handle)?.title || handle).join(', ');
      if (names) filters.push({ key: 'collections', label: 'Colecciones', value: names });
    }
    if (searchFilters.productType) filters.push({ key: 'product_types', label: 'Tipos de Obra', value: searchFilters.productType.join(', ') });
    if (searchFilters.vendor) filters.push({ key: 'vendor', label: 'Artistas', value: searchFilters.vendor.join(', ') });
    
    // --> ACTUALIZADO: Muestra etiquetas amigables para todos los tags seleccionados
    if (searchFilters.tags && filterOptions) {
      const allTagOptions = [
        ...filterOptions.techniques, ...filterOptions.formats, ...filterOptions.locations,
        ...filterOptions.years, ...filterOptions.series, ...filterOptions.otherTags
      ];
      const tagLabels = searchFilters.tags.map(tagValue => {
        const option = allTagOptions.find(opt => opt.input === tagValue);
        return option ? option.label : tagValue;
      }).join(', ');
      if (tagLabels) filters.push({ key: 'tags', label: 'Filtros', value: tagLabels });
    }

    if (searchFilters.price) {
      let priceText = '';
      if (searchFilters.price.min && searchFilters.price.max) priceText = `$${searchFilters.price.min} - $${searchFilters.price.max}`;
      else if (searchFilters.price.min) priceText = `Desde $${searchFilters.price.min}`;
      else if (searchFilters.price.max) priceText = `Hasta $${searchFilters.price.max}`;
      if (priceText) filters.push({ key: 'price', label: 'Precio', value: priceText });
    }
    if (searchFilters.available === true) filters.push({ key: 'availability', label: 'Disponibilidad', value: 'Solo disponibles' });
    if (searchFilters.available === false) filters.push({ key: 'availability', label: 'Disponibilidad', value: 'Solo agotados' });

    return filters;
  };

  const removeFilter = (filterKey: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (filterKey === 'price') {
      newParams.delete('price_min');
      newParams.delete('price_max');
    } else {
      newParams.delete(filterKey);
    }
    newParams.delete('page');
    
    const hasRemainingFilters = Array.from(newParams.entries()).some(([key]) => 
      !['sort', 'order', 'page', 'after'].includes(key)
    );
    
    const path = hasRemainingFilters ? `/store/search?${newParams.toString()}` : '/store';
    router.push(path);
  };
  
  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    if (sort) newParams.set('sort', sort);
    if (order) newParams.set('order', order);
    const path = newParams.toString() ? `/store/search?${newParams.toString()}` : '/store';
    router.push(path);
  };

  const activeFilters = getActiveFilters();
  const currentSortOption = sortOptions.find(opt => opt.value === currentSort);

  if (isLoading && !productsData) return <Card.Loader />;
 if (error) {
    return (
      <div className="bg-surface min-h-screen">
        <div className="mx-auto px-4 py-12">
          <Alert className="max-w-md mx-auto border-error-container bg-error-container/10">
            <RefreshCw className="h-4 w-4 text-error" />
            <AlertDescription className="text-on-error-container">
              <span className="font-medium">Error al realizar la búsqueda</span>
              <br />
              {error.message}
            </AlertDescription>
          </Alert>
          <div className="flex justify-center mt-6">
            <Button 
              onClick={() => window.location.reload()}
              variant="default"
              className="bg-primary text-on-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="mx-auto px-4 py-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-4">Resultados de búsqueda</h1>
          {activeFilters.length > 0 && (
            <div className="bg-surface-container border border-outline rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-on-surface">Filtros activos</h3>
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-primary hover:text-primary/80">Limpiar todos</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter.key} variant="secondary" className="flex items-center gap-2 bg-surface-container-highest">
                    <span className="text-xs">
                      <span className="font-medium">{filter.label}:</span> {filter.value}
                    </span>
                    <button onClick={() => removeFilter(filter.key)} className="hover:bg-surface-container-high rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="text-sm text-on-surface-variant">
              {productsData?.products ? (<>Mostrando {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, ((currentPage - 1) * 24) + productsData.products.length)} productos</>) : 'Cargando resultados...'}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-on-surface-variant whitespace-nowrap">Ordenar por:</label>
              <div className="flex items-center gap-2">
                <Select value={currentSort} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[140px] border-outline"><SelectValue /></SelectTrigger>
                  <SelectContent className="border-outline-variant">
                    {sortOptions.map(option => (<SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>))}
                  </SelectContent>
                </Select>
                {currentSortOption?.supportsOrder && (
                  <Button variant="outline" size="sm" onClick={toggleSortOrder} className="h-9 px-3 border-outline hover:bg-surface-container" title={`Ordenar ${currentOrder === 'asc' ? 'descendente' : 'ascendente'}`}>
                    {currentOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        {productsData?.products && productsData.products.length > 0 ? (
          <>
            <Card.Container>
              {productsData.products.map(product => (<Card.Product key={product.id} product={product} />))}
            </Card.Container>
            <div className="flex justify-center mt-8">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">No se encontraron productos</h3>
              <p className="text-on-surface-variant mb-6">No hay productos que coincidan con los filtros aplicados.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};