/* eslint-disable @next/next/no-img-element */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCollections } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';

export default function CollectionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursor, setCursor] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<Array<string | null>>([null]);
  
  const collectionsPerPage = 12;

  const { data: collectionsData, isLoading, error } = useCollections({
    first: collectionsPerPage,
    after: cursor,
  });

  const handlePageChange = (newPage: number) => {
    if (newPage > currentPage) {
      const nextCursor = collectionsData?.pageInfo.endCursor || null;
      
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

  const totalPages = collectionsData?.pageInfo.hasNextPage 
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
        <p className="text-lg text-red-600">Error al cargar las colecciones</p>
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
        <h1 className="text-2xl font-bold">Todas las colecciones</h1>
        <p className="text-gray-600">
          {collectionsData?.collections ? `${collectionsData.collections.length} colecciones` : ''}
        </p>
      </div>

      {collectionsData?.collections && collectionsData.collections.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {collectionsData.collections.map(collection => (
              <Link 
                key={collection.id} 
                href={`/store/collections/${collection.handle}`}
                className="group"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  {collection.image && (
                    <div className="aspect-video overflow-hidden">
                      <img 
                        src={collection.image.url} 
                        alt={collection.image.altText || collection.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {collection.title}
                    </h3>
                    <p className="text-gray-600 line-clamp-3">{collection.description}</p>
                    <div className="mt-4">
                      <span className="text-blue-600 font-medium">
                        Explorar colección →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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
          <p className="text-lg text-gray-600">No se encontraron colecciones</p>
        </div>
      )}
    </div>
  );
}
