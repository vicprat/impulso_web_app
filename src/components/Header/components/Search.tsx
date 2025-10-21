'use client'

import { Filter, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useFilterOptions, useStoreProducts } from '@/modules/shopify/hooks'

import type { Product } from '@/src/modules/shopify/types'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

interface QuickFilters {
  technique?: string
  productType?: string
  priceRange?: 'low' | 'mid' | 'high'
  year?: string
}

const priceRanges = {
  high: { label: 'Alto (>$10,000)', max: undefined, min: 10000 },
  low: { label: 'Bajo (<$2,000)', max: 2000, min: undefined },
  mid: { label: 'Medio ($2,000-$10,000)', max: 10000, min: 2000 },
}

export const Search: React.FC<Props> = ({ open, setOpen }) => {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const { data: filterOptions } = useFilterOptions()

  const hasAnyFilter =
    debouncedQuery || quickFilters.technique || quickFilters.productType || quickFilters.year

  const { data, error, isLoading } = useStoreProducts(
    {
      artworkType: quickFilters.productType,
      limit: 5,
      search: debouncedQuery,
      technique: quickFilters.technique,
    },
    {
      enabled: !!hasAnyFilter,
    }
  )

  const isError = !!error

  // Estados de carga específicos
  const isTextSearching = query !== debouncedQuery && query.trim().length > 0
  const isFilterSearching = isLoading && hasAnyFilter
  const isSearching = isTextSearching || isFilterSearching

  const products = data?.products ?? []

  const filteredProducts = products.filter((product: Product) => {
    if (quickFilters.priceRange) {
      const price = parseFloat(product.priceRange.minVariantPrice.amount)
      const range = priceRanges[quickFilters.priceRange]
      if (range.min && price < range.min) return false
      if (range.max && price > range.max) return false
    }
    if (quickFilters.year && product.artworkDetails?.year !== quickFilters.year) {
      return false
    }
    return true
  })

  const handleSelect = (handle: string) => {
    router.push(`/store/product/${handle}`)
    setOpen(false)
    resetFilters()
  }

  const handleSeeMore = () => {
    const params = new URLSearchParams()
    if (debouncedQuery) params.set('q', debouncedQuery)
    if (quickFilters.technique) params.set('technique', quickFilters.technique)
    if (quickFilters.productType) params.set('product_types', quickFilters.productType)
    if (quickFilters.priceRange) {
      const range = priceRanges[quickFilters.priceRange]
      if (range.min) params.set('price_min', range.min.toString())
      if (range.max) params.set('price_max', range.max.toString())
    }
    if (quickFilters.year) params.set('years', quickFilters.year)

    const queryString = params.toString()
    router.push(`/store/search${queryString ? `?${queryString}` : ''}`)
    setOpen(false)
    resetFilters()
  }

  const resetFilters = () => {
    setQuery('')
    setQuickFilters({})
    setShowFilters(false)
  }

  const removeQuickFilter = (key: keyof QuickFilters) => {
    setQuickFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[key]
      return newFilters
    })
  }

  const getActiveFiltersCount = () => {
    return Object.keys(quickFilters).length
  }

  useEffect(() => {
    if (!open) {
      resetFilters()
    }
  }, [open])

  const techniqueOptions =
    filterOptions?.techniques.map((t) => ({ label: t.label, value: t.input })) ?? []

  const productTypeOptions =
    filterOptions?.productTypes.map((pt) => ({ label: pt.label, value: pt.input })) ?? []

  const yearOptions =
    filterOptions?.years
      .map((y) => ({ label: y.label, value: y.input }))
      .sort((a, b) => b.label.localeCompare(a.label)) ?? []

  const handleQuickFilterChange = (key: keyof QuickFilters, value: string) => {
    if (query) {
      setQuery('')
    }
    setQuickFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
      <div className='flex items-center gap-2 border-b pr-3'>
        <div className='flex-1'>
          <CommandInput
            placeholder='Busca por obra, artista, estilo, técnica, año o precio...'
            value={query}
            onValueChange={setQuery}
          />
        </div>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setShowFilters(!showFilters)}
          className='h-8 shrink-0 px-2'
        >
          <SlidersHorizontal className='size-4' />
          {getActiveFiltersCount() > 0 && (
            <Badge variant='default' className='ml-1 size-4 p-0 text-[10px]'>
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <div className='bg-muted/30 border-b p-3'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-xs font-medium text-muted-foreground'>Filtros Rápidos</span>
            {getActiveFiltersCount() > 0 && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setQuickFilters({})}
                className='h-6 px-2 text-xs'
              >
                Limpiar
              </Button>
            )}
          </div>

          <div className='space-y-2'>
            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label className='mb-1 block text-xs font-medium'>Técnica</label>
                <Select
                  value={quickFilters.technique || ''}
                  onValueChange={(value) =>
                    value === '__clear__'
                      ? removeQuickFilter('technique')
                      : handleQuickFilterChange('technique', value)
                  }
                  disabled={!!isFilterSearching}
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder='Todas' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__clear__'>Todas las técnicas</SelectItem>
                    {techniqueOptions.map((technique) => (
                      <SelectItem key={technique.value} value={technique.value}>
                        {technique.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='mb-1 block text-xs font-medium'>Tipo de obra</label>
                <Select
                  value={quickFilters.productType || ''}
                  onValueChange={(value) =>
                    value === '__clear__'
                      ? removeQuickFilter('productType')
                      : handleQuickFilterChange('productType', value)
                  }
                  disabled={!!isFilterSearching}
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder='Todos' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__clear__'>Todos los tipos</SelectItem>
                    {productTypeOptions.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <div>
                <label className='mb-1 block text-xs font-medium'>Precio</label>
                <Select
                  value={quickFilters.priceRange || ''}
                  onValueChange={(value) => {
                    if (value === '__clear__') {
                      removeQuickFilter('priceRange')
                    } else {
                      handleQuickFilterChange('priceRange', value)
                    }
                  }}
                  disabled={!!isFilterSearching}
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder='Cualquiera' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__clear__'>Cualquier precio</SelectItem>
                    {Object.entries(priceRanges).map(([key, range]) => (
                      <SelectItem key={key} value={key}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className='mb-1 block text-xs font-medium'>Año</label>
                <Select
                  value={quickFilters.year || ''}
                  onValueChange={(value) =>
                    value === '__clear__'
                      ? removeQuickFilter('year')
                      : handleQuickFilterChange('year', value)
                  }
                  disabled={!!isFilterSearching}
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue placeholder='Cualquiera' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='__clear__'>Cualquier año</SelectItem>
                    {yearOptions.slice(0, 20).map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {getActiveFiltersCount() > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {quickFilters.technique && (
                <Badge variant='secondary' className='text-xs'>
                  {techniqueOptions.find((t) => t.value === quickFilters.technique)?.label}
                  <X
                    className='ml-1 size-3 cursor-pointer'
                    onClick={() => removeQuickFilter('technique')}
                  />
                </Badge>
              )}
              {quickFilters.productType && (
                <Badge variant='secondary' className='text-xs'>
                  {productTypeOptions.find((t) => t.value === quickFilters.productType)?.label}
                  <X
                    className='ml-1 size-3 cursor-pointer'
                    onClick={() => removeQuickFilter('productType')}
                  />
                </Badge>
              )}
              {quickFilters.priceRange && (
                <Badge variant='secondary' className='text-xs'>
                  {priceRanges[quickFilters.priceRange].label}
                  <X
                    className='ml-1 size-3 cursor-pointer'
                    onClick={() => removeQuickFilter('priceRange')}
                  />
                </Badge>
              )}
              {quickFilters.year && (
                <Badge variant='secondary' className='text-xs'>
                  Año: {yearOptions.find((y) => y.value === quickFilters.year)?.label}
                  <X
                    className='ml-1 size-3 cursor-pointer'
                    onClick={() => removeQuickFilter('year')}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <CommandList className='max-h-[400px]'>
        {isSearching && (
          <div className='space-y-2 p-4'>
            <ScrollArea className='max-h-[300px]'>
              <div className='space-y-2'>
                {[1, 2, 3].map((i) => (
                  <div key={i} className='flex items-center gap-3 rounded-lg border p-3'>
                    <Skeleton className='size-12 rounded-md bg-surface' />
                    <div className='flex min-w-0 flex-1 flex-col space-y-1'>
                      <Skeleton className='h-4 w-3/4 bg-surface' />
                      <Skeleton className='h-3 w-1/2 bg-surface' />
                      <Skeleton className='h-3 w-1/4 bg-surface' />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {!isSearching && !isError && filteredProducts.length === 0 && hasAnyFilter && (
          <CommandEmpty>
            <div className='py-6 text-center'>
              <p className='text-sm text-muted-foreground'>No se encontraron obras.</p>
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant='link'
                  size='sm'
                  onClick={() => setQuickFilters({})}
                  className='mt-2'
                >
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CommandEmpty>
        )}

        {!hasAnyFilter && (
          <div className='py-8 text-center'>
            <Filter className='mx-auto mb-2 size-8 text-muted-foreground' />
            <p className='text-sm text-muted-foreground'>Busca obras o usa los filtros rápidos</p>
          </div>
        )}

        {isError && <CommandEmpty>Ocurrió un error al buscar.</CommandEmpty>}

        {filteredProducts.length > 0 && !isLoading && (
          <>
            <CommandGroup heading={`${filteredProducts.length} Obras encontradas`}>
              <ScrollArea className='h-[300px]'>
                {filteredProducts.map((product: Product) => (
                  <CommandItem
                    key={product.id}
                    value={product.title}
                    onSelect={() => handleSelect(product.handle)}
                    className='my-1 flex cursor-pointer items-center gap-3 p-3'
                  >
                    <div className='relative size-12 shrink-0 overflow-hidden rounded-md'>
                      <img
                        src={product.images[0]?.url ?? '/placeholder.svg'}
                        alt={product.title}
                        sizes='48px'
                        className='size-full object-cover'
                      />
                    </div>
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <span className='truncate font-medium'>{product.title}</span>
                      <span className='text-xs text-muted-foreground'>{product.vendor}</span>
                      <span className='text-xs font-semibold text-primary'>
                        $
                        {Number(product.priceRange.minVariantPrice.amount).toLocaleString('es-MX', {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}{' '}
                        {product.priceRange.minVariantPrice.currencyCode}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </ScrollArea>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                value='ver-todos-los-resultados'
                onSelect={handleSeeMore}
                className='flex cursor-pointer items-center justify-center gap-2 py-3 text-primary'
              >
                <SearchIcon className='size-4' />
                <span className='font-medium'>
                  Ver todos los resultados para "
                  {debouncedQuery || Object.values(quickFilters).filter(Boolean).join(', ')}"
                </span>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
