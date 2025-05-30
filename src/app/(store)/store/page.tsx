// src/app/(store)/store/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import { ProductSearchParams } from '@/modules/shopify/types';
import { Card } from '@/components/Card.tsx';

export default function StorePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  
  const searchParams = useSearchParams();
  const productsPerPage = 12;

  // Construir parámetros de búsqueda basados en filtros
  const buildSearchParams = (): ProductSearchParams => {
    const params: ProductSearchParams = {
      first: productsPerPage,
      after: cursor,
    };

    // Filtros de colecciones
    const collections = searchParams.get('collections');
    if (collections) {
      const collectionHandles = collections.split(',');
      params.query = collectionHandles.map(handle => `collection:${handle}`).join(' OR ');
    }

    // Filtros de precio
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

    // Filtro de disponibilidad
    const availability = searchParams.get('availability');
    if (availability === 'available') {
      const availQuery = 'available_for_sale:true';
      params.query = params.query ? `${params.query} AND ${availQuery}` : availQuery;
    } else if (availability === 'unavailable') {
      const availQuery = 'available_for_sale:false';
      params.query = params.query ? `${params.query} AND ${availQuery}` : availQuery;
    }

    // Ordenamiento
    const sort = searchParams.get('sort') as ProductSearchParams['sortKey'];
    const order = searchParams.get('order');
    
    if (sort) {
      params.sortKey = sort;
    }
    if (order === 'desc') {
      params.reverse = true;
    }

    return params;
  };

  const { data: productsData, isLoading, error } = useProducts(buildSearchParams());

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600">Error al cargar los productos</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todos los productos</h1>
        <p className="text-gray-600">
          {productsData?.products ? `${productsData.products.length} productos encontrados` : ''}
        </p>
      </div>

      {productsData?.products && productsData.products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {productsData.products.map(product => (
              <Card.Product key={product.id} product={product} />
            ))}
          </div>
          
          <div className="flex justify-center">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No se encontraron productos con los filtros aplicados</p>
          <p className="text-sm text-gray-500 mt-2">Intenta ajustar tus filtros para ver más resultados</p>
        </div>
      )}
    </div>
  );
}
