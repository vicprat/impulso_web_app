'use client'

import {
  CalendarDays,
  ChevronDown,
  DollarSign,
  Filter as FilterIcon,
  MapPin,
  Package,
  Palette,
  Square,
  Tag,
  User,
  X,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFilterOptions } from '@/modules/shopify/hooks'

interface State {
  productTypes: string[]
  vendors: string[]
  tags: string[]
  priceRange: {
    min: string
    max: string
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const defaultFilters: State = {
  priceRange: { max: '', min: '' },
  productTypes: [],
  sortBy: 'TITLE',
  sortOrder: 'asc',
  tags: [],
  vendors: [],
}

const sortOptions = [
  { value: 'TITLE', label: 'Título' },
  { value: 'PRICE', label: 'Precio' },
  { value: 'CREATED_AT', label: 'Fecha de creación' },
  { value: 'VENDOR', label: 'Artista' },
] as const

const FilterSkeleton = () => (
  <div className='space-y-4'>
    {[ ...Array(5) ].map((_, i) => (
      <Card key={i} className='animate-pulse'>
        <CardContent className='p-4'>
          <div className='mb-3 h-4 w-24 rounded bg-muted'></div>
          <div className='space-y-2'>
            {[ ...Array(3) ].map((_, j) => (
              <div key={j} className='h-8 rounded bg-muted/50'></div>
            ))}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

interface FilterProps {
  isOpen: boolean
  onClose: () => void
}

export const Filter = ({ isOpen, onClose }: FilterProps) => {
  const [ filters, setFilters ] = useState(defaultFilters)
  const [ openSections, setOpenSections ] = useState<string[]>([ 'vendors', 'price', 'sorting' ])
  const [ searchTerms, setSearchTerms ] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: filterOptions, isLoading: isLoadingFilters } = useFilterOptions()

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [ ...prev, section ]
    )
  }

  const handleOptionToggle = (
    key: 'productTypes' | 'vendors' | 'tags',
    value: string
  ) => {
    const currentValues = filters[ key ]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [ ...currentValues, value ]
    setFilters((prev) => ({ ...prev, [ key ]: newValues }))
  }

  const removeFilter = (
    key: 'productTypes' | 'vendors' | 'tags',
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [ key ]: prev[ key ].filter((v) => v !== value),
    }))
  }

  const handleFilterChange = <K extends keyof State>(key: K, value: State[ K ]) => {
    setFilters((prev) => ({ ...prev, [ key ]: value }))
  }

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

      // Limpiar parámetros existentes
      ;[
        'product_types',
        'vendor',
        'tags',
        'price_min',
        'price_max',
        'sort',
        'order',
      ].forEach((param) => newSearchParams.delete(param))

    // Aplicar filtros básicos
    if (filters.productTypes.length > 0)
      newSearchParams.set('product_types', filters.productTypes.join(','))
    if (filters.vendors.length > 0) newSearchParams.set('vendor', filters.vendors.join(','))
    if (filters.tags.length > 0) newSearchParams.set('tags', filters.tags.join(','))

    if (filters.priceRange.min) newSearchParams.set('price_min', filters.priceRange.min)
    if (filters.priceRange.max) newSearchParams.set('price_max', filters.priceRange.max)

    // Aplicar sorting
    if (filters.sortBy) newSearchParams.set('sort', filters.sortBy)
    if (filters.sortOrder) newSearchParams.set('order', filters.sortOrder)

    newSearchParams.delete('page')

    const queryString = newSearchParams.toString()
    const newPath = queryString ? `/store/search?${queryString}` : '/store'

