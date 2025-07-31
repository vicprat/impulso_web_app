'use client'

import { ArrowDown, ArrowUp, RefreshCw, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

import { Card } from '@/components/Card'
import { Pagination } from '@/components/Pagination'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCollections, useFilterOptions, useProducts } from '@/modules/shopify/hooks'
import { type ProductSearchFilters, type ProductSearchParams } from '@/modules/shopify/types'

const sortOptions = [
  { label: 'Relevancia', supportsOrder: false, value: 'RELEVANCE' },
  { label: 'Más vendidos', supportsOrder: false, value: 'BEST_SELLING' },
  { label: 'Precio', supportsOrder: true, value: 'PRICE' },
  { label: 'Nombre', supportsOrder: true, value: 'TITLE' },
  { label: 'Fecha de creación', supportsOrder: true, value: 'CREATED' },
] as const

export const Client = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Gestión de la paginación con cursores
  const [ pageHistory, setPageHistory ] = useState<(string | null)[]>([ null ])
  const currentPage = useMemo(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) : 1
  }, [ searchParams ])

  const cursor = useMemo(() => pageHistory[ currentPage - 1 ], [ pageHistory, currentPage ])

  const searchFilters: ProductSearchFilters = useMemo(() => {
    const filters: ProductSearchFilters = {}
    const q = searchParams.get('q')
    if (q) filters.query = q
    const collections = searchParams.get('collections')
    if (collections) filters.collections = collections.split(',')
    const productTypes = searchParams.get('product_types')
    if (productTypes) filters.productType = productTypes.split(',')
    const vendors = searchParams.get('vendor')
    if (vendors) filters.vendor = vendors.split(',')
    const tags = searchParams.get('tags')
    if (tags) filters.tags = tags.split(',')
    const availability = searchParams.get('availability')
    if (availability === 'available') filters.available = true
    if (availability === 'unavailable') filters.available = false
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    if (priceMin || priceMax) {
      filters.price = {
        max: priceMax ? parseFloat(priceMax) : undefined,
        min: priceMin ? parseFloat(priceMin) : undefined,
      }
    }
    return filters
  }, [ searchParams ])

  const currentSort = (() => {
    const sort = searchParams.get('sort')
    if (!sort) return 'RELEVANCE'

    // Validar y mapear el valor de sort
    const validSortKeys: Record<string, ProductSearchParams[ 'sortKey' ]> = {
      'TITLE': 'TITLE',
      'PRICE': 'PRICE',
      'CREATED_AT': 'CREATED_AT',
      'VENDOR': 'VENDOR',
      'PRODUCT_TYPE': 'PRODUCT_TYPE',
      'BEST_SELLING': 'BEST_SELLING',
      'RELEVANCE': 'RELEVANCE',
      // Mapear valores legacy si existen
      'title': 'TITLE',
      'price': 'PRICE',
      'created_at': 'CREATED_AT',
      'vendor': 'VENDOR',
      'product_type': 'PRODUCT_TYPE',
    }

    const validSortKey = validSortKeys[ sort ]
    return validSortKey || 'RELEVANCE'
  })()
  const currentOrder = searchParams.get('order')

  const {
    data: productsData,
    error,
    isLoading,
  } = useProducts({
    after: cursor,
    filters: searchFilters,
    first: 24,
    reverse: currentOrder === 'desc',
    sortKey: currentSort,
  })

  const { data: filterOptions } = useFilterOptions()
  const { data: collectionsData } = useCollections()

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (newPage > currentPage) {
      const nextCursor = productsData?.pageInfo.endCursor
      if (nextCursor) {
        setPageHistory((prev) => {
          const newHistory = [ ...prev ]
          newHistory[ newPage ] = nextCursor
          return newHistory
        })
        newParams.set('page', newPage.toString())
      }
    } else if (newPage < currentPage) {
      newParams.set('page', newPage.toString())
    } else {
      newParams.set('page', newPage.toString())
    }
    router.push(`/store/search?${newParams.toString()}`)
  }

  const totalPages = productsData?.pageInfo.hasNextPage
    ? currentPage + 1
    : productsData?.products.length
      ? currentPage
      : 0

  const handleSortChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (value === 'RELEVANCE') {
      newParams.delete('sort')
      newParams.delete('order')
    } else {
      newParams.set('sort', value)
      const sortOption = sortOptions.find((opt) => opt.value === value)
      if (sortOption?.supportsOrder && !newParams.get('order')) {
        newParams.set('order', 'asc')
      }
    }
    newParams.delete('page')
    router.push(`/store/search?${newParams.toString()}`)
  }

  const toggleSortOrder = () => {
    const newParams = new URLSearchParams(searchParams.toString())
    const sortOption = sortOptions.find((opt) => opt.value === currentSort)
    if (!sortOption?.supportsOrder) return
    newParams.set('order', currentOrder === 'desc' ? 'asc' : 'desc')
    router.push(`/store/search?${newParams.toString()}`)
  }

  const getActiveFilters = () => {
    const filters: { key: string; label: string; value: string }[] = []
    if (searchFilters.query)
      filters.push({ key: 'q', label: 'Búsqueda', value: `"${searchFilters.query}"` })

    if (searchFilters.collections && collectionsData) {
      const names = searchFilters.collections
        .map(
          (handle) => collectionsData.collections.find((c) => c.handle === handle)?.title ?? handle
        )
        .join(', ')
      if (names) filters.push({ key: 'collections', label: 'Colecciones', value: names })
    }
    if (searchFilters.productType)
      filters.push({
        key: 'product_types',
        label: 'Tipos de Obra',
        value: searchFilters.productType.join(', '),
      })
    if (searchFilters.vendor)
      filters.push({ key: 'vendor', label: 'Artistas', value: searchFilters.vendor.join(', ') })

    if (searchFilters.tags && filterOptions) {
      const allTagOptions = [
        ...filterOptions.techniques,
        ...filterOptions.formats,
        ...filterOptions.locations,
        ...filterOptions.years,
        ...filterOptions.series,
        ...filterOptions.otherTags,
      ]
      const tagLabels = searchFilters.tags
        .map((tagValue) => {
          const option = allTagOptions.find((opt) => opt.input === tagValue)
          return option ? option.label : tagValue
        })
        .join(', ')
      if (tagLabels) filters.push({ key: 'tags', label: 'Filtros', value: tagLabels })
    }

    if (searchFilters.price) {
      let priceText = ''
      if (searchFilters.price.min && searchFilters.price.max)
        priceText = `$${searchFilters.price.min} - $${searchFilters.price.max}`
      else if (searchFilters.price.min) priceText = `Desde $${searchFilters.price.min}`
      else if (searchFilters.price.max) priceText = `Hasta $${searchFilters.price.max}`
      if (priceText) filters.push({ key: 'price', label: 'Precio', value: priceText })
    }
    if (searchFilters.available === true)
      filters.push({ key: 'availability', label: 'Disponibilidad', value: 'Solo disponibles' })
    if (searchFilters.available === false)
      filters.push({ key: 'availability', label: 'Disponibilidad', value: 'Solo agotados' })

    return filters
  }

  const removeFilter = (filterKey: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    if (filterKey === 'price') {
      newParams.delete('price_min')
      newParams.delete('price_max')
    } else {
      newParams.delete(filterKey)
    }
    newParams.delete('page')

    const hasRemainingFilters = Array.from(newParams.entries()).some(
      ([ key ]) => ![ 'sort', 'order', 'page', 'after' ].includes(key)
    )

    const path = hasRemainingFilters ? `/store/search?${newParams.toString()}` : '/store'
    router.push(path)
  }

  const clearAllFilters = () => {
    const newParams = new URLSearchParams()
    const sort = searchParams.get('sort')
    const order = searchParams.get('order')
    if (sort) newParams.set('sort', sort)
    if (order) newParams.set('order', order)
    const path = newParams.toString() ? `/store/search?${newParams.toString()}` : '/store'
    router.push(path)
  }

  const activeFilters = getActiveFilters()
  const currentSortOption = sortOptions.find((opt) => opt.value === currentSort)

  if (isLoading) return <Card.Loader />
  if (error) {
    return (
      <div className='min-h-screen'>
        <div className='mx-auto px-4 py-12'>
          <Alert className='bg-error-container/10 mx-auto max-w-md border-error-container'>
            <RefreshCw className='size-4 text-error' />
            <AlertDescription className='text-on-error-container'>
              <span className='font-medium'>Error al realizar la búsqueda</span>
              <br />
              {error.message}
            </AlertDescription>
          </Alert>
          <div className='mt-6 flex justify-center'>
            <Button
              onClick={() => window.location.reload()}
              variant='default'
              className='hover:bg-primary/90 bg-primary text-on-primary'
            >
              <RefreshCw className='mr-2 size-4' />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen'>
      <div className='mx-auto px-4 py-6'>
        <div className='mb-8'>
          <h1 className='mb-4 text-3xl font-bold tracking-tight text-on-surface'>
            Resultados de búsqueda
          </h1>
          {activeFilters.length > 0 && (
            <div className='mb-6 rounded-lg border border-outline bg-surface-container p-4'>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-medium text-on-surface'>Filtros activos</h3>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={clearAllFilters}
                  className='hover:text-primary/80 text-primary'
                >
                  Limpiar todos
                </Button>
              </div>
              <div className='flex flex-wrap gap-2'>
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant='secondary'
                    className='flex items-center gap-2 bg-surface-container-highest'
                  >
                    <span className='text-xs'>
                      <span className='font-medium'>{filter.label}:</span> {filter.value}
                    </span>
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className='rounded-full p-0.5 hover:bg-surface-container-high'
                    >
                      <X className='size-3' />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div className='mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='text-sm text-on-surface-variant'>
              {productsData?.products ? (
                <>
                  Mostrando {(currentPage - 1) * 24 + 1}-
                  {Math.min(
                    currentPage * 24,
                    (currentPage - 1) * 24 + productsData.products.length
                  )}{' '}
                  productos
                </>
              ) : (
                'Cargando resultados...'
              )}
            </div>
            <div className='flex items-center gap-3'>
              <label className='whitespace-nowrap text-sm font-medium text-on-surface-variant'>
                Ordenar por:
              </label>
              <div className='flex items-center gap-2'>
                <Select value={currentSort} onValueChange={handleSortChange}>
                  <SelectTrigger className='w-[140px] border-outline'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='border-outline-variant'>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentSortOption?.supportsOrder && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={toggleSortOrder}
                    className='h-9 border-outline px-3 hover:bg-surface-container'
                    title={`Ordenar ${currentOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                  >
                    {currentOrder === 'asc' ? (
                      <ArrowUp className='size-4' />
                    ) : (
                      <ArrowDown className='size-4' />
                    )}
                  </Button>
                )}
              </div>
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
            <div className='mt-8 flex justify-center'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className='py-16 text-center'>
            <div className='mx-auto max-w-md'>
              <div className='mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-surface-container-highest'>
                <Search className='size-8 text-on-surface-variant' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-on-surface'>
                No se encontraron productos
              </h3>
              <p className='mb-6 text-on-surface-variant'>
                No hay productos que coincidan con los filtros aplicados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
