'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { useShopInfo, useProducts, useCollections } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import Link from 'next/link';

export default function ShopPage() {
  // Enable real-time updates
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]); // Histórico de cursores para navegación
  
  // Cantidad de productos por página
  const productsPerPage = 8;
  
  // Obtener información de la tienda
  const { data: shopInfo, isLoading: shopLoading } = useShopInfo();
  
  // Consulta de productos con paginación
  const { data: productsData, isLoading: productsLoading } = useProducts({
    first: productsPerPage,
    after: cursor,
    sortKey: 'BEST_SELLING'
  });

  const { data: collectionsData } = useCollections();

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    // Si vamos a una página siguiente
    if (newPage > currentPage) {
      const nextCursor = productsData?.pageInfo.endCursor || null;
      
      if (nextCursor) {
        // Guardamos el nuevo cursor en el historial
        const newHistory = [...pageHistory];
        if (newHistory.length <= newPage) {
          newHistory.push(nextCursor);
        }
        setPageHistory(newHistory);
        setCursor(nextCursor);
        setCurrentPage(newPage);
      }
    } 
    // Si vamos a una página anterior
    else if (newPage < currentPage && newPage >= 1) {
      // Obtenemos el cursor de la página a la que queremos ir
      const previousCursor = pageHistory[newPage - 1];
      setCursor(previousCursor);
      setCurrentPage(newPage);
    }
  };

  // Calcular el número total de páginas (estimado)
  const totalPages = productsData?.pageInfo.hasNextPage 
    ? currentPage + 1 
    : currentPage;

  if (shopLoading || productsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{shopInfo?.name || 'Tienda'}</h1>
        <p className="text-gray-600 mt-2">Explora nuestra colección de productos</p>
      </div>

      {collectionsData?.collections && collectionsData.collections.length > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Colecciones</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {collectionsData.collections.map(collection => (
              <div key={collection.id} className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold">{collection.title}</h3>
                <p className="text-gray-600 mt-2">{collection.description}</p>
                <div className="mt-4">
                  <Link href={`/collections/${collection.handle}`} className="text-blue-500 hover:underline">
                    Ver colección
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {productsData?.products && productsData.products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {productsData.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}