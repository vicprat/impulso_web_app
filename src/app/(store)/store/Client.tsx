'use client'

import { Package2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Card } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useProducts } from '@/modules/shopify/hooks'
import { type ProductSearchParams } from '@/modules/shopify/types'

import { Error } from './Error'

const defaultLimit = 24
const limitOptions = [12, 24, 36, 48]

export const Client = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const afterCursorInUrl = searchParams.get('after') ?? null
  const limitInUrl = parseInt(searchParams.get('limit') ?? defaultLimit.toString(), 10)

  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})
  const [previousLimit, setPreviousLimit] = useState(limitInUrl)

  const buildSearchParamsInternal = useCallback((): ProductSearchParams => {
    const params: ProductSearchParams = {
      after: afterCursorInUrl,
      first: limitInUrl,
    }
    const collections = searchParams.get('collections')
    if (collections) {
      const collectionHandles = collections.split(',')
      params.query = collectionHandles.map((handle) => `collection:${handle}`).join(' OR ')
    }
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    if (priceMin || priceMax) {
      let priceQuery = ''
      if (priceMin && priceMin !== '0') priceQuery += `price:>=${priceMin}`
      if (priceMax) {
        if (priceQuery) priceQuery += ' AND '
        priceQuery += `price:<=${priceMax}`
      }
      params.query = params.query ? `${params.query} AND (${priceQuery})` : priceQuery
    }
    const availability = searchParams.get('availability')
    if (availability) {
      const availQuery =
        availability === 'available' ? 'available_for_sale:true' : 'available_for_sale:false'
      params.query = params.query ? `${params.query} AND ${availQuery}` : availQuery
    }

    // Mapear valores de sort a valores válidos de Shopify
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')

    if (sort) {
      // Validar y mapear el valor de sort
      const validSortKeys: Record<string, ProductSearchParams['sortKey']> = {
        BEST_SELLING: 'BEST_SELLING',
        CREATED_AT: 'CREATED_AT',
        PRICE: 'PRICE',
        PRODUCT_TYPE: 'PRODUCT_TYPE',
        RELEVANCE: 'RELEVANCE',
        TITLE: 'TITLE',
        VENDOR: 'VENDOR',

        created_at: 'CREATED_AT',

        price: 'PRICE',

        product_type: 'PRODUCT_TYPE',
        // Mapear valores legacy si existen
        title: 'TITLE',
        vendor: 'VENDOR',
      }

      const validSortKey = validSortKeys[sort]
      if (validSortKey) {
        params.sortKey = validSortKey
      } else {
        // Valor por defecto si no es válido
        params.sortKey = 'TITLE'
      }
    }

    if (order === 'desc') params.reverse = true
    return params
  }, [afterCursorInUrl, limitInUrl, searchParams])

  const { data: productsData, error, isLoading } = useProducts(buildSearchParamsInternal())

  const handlePageChange = (newPage: number) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    let targetCursor: string | null | undefined = undefined
    if (newPage === 1) {
      targetCursor = null
    } else {
      targetCursor = historyCursors[newPage]
    }
    if (newPage > pageInUrl && newPage === pageInUrl + 1) {
      if (productsData?.pageInfo.hasNextPage && productsData.pageInfo.endCursor) {
        targetCursor = productsData.pageInfo.endCursor
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
    router.push(`/store?${newUrlParams.toString()}`, { scroll: false })
  }

  const totalPages = productsData?.pageInfo.hasNextPage ? pageInUrl + 1 : pageInUrl

  const handleLimitChange = (value: string) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())

    newUrlParams.set('limit', value)
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')

    router.push(`/store?${newUrlParams.toString()}`, { scroll: false })
  }

  const handleRetry = () => {
    router.refresh()
  }

  useEffect(() => {
    if (limitInUrl !== previousLimit) {
      setPreviousLimit(limitInUrl)
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString())
        newUrlParams.set('page', '1')
        newUrlParams.delete('after')
        router.push(`/store?${newUrlParams.toString()}`, { scroll: false })
        setHistoryCursors({})
      }
    }
  }, [limitInUrl, previousLimit, pageInUrl, afterCursorInUrl, router, searchParams])

  useEffect(() => {
    setHistoryCursors((prev) => {
      const newCursors = { ...prev }
      let changed = false
      if (newCursors[pageInUrl] !== afterCursorInUrl) {
        newCursors[pageInUrl] = afterCursorInUrl
        changed = true
      }
      if (productsData?.pageInfo.hasNextPage && productsData.pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1
        if (newCursors[nextPageNumber] !== productsData.pageInfo.endCursor) {
          newCursors[nextPageNumber] = productsData.pageInfo.endCursor
          changed = true
        }
      } else if (productsData && !productsData.pageInfo.hasNextPage) {
        const nextPageNumber = pageInUrl + 1
        if (nextPageNumber in newCursors) {
          delete newCursors[nextPageNumber]
          changed = true
        }
      }
      return changed ? newCursors : prev
    })
  }, [pageInUrl, afterCursorInUrl, productsData])

  useEffect(() => {
    const pageStr = searchParams.get('page')
    const currentAfterCursor = searchParams.get('after')
    if (pageStr) {
      const pageNum = parseInt(pageStr, 10)
      if (pageNum > 1 && !currentAfterCursor) {
        if (productsData ?? error) {
          const params = new URLSearchParams(searchParams.toString())
          params.set('page', '1')
          params.delete('after')
          router.replace(`/store?${params.toString()}`, { scroll: false })
        }
      }
    }
  }, [searchParams, router, productsData, error])

  if (isLoading) {
    return <Card.Loader />
  }

  if (error) {
    return <Error error={error} handleRetry={handleRetry} />
  }

  return (
    <div>
      <div className='container mx-auto  py-4'>
        <div className='mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <h1 className='text-3xl font-bold tracking-tight text-on-surface'>Todos los productos</h1>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-3'>
              <label
                htmlFor='limit-select'
                className='whitespace-nowrap text-sm font-medium text-on-surface-variant'
              >
                Mostrar:
              </label>
              <Select value={limitInUrl.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className='w-[140px] border-outline bg-surface-container focus:border-primary'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className=' border-outline-variant'>
                  {limitOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option.toString()}
                      className='hover:bg-surface-container-highest focus:bg-surface-container-highest'
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
            <Card.Container>
              {productsData.products.map((product) => (
                <Card.Product key={product.id} product={product} />
              ))}
            </Card.Container>

            <div className='flex justify-center'>
              <Pagination
                currentPage={pageInUrl}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className='py-16 text-center'>
            <div className='mx-auto max-w-md'>
              <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-surface-container-highest'>
                <Package2 className='size-8 text-on-surface-variant' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-on-surface'>
                No se encontraron productos
              </h3>
              <p className='mb-4 text-on-surface-variant'>
                No hay productos disponibles con los filtros aplicados.
              </p>
              <p className='text-sm text-on-surface-variant'>
                Intenta ajustar tus filtros o el límite de productos por página.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
