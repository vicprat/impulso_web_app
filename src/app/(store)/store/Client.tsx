'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import { ProductSearchParams } from '@/modules/shopify/types';
import { Card } from '@/components/Card.tsx';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {  Package2, } from 'lucide-react';
import { Error } from './Error';
import { Loader } from '@/components/Loader';

const defaultLimit = 12;
const limitOptions = [12, 24, 36, 48];

export const Client = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const pageInUrl = parseInt(searchParams.get('page') || '1', 10);
  const afterCursorInUrl = searchParams.get('after') || null;
  const limitInUrl = parseInt(searchParams.get('limit') || defaultLimit.toString(), 10);

  const [historyCursors, setHistoryCursors] = useState<{ [page: number]: string | null }>({});
  const [previousLimit, setPreviousLimit] = useState(limitInUrl);

  const buildSearchParamsInternal = useCallback((): ProductSearchParams => {
    const params: ProductSearchParams = {
      first: limitInUrl,
      after: afterCursorInUrl,
    };
    const collections = searchParams.get('collections');
    if (collections) {
      const collectionHandles = collections.split(',');
      params.query = collectionHandles.map(handle => `collection:${handle}`).join(' OR ');
    }
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    if (priceMin || priceMax) {
      let priceQuery = '';
      if (priceMin) priceQuery += `variants.price:>=${priceMin}`;
      if (priceMax) {
        if (priceQuery) priceQuery += ' AND ';
        priceQuery += `variants.price:<=${priceMax}`;
      }
      params.query = params.query ? `${params.query} AND (${priceQuery})` : priceQuery;
    }
    const availability = searchParams.get('availability');
    if (availability) {
      const availQuery = availability === 'available' ? 'available_for_sale:true' : 'available_for_sale:false';
      params.query = params.query ? `${params.query} AND ${availQuery}` : availQuery;
    }
    const sort = searchParams.get('sort') as ProductSearchParams['sortKey'];
    const order = searchParams.get('order');
    if (sort) params.sortKey = sort;
    if (order === 'desc') params.reverse = true;
    return params;
  }, [afterCursorInUrl, limitInUrl, searchParams]);

  const { data: productsData, isLoading, error } = useProducts(buildSearchParamsInternal());

  const handlePageChange = (newPage: number) => {
    const newUrlParams = new URLSearchParams(searchParams.toString());
    let targetCursor: string | null | undefined = undefined;
    if (newPage === 1) {
      targetCursor = null;
    } else {
      targetCursor = historyCursors[newPage];
    }
    if (targetCursor === undefined && newPage > pageInUrl && newPage === pageInUrl + 1) {
      if(productsData?.pageInfo.hasNextPage && productsData.pageInfo.endCursor) {
        targetCursor = productsData.pageInfo.endCursor;
      }
    }
    if (targetCursor !== undefined) {
      newUrlParams.set('page', newPage.toString());
      if (targetCursor === null) {
        newUrlParams.delete('after');
      } else {
        newUrlParams.set('after', targetCursor);
      }
    } else {
      console.warn(`Cursor para página ${newPage} no encontrado. Volviendo a página 1.`);
      newUrlParams.set('page', '1');
      newUrlParams.delete('after');
    }
    router.push(`/store?${newUrlParams.toString()}`, { scroll: false });
  };

  const totalPages = productsData?.pageInfo.hasNextPage ? pageInUrl + 1 : pageInUrl;

  const handleLimitChange = (value: string) => {
    const newUrlParams = new URLSearchParams(searchParams.toString());
    
    newUrlParams.set('limit', value);
    newUrlParams.set('page', '1');
    newUrlParams.delete('after');

    router.push(`/store?${newUrlParams.toString()}`, { scroll: false });
  };

  const handleRetry = () => {
    router.refresh();
  };

  useEffect(() => {
    if (limitInUrl !== previousLimit) {
      setPreviousLimit(limitInUrl);
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString());
        newUrlParams.set('page', '1');
        newUrlParams.delete('after');
        router.push(`/store?${newUrlParams.toString()}`, { scroll: false });
        setHistoryCursors({}); 
      }
    }
  }, [limitInUrl, previousLimit, pageInUrl, afterCursorInUrl, router, searchParams]);

  useEffect(() => {
    setHistoryCursors(prev => {
      const newCursors = { ...prev };
      let changed = false;
      if (newCursors[pageInUrl] !== afterCursorInUrl) {
        newCursors[pageInUrl] = afterCursorInUrl;
        changed = true;
      }
      if (productsData?.pageInfo.hasNextPage && productsData.pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1;
        if (newCursors[nextPageNumber] !== productsData.pageInfo.endCursor) {
          newCursors[nextPageNumber] = productsData.pageInfo.endCursor;
          changed = true;
        }
      } else if (productsData && !productsData.pageInfo.hasNextPage) {
        const nextPageNumber = pageInUrl + 1;
        if (newCursors[nextPageNumber] !== undefined) {
          delete newCursors[nextPageNumber];
          changed = true;
        }
      }
      return changed ? newCursors : prev;
    });
  }, [pageInUrl, afterCursorInUrl, productsData]);

  useEffect(() => {
    const pageStr = searchParams.get('page');
    const currentAfterCursor = searchParams.get('after');
    if (pageStr) {
      const pageNum = parseInt(pageStr, 10);
      if (pageNum > 1 && !currentAfterCursor) {
        if (productsData || error) { 
          const params = new URLSearchParams(searchParams.toString());
          params.set('page', '1');
          params.delete('after');
          router.replace(`/store?${params.toString()}`, { scroll: false });
        }
      }
    }
  }, [searchParams, router, productsData, error]);

  if (isLoading) {
    return (
        <Loader.Cards count={limitInUrl} />
    );
  }

  if (error) {
    return (
     <Error error={error} handleRetry={handleRetry} />
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-on-surface tracking-tight">
            Todos los productos
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <label 
                htmlFor="limit-select" 
                className="text-sm font-medium text-on-surface-variant whitespace-nowrap"
              >
                Mostrar:
              </label>
              <Select value={limitInUrl.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[140px] bg-surface-container border-outline focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className=" border-outline-variant">
                  {limitOptions.map(option => (
                    <SelectItem 
                      key={option} 
                      value={option.toString()}
                      className="hover:bg-surface-container-highest focus:bg-surface-container-highest"
                    >
                      {option} por página
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
         
          </div>
        </div>

        {productsData?.products && productsData.products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {productsData.products.map(product => (
                <Card.Product key={product.id} product={product} />
              ))}
            </div>
            
            <div className="flex justify-center">
              <Pagination 
                currentPage={pageInUrl} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-surface-container-highest rounded-full flex items-center justify-center">
                <Package2 className="w-8 h-8 text-on-surface-variant" />
              </div>
              <h3 className="text-xl font-semibold text-on-surface mb-2">
                No se encontraron productos
              </h3>
              <p className="text-on-surface-variant mb-4">
                No hay productos disponibles con los filtros aplicados.
              </p>
              <p className="text-sm text-on-surface-variant">
                Intenta ajustar tus filtros o el límite de productos por página.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};