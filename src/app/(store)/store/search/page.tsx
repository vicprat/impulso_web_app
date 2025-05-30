'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProducts } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import { ProductSearchParams } from '@/modules/shopify/types';
import { Card } from '@/components/Card.tsx';

export default function SearchPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const productsPerPage = 12;

  // Reset pagination when search params change
  const searchParamsString = searchParams.toString();
  useEffect(() => {
    setCurrentPage(1);
    setCursor(null);
    setPageHistory([null]);
  }, [searchParamsString]);

  // Construir parámetros de búsqueda basados en filtros
  const buildSearchParams = (): ProductSearchParams => {
    const params: ProductSearchParams = {
      first: productsPerPage,
      after: cursor,
    };

    const queryParts: string[] = [];

    // Filtros de colecciones
    const collections = searchParams.get('collections');
    if (collections) {
      const collectionHandles = collections.split(',').filter(Boolean);
      if (collectionHandles.length > 0) {
        queryParts.push(`(${collectionHandles.map(handle => `collection:${handle}`).join(' OR ')})`);
      }
    }

    // Búsqueda por texto
    const searchQuery = searchParams.get('q');
    if (searchQuery && searchQuery.trim()) {
      queryParts.push(`title:*${searchQuery.trim()}* OR tag:*${searchQuery.trim()}* OR product_type:*${searchQuery.trim()}*`);
    }

    // Filtros de precio
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

    // Filtro de disponibilidad
    const availability = searchParams.get('availability');
    if (availability === 'available') {
      queryParts.push('available_for_sale:true');
    } else if (availability === 'unavailable') {
      queryParts.push('available_for_sale:false');
    }

    // Filtro por tipo de producto
    const productType = searchParams.get('product_type');
    if (productType) {
      queryParts.push(`product_type:${productType}`);
    }

    // Filtro por vendor
    const vendor = searchParams.get('vendor');
    if (vendor) {
      queryParts.push(`vendor:${vendor}`);
    }

    // Filtro por tags
    const tags = searchParams.get('tags');
    if (tags) {
      const tagList = tags.split(',').filter(Boolean);
      if (tagList.length > 0) {
        queryParts.push(`(${tagList.map(tag => `tag:${tag}`).join(' OR ')})`);
      }
    }

    // Combinar todas las consultas
    if (queryParts.length > 0) {
      params.query = queryParts.join(' AND ');
    }

    // Ordenamiento
    const sort = searchParams.get('sort') as ProductSearchParams['sortKey'];
    const order = searchParams.get('order');
    
    if (sort && ['TITLE', 'PRICE', 'BEST_SELLING', 'CREATED', 'ID', 'RELEVANCE'].includes(sort)) {
      params.sortKey = sort;
    } else {
      params.sortKey = 'RELEVANCE'; // Default para búsquedas
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

  // Construir descripción de filtros activos
  const getActiveFiltersDescription = () => {
    const filters = [];
    
    const searchText = searchParams.get('q');
    if (searchText) {
      filters.push(`búsqueda: "${searchText}"`);
    }
    
    const collections = searchParams.get('collections');
    if (collections) {
      const collectionNames = collections.split(',').filter(Boolean);
      filters.push(`colecciones: ${collectionNames.join(', ')}`);
    }
    
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    if (priceMin || priceMax) {
      let priceText = 'precio: ';
      if (priceMin && priceMax) {
        priceText += `$${priceMin} - $${priceMax}`;
      } else if (priceMin) {
        priceText += `desde $${priceMin}`;
      } else if (priceMax) {
        priceText += `hasta $${priceMax}`;
      }
      filters.push(priceText);
    }
    
    const availability = searchParams.get('availability');
    if (availability === 'available') {
      filters.push('solo disponibles');
    } else if (availability === 'unavailable') {
      filters.push('solo agotados');
    }
    
    return filters.length > 0 ? filters.join(', ') : null;
  };

  const clearAllFilters = () => {
    router.push('/store');
  };

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
        <p className="text-lg text-red-600">Error al realizar la búsqueda</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const activeFiltersDescription = getActiveFiltersDescription();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Resultados de búsqueda</h1>
        
        {activeFiltersDescription && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Filtros activos:</strong> {activeFiltersDescription}
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <p className="text-gray-600">
            {productsData?.products ? 
              `${productsData.products.length} productos encontrados` : 
              'Buscando productos...'
            }
          </p>
          
          {/* Quick Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Ordenar:</label>
            <select
              value={searchParams.get('sort') || 'RELEVANCE'}
              onChange={(e) => {
                const newParams = new URLSearchParams(searchParams.toString());
                if (e.target.value === 'RELEVANCE') {
                  newParams.delete('sort');
                } else {
                  newParams.set('sort', e.target.value);
                }
                router.push(`/store/search?${newParams.toString()}`);
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="RELEVANCE">Relevancia</option>
              <option value="BEST_SELLING">Más vendidos</option>
              <option value="PRICE">Precio</option>
              <option value="TITLE">Nombre</option>
              <option value="CREATED">Más recientes</option>
            </select>
          </div>
        </div>
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
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600 mb-4">
              No hay productos que coincidan con los filtros aplicados.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Intenta:</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Verificar la ortografía</li>
                <li>• Usar términos más generales</li>
                <li>• Quitar algunos filtros</li>
              </ul>
            </div>
            <button
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ver todos los productos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}