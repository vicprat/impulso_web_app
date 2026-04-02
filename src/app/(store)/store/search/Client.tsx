'use client'

import { ArrowDown, ArrowUp, RefreshCw, Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

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
import { useCollections, useFilterOptions, useStoreProducts } from '@/modules/shopify/hooks'
import {
  type Product,
  type ProductSearchFilters,
  type ProductSearchParams,
} from '@/modules/shopify/types'

const sortOptions = [
  { label: 'Título', supportsOrder: true, value: 'TITLE' },
  { label: 'Precio', supportsOrder: true, value: 'PRICE' },
  { label: 'Fecha de creación', supportsOrder: true, value: 'CREATED_AT' },
  { label: 'Fecha de actualización', supportsOrder: true, value: 'UPDATED_AT' },
  { label: 'Artista', supportsOrder: true, value: 'VENDOR' },
] as const

export const Client = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentPage = useMemo(() => {
    const page = searchParams.get('page')
    return page ? parseInt(page, 10) : 1
  }, [searchParams])

  const cursor = searchParams.get('after') ?? undefined

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
  }, [searchParams])

  const currentSort = (() => {
    const sort = searchParams.get('sort')
    if (!sort) return 'TITLE'

    const validSortKeys: Record<string, ProductSearchParams['sortKey']> = {
      CREATED_AT: 'CREATED_AT',
      PRICE: 'PRICE',
      TITLE: 'TITLE',
      UPDATED_AT: 'UPDATED_AT',
      VENDOR: 'VENDOR',

      createdAt: 'CREATED_AT',
      created_at: 'CREATED_AT',
      price: 'PRICE',
      title: 'TITLE',
      updatedAt: 'UPDATED_AT',
      vendor: 'VENDOR',
    }

    const validSortKey = validSortKeys[sort]
    return validSortKey || 'TITLE'
  })()
  const currentOrder = searchParams.get('order')

  const dimensions = searchParams.get('dimensions')?.split(',') ?? []
  const techniques = searchParams.get('techniques')?.split(',').filter(Boolean) ?? []
  const years = searchParams.get('years')?.split(',') ?? []

  const storeParams = {
    artworkType: searchFilters.productType?.[0],
    cursor: cursor ?? undefined,
    dimensions: dimensions.length > 0 ? dimensions.join(',') : undefined,
    limit: 24,
    priceMax: searchFilters.price?.max,
    priceMin: searchFilters.price?.min,
    search: searchFilters.query,
    sortBy:
      currentSort === 'PRICE'
        ? 'price'
        : currentSort === 'TITLE'
          ? 'title'
          : currentSort === 'CREATED_AT'
            ? 'createdAt'
            : currentSort === 'UPDATED_AT'
              ? 'updatedAt'
              : currentSort === 'VENDOR'
                ? 'vendor'
                : undefined,
    sortOrder: currentOrder === 'desc' ? ('desc' as const) : ('asc' as const),
    technique: techniques.length > 0 ? techniques.join(',') : undefined,
    vendor:
      searchFilters.vendor && searchFilters.vendor.length > 0
        ? searchFilters.vendor.join(',')
        : undefined,
    year: years.length > 0 ? years.join(',') : undefined,
  }

  const { data: productsData, error, isLoading } = useStoreProducts(storeParams)

  const { data: filterOptions } = useFilterOptions()
  const { data: collectionsData } = useCollections()

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams.toString())
    let targetCursor: string | null = null

    if (newPage === 1) {
      targetCursor = null
    } else if (newPage > currentPage) {
      // Forward navigation: use the cursor from the current response
      targetCursor = productsData?.pageInfo.endCursor ?? null
    } else {
      // Backward navigation: need to recalculate
      targetCursor = null
    }

    newParams.set('page', newPage.toString())
    if (targetCursor) {
      newParams.set('after', targetCursor)
    } else {
      newParams.delete('after')
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

    if (techniques.length > 0 && filterOptions) {
      const techniqueLabels = techniques
        .map((techValue) => {
          const option = filterOptions.techniques.find((opt) => opt.input === techValue)
          return option ? option.label : techValue
        })
        .join(', ')
      if (techniqueLabels)
        filters.push({ key: 'techniques', label: 'Técnicas', value: techniqueLabels })
    }

    if (dimensions.length > 0 && filterOptions) {
      const dimensionLabels = dimensions
        .map((dimValue) => {
          const option = filterOptions.dimensions.find((opt) => opt.input === dimValue)
          return option ? option.label : dimValue
        })
        .join(', ')
      if (dimensionLabels)
        filters.push({ key: 'dimensions', label: 'Medidas', value: dimensionLabels })
    }

    if (years.length > 0) {
      filters.push({ key: 'years', label: 'Años', value: years.join(', ') })
    }

    if (searchFilters.tags && filterOptions) {
      const allTagOptions = [
        ...filterOptions.techniques,
        ...filterOptions.formats,
        ...filterOptions.dimensions,
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
      ([key]) => !['sort', 'order', 'page', 'after'].includes(key)
    )

    const path = hasRemainingFilters ? `/store/search?${newParams.toString()}` : '/store'
    router.push(path)
  }

  const clearAllFilters = () => {
    const path = '/store'
    router.push(path)
  }

  const activeFilters = getActiveFilters()
  const currentSortOption = sortOptions.find((opt) => opt.value === currentSort)

  if (isLoading) return <Card.Loader />
  if (error) {
    return (
      <div className='min-h-screen'>
        <div className='mx-auto py-12'>
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
      <div className='mx-auto  py-6'>
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
              {productsData.products.map((product: Product) => (
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
