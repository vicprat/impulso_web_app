/* eslint-disable @next/next/no-img-element */

'use client'

import Link from 'next/link'

import { useCollections } from '@/modules/shopify/hooks'

export default function Page() {
  const {
    data: collectionsData,
    error,
    isLoading,
  } = useCollections({
    first: 250,
  })

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='size-12 animate-spin rounded-full border-y-2 border-blue-600'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='py-12 text-center'>
        <p className='text-lg text-red-600'>Error al cargar las colecciones</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      {collectionsData?.collections && collectionsData.collections.length > 0 ? (
        <div className='mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {collectionsData.collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/store/collections/${collection.handle}`}
              className='group'
            >
              <div className='overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg'>
                {collection.image && (
                  <div className='aspect-video overflow-hidden'>
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText ?? collection.title}
                      className='size-full object-cover transition-transform group-hover:scale-105'
                    />
                  </div>
                )}
                <div className='p-6'>
                  <h3 className='mb-2 text-xl font-semibold transition-colors group-hover:text-blue-600'>
                    {collection.title}
                  </h3>
                  <p className='line-clamp-3 text-gray-600'>{collection.description}</p>
                  <div className='mt-4'>
                    <span className='font-medium text-blue-600'>Explorar colección →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='py-12 text-center'>
          <p className='text-lg text-gray-600'>No se encontraron colecciones</p>
        </div>
      )}
    </div>
  )
}