    router.push(newPath)
    onClose()
  }

  const vendorOptions = useMemo(
    () => filterOptions?.artists
      .filter(vendor => vendor.label !== 'Evento' && vendor.input !== 'Evento')
      .map((v) => ({ label: v.label, value: v.input })) ?? [],
    [ filterOptions ]
  )

  const productTypeOptions = useMemo(
    () => filterOptions?.productTypes.map((pt) => ({ label: pt.label, value: pt.input })) ?? [],
    [ filterOptions ]
  )

  const techniqueOptions = useMemo(
    () =>
      filterOptions?.techniques
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [ filterOptions ]
  )
  const formatOptions = useMemo(
    () =>
      filterOptions?.formats
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [ filterOptions ]
  )
  const locationOptions = useMemo(
    () =>
      filterOptions?.locations
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [ filterOptions ]
  )
  const yearOptions = useMemo(
    () =>
      filterOptions?.years
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => b.label.localeCompare(a.label)) ?? [],
    [ filterOptions ]
  )
  const otherTagOptions = useMemo(
    () =>
      filterOptions?.otherTags
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [ filterOptions ]
  )

  const clearFilters = () => {
    setFilters(defaultFilters)
    setSearchTerms({})
    const currentSort = searchParams.get('sort')
    const currentOrder = searchParams.get('order')

    let newPath = '/store'
    if (currentSort || currentOrder) {
      const sortParams = new URLSearchParams()
      if (currentSort) sortParams.set('sort', currentSort)
      if (currentOrder) sortParams.set('order', currentOrder)
      newPath = `/store/search?${sortParams.toString()}`
    }

    router.push(newPath)
    onClose()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    count += filters.productTypes.length
    count += filters.vendors.length
    count += filters.tags.length
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.sortBy !== 'TITLE' || filters.sortOrder !== 'asc') count++
    return count
  }

  const filtersOptions = (options: { value: string; label: string }[], searchTerm: string) => {
    if (!searchTerm) return options
    return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  useEffect(() => {
    const productTypes = searchParams.get('product_types')?.split(',').filter(Boolean) ?? []
    const vendors = searchParams.get('vendor')?.split(',').filter(Boolean) ?? []
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) ?? []
    const priceMin = searchParams.get('price_min') ?? ''
    const priceMax = searchParams.get('price_max') ?? ''
    const sortBy = searchParams.get('sort') as State[ 'sortBy' ] || 'TITLE'
    const sortOrder = searchParams.get('order') as State[ 'sortOrder' ] || 'asc'

    setFilters({
      priceRange: { max: priceMax, min: priceMin },
      productTypes,
      sortBy,
      sortOrder,
      tags,
      vendors,
    })
  }, [ searchParams ])

  const FilterSection = ({
    filterKey,
    icon: Icon,
    options,
    sectionKey,
    selectedValues,
    showSearch = false,
    title,
  }: {
    title: string
    icon: React.ElementType
    sectionKey: string
    options: { value: string; label: string }[]
    selectedValues: string[]
    filterKey: 'productTypes' | 'vendors' | 'tags'
    showSearch?: boolean
  }) => {
    const searchTerm = searchTerms[ sectionKey ] || ''
    const filteredOptions = filtersOptions(options, searchTerm)

    if (options.length === 0) return null

    return (
      <Card className='border shadow-sm'>
        <div
          onClick={() => toggleSection(sectionKey)}
          className='flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50'
        >
          <div className='flex items-center space-x-3'>
            <div className='rounded-lg bg-muted p-2'>
              <Icon className='size-4' />
            </div>
            <div>
              <h3 className='font-medium'>{title}</h3>
              {selectedValues.length > 0 && (
                <p className='text-sm text-muted-foreground'>{selectedValues.length} seleccionado(s)</p>
              )}
            </div>
          </div>
          <ChevronDown
            className={`size-5 text-muted-foreground transition-transform ${openSections.includes(sectionKey) ? 'rotate-180' : ''
              }`}
          />
        </div>

        {openSections.includes(sectionKey) && (
          <div className='border-t p-4'>
            {showSearch && (
              <div className='relative mb-4'>
                <Input
                  placeholder={`Buscar ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({ ...prev, [ sectionKey ]: e.target.value }))
                  }
                  className='h-9'
                />
              </div>
            )}

            {selectedValues.length > 0 && (
              <div className='mb-4 flex flex-wrap gap-2'>
                {selectedValues.map((value) => {
                  const option = options.find((opt) => opt.value === value)
                  return (
                    <Badge
                      key={value}
                      variant='secondary'
                      className='pl-3 pr-1'
                    >
                      {option?.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFilter(filterKey, value)
                        }}
                        className='ml-2 rounded-full p-0.5 hover:bg-muted'
                      >
                        <X className='size-3' />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            <ScrollArea className='h-48'>
              <div className='space-y-1 pr-2'>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionToggle(filterKey, option.value)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 text-sm transition-colors ${selectedValues.includes(option.value)
                      ? 'border bg-muted font-medium'
                      : 'border border-transparent hover:bg-muted/50'
                      }`}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredOptions.length === 0 && (
              <p className='py-4 text-center text-sm text-muted-foreground'>No se encontraron opciones</p>
            )}
          </div>
        )}
      </Card>
    )
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay para cerrar el sidebar */}
      <div
        className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Sidebar con layout mejorado */}
      <div className='fixed left-0 top-0 z-50 flex h-screen w-[28rem] flex-col bg-background shadow-2xl'>
        {/* Header del sidebar - fijo */}
        <div className='flex-shrink-0 border-b px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <div className='rounded-lg bg-muted p-2'>
                <FilterIcon className='size-5' />
              </div>
              <div>
                <h3 className='text-lg font-semibold'>Filtros</h3>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant='default' className='ml-2 rounded-full px-2.5 py-0.5'>
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='h-8 w-8 p-0'
            >
              <X className='size-4' />
            </Button>
          </div>
          <p className='mt-1 text-sm text-muted-foreground'>
            Filtra y ordena los productos según tus preferencias
          </p>
        </div>

        {/* Contenido scrolleable del sidebar */}
        <div className='flex-1 overflow-y-auto px-6 py-4'>
          {isLoadingFilters ? (
            <FilterSkeleton />
          ) : (
            <div className='space-y-4'>
              {/* Sorting */}
              <Card className='border shadow-sm'>
                <div
                  onClick={() => toggleSection('sorting')}
                  className='flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='rounded-lg bg-muted p-2'>
                      <Package className='size-4' />
                    </div>
                    <div>
                      <h3 className='font-medium'>Ordenar por</h3>
                      <p className='text-sm text-muted-foreground'>
                        {sortOptions.find(s => s.value === filters.sortBy)?.label} ({filters.sortOrder === 'asc' ? 'Ascendente' : 'Descendente'})
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform ${openSections.includes('sorting') ? 'rotate-180' : ''
                      }`}
                  />
                </div>
                {openSections.includes('sorting') && (
                  <div className='border-t p-4'>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Campo</Label>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {sortOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-2'>
                        <Label className='text-sm font-medium'>Orden</Label>
                        <RadioGroup
                          value={filters.sortOrder}
                          onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                          className='space-y-2'
                        >
                          <div className='flex items-center space-x-3 rounded-lg p-2 hover:bg-muted/50'>
                            <RadioGroupItem value='asc' id='sort-asc' />
                            <Label htmlFor='sort-asc' className='flex-1 cursor-pointer text-sm'>
                              Ascendente
                            </Label>
                          </div>
                          <div className='flex items-center space-x-3 rounded-lg p-2 hover:bg-muted/50'>
                            <RadioGroupItem value='desc' id='sort-desc' />
                            <Label htmlFor='sort-desc' className='flex-1 cursor-pointer text-sm'>
                              Descendente
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <FilterSection
                title='Artistas'
                icon={User}
                sectionKey='vendors'
                options={vendorOptions}
                selectedValues={filters.vendors}
                filterKey='vendors'
                showSearch={vendorOptions.length > 5}
              />
              <FilterSection
                title='Tipo de Obra'
                icon={Package}
                sectionKey='productTypes'
                options={productTypeOptions}
                selectedValues={filters.productTypes}
                filterKey='productTypes'
                showSearch={productTypeOptions.length > 5}
              />

              <FilterSection
                title='Técnicas'
                icon={Palette}
                sectionKey='techniques'
                options={techniqueOptions}
                selectedValues={filters.tags}
                filterKey='tags'
                showSearch
              />
              <FilterSection
                title='Formatos'
                icon={Square}
                sectionKey='formats'
                options={formatOptions}
                selectedValues={filters.tags}
                filterKey='tags'
                showSearch
              />
              <FilterSection
                title='Año'
                icon={CalendarDays}
                sectionKey='years'
                options={yearOptions}
                selectedValues={filters.tags}
                filterKey='tags'
                showSearch
              />
              <FilterSection
                title='Ubicaciones'
                icon={MapPin}
                sectionKey='locations'
                options={locationOptions}
                selectedValues={filters.tags}
                filterKey='tags'
                showSearch
              />
              <FilterSection
                title='Otros Tags'
                icon={Tag}
                sectionKey='otherTags'
                options={otherTagOptions}
                selectedValues={filters.tags}
                filterKey='tags'
                showSearch
              />

              {/* Rango de precio */}
              <Card className='border shadow-sm'>
                <div
                  onClick={() => toggleSection('price')}
                  className='flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-muted/50'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='rounded-lg bg-muted p-2'>
                      <DollarSign className='size-4' />
                    </div>
                    <div>
                      <h3 className='font-medium'>Rango de precio</h3>
                      {(filters.priceRange.min || filters.priceRange.max) && (
                        <p className='text-sm text-muted-foreground'>
                          ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-muted-foreground transition-transform ${openSections.includes('price') ? 'rotate-180' : ''
                      }`}
                  />
                </div>
                {openSections.includes('price') && (
                  <div className='border-t p-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <Label htmlFor='price-min' className='text-sm font-medium'>
                          Mínimo
                        </Label>
                        <Input
                          id='price-min'
                          type='number'
                          placeholder='$0'
                          value={filters.priceRange.min}
                          onChange={(e) =>
                            handleFilterChange('priceRange', {
                              ...filters.priceRange,
                              min: e.target.value,
                            })
                          }
                          className='h-10'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='price-max' className='text-sm font-medium'>
                          Máximo
                        </Label>
                        <Input
                          id='price-max'
                          type='number'
                          placeholder='$9999'
                          value={filters.priceRange.max}
                          onChange={(e) =>
                            handleFilterChange('priceRange', {
                              ...filters.priceRange,
                              max: e.target.value,
                            })
                          }
                          className='h-10'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>


            </div>
          )}
        </div>

        {/* Footer del sidebar - fijo y siempre visible */}
        <div className='flex-shrink-0 border-t bg-background px-6 py-4'>
          <div className='space-y-3'>
            <Button
              onClick={applyFilters}
              className='h-11 w-full rounded-lg font-medium'
            >
              Aplicar filtros
            </Button>
            <Button
              onClick={clearFilters}
              variant='outline'
              className='h-11 w-full rounded-lg font-medium'
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}