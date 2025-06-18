/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useCollectionByHandle } from '@/modules/shopify/hooks';
import { Pagination } from '@/components/Pagination';
import { Card } from '@/components/Card.tsx';

export default function Page() {
  const params = useParams();
  const collectionHandle = params.collection as string;
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 24;

  const { data: collection, isLoading, error } = useCollectionByHandle(
    collectionHandle, 
    productsPerPage * currentPage
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-blue-600"></div>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600">Colección no encontrada</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = collection.products.slice(startIndex, endIndex);
  const totalPages = Math.ceil(collection.products.length / productsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Collection Header */}
      <div className="mb-8">
        {collection.image && (
          <div className="aspect-video w-full max-w-4xl mx-auto mb-6 rounded-lg overflow-hidden">
            <img 
              src={collection.image.url} 
              alt={collection.image.altText || collection.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{collection.title}</h1>
          {collection.description && (
            <div 
              className="text-gray-600 max-w-2xl mx-auto"
              dangerouslySetInnerHTML={{ __html: collection.descriptionHtml || collection.description }}
            />
          )}
          <p className="text-sm text-gray-500 mt-4">
            {collection.products.length} productos en esta colección
          </p>
        </div>
      </div>

      {currentProducts.length > 0 ? (
        <>
          <Card.Container>
            {currentProducts.map(product => (
              <Card.Product key={product.id} product={product} />
            ))}
          </Card.Container>
          
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Esta colección no tiene productos disponibles</p>
        </div>
      )}
    </div>
  );
}
