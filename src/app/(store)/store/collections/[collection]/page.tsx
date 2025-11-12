'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Card } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import { useCollectionByHandle } from '@/modules/shopify/hooks'

const defaultLimit = 24

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const collectionHandle = params.collection as string

  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const afterCursorInUrl = searchParams.get('after') ?? null

  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})

  const {
    data: collection,
    error,
    isLoading,
  } = useCollectionByHandle(collectionHandle, defaultLimit, afterCursorInUrl)

  const handlePageChange = (newPage: number) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    let targetCursor: string | null | undefined = undefined

    if (newPage === 1) {
      targetCursor = null
    } else {
      targetCursor = historyCursors[newPage]
    }

    if (newPage > pageInUrl && newPage === pageInUrl + 1) {
      if (collection?.pageInfo?.hasNextPage && collection.pageInfo.endCursor) {
        targetCursor = collection.pageInfo.endCursor
      }
    }

    newUrlParams.set('page', newPage.toString())
    if (targetCursor === null) {
      newUrlParams.delete('after')
    } else if (targetCursor) {
      newUrlParams.set('after', targetCursor)
    } else {
      console.warn(`Cursor para página ${newPage} no encontrado. Volviendo a página 1.`)
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
    }

    router.push(`/store/collections/${collectionHandle}?${newUrlParams.toString()}`, {
      scroll: false,
    })
  }

  const totalPages = collection?.pageInfo?.hasNextPage ? pageInUrl + 1 : pageInUrl

  const handleRetry = () => {
    router.refresh()
  }

  useEffect(() => {
    setHistoryCursors((prev) => {
      const newCursors = { ...prev }
      let changed = false

      if (newCursors[pageInUrl] !== afterCursorInUrl) {
        newCursors[pageInUrl] = afterCursorInUrl
        changed = true
      }

      if (collection?.pageInfo?.hasNextPage && collection.pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1
        if (newCursors[nextPageNumber] !== collection.pageInfo.endCursor) {
          newCursors[nextPageNumber] = collection.pageInfo.endCursor
          changed = true
        }
      } else if (collection && !collection.pageInfo?.hasNextPage) {
        const nextPageNumber = pageInUrl + 1
        if (nextPageNumber in newCursors) {
          delete newCursors[nextPageNumber]
          changed = true
        }
      }

      return changed ? newCursors : prev
    })
  }, [pageInUrl, afterCursorInUrl, collection])

  useEffect(() => {
    const pageStr = searchParams.get('page')
    const currentAfterCursor = searchParams.get('after')

    if (pageStr) {
      const pageNum = parseInt(pageStr, 10)
      if (pageNum > 1 && !currentAfterCursor) {
        if (collection ?? error) {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', '1')
          params.delete('after')
          router.replace(`/store/collections/${collectionHandle}?${params.toString()}`, {
            scroll: false,
          })
        }
      }
    }
  }, [searchParams, router, collection, error, collectionHandle])

  if (isLoading) {
    return <Card.Loader />
  }

  if (error || !collection) {
    return (
      <div className='py-12 text-center'>
        <p className='text-lg text-red-600'>Colección no encontrada</p>
        <button
          onClick={handleRetry}
          className='mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className='mb-8'>
        {collection.image && (
          <div className='mx-auto mb-6 aspect-video w-full max-w-4xl overflow-hidden rounded-lg'>
            <img
              src={collection.image.url}
              alt={collection.image.altText ?? collection.title}
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
        </div>
      </div>

      {collection.products && collection.products.length > 0 ? (
        <>
          <Card.Container>
            {collection.products.map((product) => (
              <Card.Product key={product.id} product={product} />
            ))}
          </Card.Container>

          {totalPages > 1 && (
            <div className='flex justify-center'>
              <Pagination
                currentPage={pageInUrl}
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
