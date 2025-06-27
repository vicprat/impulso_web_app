/* eslint-disable @next/next/no-img-element */
'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Card } from '@/components/Card.tsx'
import { Pagination } from '@/components/Pagination'
import { useCollectionByHandle } from '@/modules/shopify/hooks'

export default function Page() {
  const params = useParams()
  const collectionHandle = params.collection as string
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 24

  const {
    data: collection,
    error,
    isLoading,
  } = useCollectionByHandle(collectionHandle, productsPerPage * currentPage)

  if (isLoading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='size-12 animate-spin rounded-full border-blue-600'></div>
      </div>
    )
  }

  if (error || !collection) {
    return (
      <div className='py-12 text-center'>
        <p className='text-lg text-red-600'>Colección no encontrada</p>
        <button
          onClick={() => window.location.reload()}
          className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          Reintentar
        </button>
      </div>
    )
  }

  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = collection.products.slice(startIndex, endIndex)
  const totalPages = Math.ceil(collection.products.length / productsPerPage)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ behavior: 'smooth', top: 0 })
  }

  return (
    <div>
      {/* Collection Header */}
      <div className='mb-8'>
        {collection.image && (
          <div className='mx-auto mb-6 aspect-video w-full max-w-4xl overflow-hidden rounded-lg'>
            <img
              src={collection.image.url}
              alt={collection.image.altText || collection.title}
              className='size-full object-cover'
            />
          </div>
        )}

        <div className='text-center'>
          <h1 className='mb-4 text-3xl font-bold'>{collection.title}</h1>
          {collection.description && (
            <div
              className='mx-auto max-w-2xl text-gray-600'
              dangerouslySetInnerHTML={{
                __html: collection.descriptionHtml || collection.description,
              }}
            />
          )}
          <p className='mt-4 text-sm text-gray-500'>
            {collection.products.length} productos en esta colección
          </p>
        </div>
      </div>

      {currentProducts.length > 0 ? (
        <>
          <Card.Container>
            {currentProducts.map((product) => (
              <Card.Product key={product.id} product={product} />
            ))}
          </Card.Container>

          {totalPages > 1 && (
            <div className='flex justify-center'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className='py-12 text-center'>
          <p className='text-lg text-gray-600'>Esta colección no tiene productos disponibles</p>
        </div>
      )}
    </div>
  )
}
