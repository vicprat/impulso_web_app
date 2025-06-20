'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import { ProductSearchParams } from '@/modules/shopify/types';
import { Card } from '@/components/Card.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, X, Package, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';

const sortOptions = [
  { value: 'RELEVANCE', label: 'Relevancia', supportsOrder: false },
  { value: 'BEST_SELLING', label: 'Más vendidos', supportsOrder: false },
  { value: 'PRICE', label: 'Precio', supportsOrder: true },
  { value: 'TITLE', label: 'Nombre', supportsOrder: true },
  { value: 'CREATED', label: 'Fecha de creación', supportsOrder: true }
] as const;

export const Client = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const productsPerPage = 24;


  const buildSearchParams = (): ProductSearchParams => {
    const params: ProductSearchParams = {
      first: productsPerPage,
      after: cursor,
    };

    const queryParts: string[] = [];

    const collections = searchParams.get('collections');
    if (collections) {
      const collectionHandles = collections.split(',').filter(Boolean);
      if (collectionHandles.length > 0) {
        queryParts.push(`(${collectionHandles.map(handle => `collection:${handle}`).join(' OR ')})`);
      }
    }

    const searchQuery = searchParams.get('q');
    if (searchQuery && searchQuery.trim()) {
      queryParts.push(`title:*${searchQuery.trim()}* OR tag:*${searchQuery.trim()}* OR product_type:*${searchQuery.trim()}*`);
    }

    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    if (priceMin || priceMax) {
      let priceQuery = '';
      if (priceMin && !isNaN(parseFloat(priceMin))) {
        priceQuery += `variants.price:>=${priceMin}`;
      }
      if (priceMax && !isNaN(parseFloat(priceMax))) {
        if (priceQuery) priceQuery += ' AND ';
        priceQuery += `variants.price:<=${priceMax}`;
      }
      if (priceQuery) {
        queryParts.push(`(${priceQuery})`);
      }
    }

    const availability = searchParams.get('availability');
    if (availability === 'available') {
      queryParts.push('available_for_sale:true');
    } else if (availability === 'unavailable') {
      queryParts.push('available_for_sale:false');
    }

    const productTypes = searchParams.get('product_types');
    if (productTypes) {
      const typeList = productTypes.split(',').filter(Boolean);
      if (typeList.length > 0) {
        queryParts.push(`(${typeList.map(type => `product_type:${type}`).join(' OR ')})`);
      }
    }

    const vendors = searchParams.get('vendors');
    if (vendors) {
      const vendorList = vendors.split(',').filter(Boolean);
      if (vendorList.length > 0) {
        queryParts.push(`(${vendorList.map(vendor => `vendor:${vendor}`).join(' OR ')})`);
      }
    }

    const tags = searchParams.get('tags');
    if (tags) {
      const tagList = tags.split(',').filter(Boolean);
      if (tagList.length > 0) {
        queryParts.push(`(${tagList.map(tag => `tag:${tag}`).join(' OR ')})`);
      }
    }

    if (queryParts.length > 0) {
      params.query = queryParts.join(' AND ');
    }

    const sort = searchParams.get('sort') as ProductSearchParams['sortKey'];
    const order = searchParams.get('order');
    
    if (sort && ['TITLE', 'PRICE', 'BEST_SELLING', 'CREATED', 'ID', 'RELEVANCE'].includes(sort)) {
      params.sortKey = sort;
    } else {
      params.sortKey = 'RELEVANCE'; 
    }
    
    if (order === 'desc') {
      params.reverse = true;
    }

    return params;
  };

  const searchQuery = buildSearchParams();
  const { data: productsData, isLoading, error } = useProducts(searchQuery);

  const handlePageChange = (newPage: number) => {
    if (newPage > currentPage) {
      const nextCursor = productsData?.pageInfo.endCursor || null;
      
      if (nextCursor) {
        const newHistory = [...pageHistory];
        if (newHistory.length <= newPage) {
          newHistory.push(nextCursor);
        }
        setPageHistory(newHistory);
        setCursor(nextCursor);
        setCurrentPage(newPage);
      }
    } 
    else if (newPage < currentPage && newPage >= 1) {
      const previousCursor = pageHistory[newPage - 1];
      setCursor(previousCursor);
      setCurrentPage(newPage);
    }
  };

  const totalPages = productsData?.pageInfo.hasNextPage 
    ? currentPage + 1 
    : currentPage;

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
    newParams.delete('after');
    
    router.push(`/store/search?${newParams.toString()}`);
  };

  const toggleSortOrder = () => {
    const newParams = new URLSearchParams(searchParams.toString());
    const currentOrder = searchParams.get('order');
    const currentSort = searchParams.get('sort');
    
    const sortOption = sortOptions.find(opt => opt.value === currentSort);
    if (!sortOption?.supportsOrder) return;
    
    if (currentOrder === 'desc') {
      newParams.set('order', 'asc');
    } else {
      newParams.set('order', 'desc');
    }
    
    router.push(`/store/search?${newParams.toString()}`);
  };

  const getActiveFilters = () => {
    const filters: Array<{ key: string; label: string; value: string }> = [];
    
    const searchText = searchParams.get('q');
    if (searchText) {
      filters.push({ key: 'q', label: 'Búsqueda', value: `"${searchText}"` });
    }
    
    const collections = searchParams.get('collections');
    if (collections) {
      const collectionNames = collections.split(',').filter(Boolean);
      filters.push({ key: 'collections', label: 'Colecciones', value: collectionNames.join(', ') });
    }

    const productTypes = searchParams.get('product_types');
    if (productTypes) {
      const typeNames = productTypes.split(',').filter(Boolean);
      filters.push({ key: 'product_types', label: 'Tipos de Obra', value: typeNames.join(', ') });
    }

    const vendors = searchParams.get('vendors');
    if (vendors) {
      const vendorNames = vendors.split(',').filter(Boolean);
      filters.push({ key: 'vendors', label: 'Artistas', value: vendorNames.join(', ') });
    }

    const tags = searchParams.get('tags');
    if (tags) {
      const tagNames = tags.split(',').filter(Boolean);
      filters.push({ key: 'tags', label: 'Técnicas/Estilos', value: tagNames.join(', ') });
    }
    
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    if (priceMin || priceMax) {
      let priceText = '';
      if (priceMin && priceMax) {
        priceText = `$${priceMin} - $${priceMax}`;
      } else if (priceMin) {
        priceText = `Desde $${priceMin}`;
      } else if (priceMax) {
        priceText = `Hasta $${priceMax}`;
      }
      filters.push({ key: 'price', label: 'Precio', value: priceText });
    }
    
    const availability = searchParams.get('availability');
    if (availability === 'available') {
      filters.push({ key: 'availability', label: 'Disponibilidad', value: 'Solo disponibles' });
    } else if (availability === 'unavailable') {
      filters.push({ key: 'availability', label: 'Disponibilidad', value: 'Solo agotados' });
    }
    
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
    
    const hasRemainingFilters = Array.from(newParams.keys()).some(key => 
      !['sort', 'order', 'page', 'after'].includes(key)
    );
    
    if (hasRemainingFilters) {
      router.push(`/store/search?${newParams.toString()}`);
    } else {
      const sortParams = new URLSearchParams();
      const sort = newParams.get('sort');
      const order = newParams.get('order');
      if (sort) sortParams.set('sort', sort);
      if (order) sortParams.set('order', order);
      
      const finalQuery = sortParams.toString();
      router.push(finalQuery ? `/store/search?${finalQuery}` : '/store');
    }
  };

  const clearAllFilters = () => {
    const currentSort = searchParams.get('sort');
    const currentOrder = searchParams.get('order');
    
    if (currentSort || currentOrder) {
      const sortParams = new URLSearchParams();
      if (currentSort) sortParams.set('sort', currentSort);
      if (currentOrder) sortParams.set('order', currentOrder);
      router.push(`/store/search?${sortParams.toString()}`);
    } else {
      router.push('/store');
    }
  };

  const activeFilters = getActiveFilters();
  const currentSort = searchParams.get('sort') || 'RELEVANCE';
  const currentOrder = searchParams.get('order') || 'asc';
  const currentSortOption = sortOptions.find(opt => opt.value === currentSort);

  if (isLoading) {
    return <Card.Loader />;
  }

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
          <h1 className="text-3xl font-bold text-on-surface tracking-tight mb-4">
            Resultados de búsqueda
          </h1>
          
          {/* Filtros activos */}
          {activeFilters.length > 0 && (
            <div className="bg-surface-container border border-outline rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-on-surface">Filtros activos</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-primary hover:text-primary/80"
                >
                  Limpiar todos
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge 
                    key={filter.key} 
                    variant="secondary" 
                    className="flex items-center gap-2 bg-surface-container-highest"
                  >
                    <span className="text-xs">
                      <span className="font-medium">{filter.label}:</span> {filter.value}
                    </span>
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="hover:bg-surface-container-high rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Controles de sorting y resultados */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {/* Contador de resultados */}
            <div className="text-sm text-on-surface-variant">
              {productsData?.products ? (
                <>
                  Mostrando {((currentPage - 1) * productsPerPage) + 1}-{Math.min(currentPage * productsPerPage, ((currentPage - 1) * productsPerPage) + productsData.products.length)} productos
                  {productsData.pageInfo.hasNextPage && (
                    <span className="ml-1">de muchos resultados</span>
                  )}
                </>
              ) : (
                'Cargando resultados...'
              )}
            </div>
            
            {/* Controles de sorting */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-on-surface-variant whitespace-nowrap">
                Ordenar por:
              </label>
              <div className="flex items-center gap-2">
                <Select 
                  value={currentSort} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[140px] border-outline">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-outline-variant">
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Botón de orden */}
                {currentSortOption?.supportsOrder && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="h-9 px-3 border-outline hover:bg-surface-container"
                    title={`Ordenar ${currentOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                  >
                    {currentOrder === 'asc' ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {productsData?.products && productsData.products.length > 0 ? (
          <>
            <Card.Container>
              {productsData.products.map(product => (
                <Card.Product key={product.id} product={product} />
              ))}
            </Card.Container>
            
            <div className="flex justify-center">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">
                No se encontraron productos
              </h3>
              <p className="text-on-surface-variant mb-6">
                No hay productos que coincidan con los filtros aplicados.
              </p>
              <div className="space-y-4">
                <div className="text-sm text-on-surface-variant space-y-2">
                  <p className="font-medium">Intenta:</p>
                  <ul className="space-y-1">
                    <li>• Verificar la ortografía</li>
                    <li>• Usar términos más generales</li>
                    <li>• Quitar algunos filtros</li>
                  </ul>
                </div>
                <Button
                  onClick={() => router.push('/store')}
                  className="bg-primary text-on-primary hover:bg-primary/90"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Ver todos los productos
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};