/* eslint-disable @next/next/no-img-element */

'use client';

import Link from 'next/link';
import { useCollections } from '@/modules/shopify/hooks';

export default function CollectionsPage() {
  const { data: collectionsData, isLoading, error } = useCollections({
    first: 250, 
  });

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
      

      {collectionsData?.collections && collectionsData.collections.length > 0 ? (
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
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No se encontraron colecciones</p>
        </div>
      )}
    </div>
  );
}