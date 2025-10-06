'use client'

import {
  CalendarDays,
  ChevronDown,
  DollarSign,
  Filter as FilterIcon,
  Package,
  Palette,
  Ruler,
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
  techniques: string[]
  formats: string[]
  years: string[]
  dimensions: string[]
  priceRange: {
    min: string
    max: string
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

const defaultFilters: State = {
  dimensions: [],
  formats: [],
  priceRange: { max: '', min: '' },
  productTypes: [],
  sortBy: 'TITLE',
  sortOrder: 'asc',
  tags: [],
  techniques: [],
  vendors: [],
  years: [],
}

const sortOptions = [
  { label: 'Título', value: 'TITLE' },
  { label: 'Precio', value: 'PRICE' },
  { label: 'Fecha de creación', value: 'CREATED_AT' },
  { label: 'Fecha de actualización', value: 'UPDATED_AT' },
  { label: 'Artista', value: 'VENDOR' },
] as const

const FilterSkeleton = () => (
  <div className='space-y-4'>
    {[...Array(5)].map((_, i) => (
      <Card key={i} className='animate-pulse'>
        <CardContent className='p-4'>
          <div className='mb-3 h-4 w-24 rounded bg-muted'></div>
          <div className='space-y-2'>
            {[...Array(3)].map((_, j) => (
              <div key={j} className='bg-muted/50 h-8 rounded'></div>
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
  const [filters, setFilters] = useState(defaultFilters)
  const [openSections, setOpenSections] = useState<string[]>(['vendors', 'price', 'sorting'])
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: filterOptions, isLoading: isLoadingFilters } = useFilterOptions()

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  const handleOptionToggle = (
    key: 'productTypes' | 'vendors' | 'tags' | 'techniques' | 'formats' | 'years' | 'dimensions',
    value: string
  ) => {
    const currentValues = filters[key]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    setFilters((prev) => ({ ...prev, [key]: newValues }))
  }

  const removeFilter = (
    key: 'productTypes' | 'vendors' | 'tags' | 'techniques' | 'formats' | 'years' | 'dimensions',
    value: string
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].filter((v) => v !== value),
    }))
  }

  const handleFilterChange = <K extends keyof State>(key: K, value: State[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())

    // Limpiar parámetros existentes
    ;[
      'product_types',
      'vendor',
      'tags',
      'techniques',
      'formats',
      'years',
      'dimensions',
      'price_min',
      'price_max',
      'sort',
      'order',
    ].forEach((param) => newSearchParams.delete(param))

    // Aplicar filtros
    if (filters.productTypes.length > 0)
      newSearchParams.set('product_types', filters.productTypes.join(','))
    if (filters.vendors.length > 0) newSearchParams.set('vendor', filters.vendors.join(','))
    if (filters.tags.length > 0) newSearchParams.set('tags', filters.tags.join(','))
    if (filters.techniques.length > 0)
      newSearchParams.set('techniques', filters.techniques.join(','))
    if (filters.formats.length > 0) newSearchParams.set('formats', filters.formats.join(','))
    if (filters.years.length > 0) newSearchParams.set('years', filters.years.join(','))
    if (filters.dimensions.length > 0)
      newSearchParams.set('dimensions', filters.dimensions.join(','))

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
    () =>
      filterOptions?.artists
        .filter((vendor) => vendor.label !== 'Evento' && vendor.input !== 'Evento')
        .map((v) => ({ label: v.label, value: v.input })) ?? [],
    [filterOptions]
  )

  const productTypeOptions = useMemo(
    () => filterOptions?.productTypes.map((pt) => ({ label: pt.label, value: pt.input })) ?? [],
    [filterOptions]
  )

  const techniqueOptions = useMemo(
    () =>
      filterOptions?.techniques
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [filterOptions]
  )
  const formatOptions = useMemo(
    () =>
      filterOptions?.formats
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [filterOptions]
  )
  const dimensionOptions = useMemo(
    () =>
      filterOptions?.dimensions
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [filterOptions]
  )
  const yearOptions = useMemo(
    () =>
      filterOptions?.years
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => b.label.localeCompare(a.label)) ?? [],
    [filterOptions]
  )
  const otherTagOptions = useMemo(
    () =>
      filterOptions?.otherTags
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
    [filterOptions]
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
    count += filters.techniques.length
    count += filters.formats.length
    count += filters.years.length
    count += filters.dimensions.length
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
    const techniques = searchParams.get('techniques')?.split(',').filter(Boolean) ?? []
    const formats = searchParams.get('formats')?.split(',').filter(Boolean) ?? []
    const years = searchParams.get('years')?.split(',').filter(Boolean) ?? []
    const dimensions = searchParams.get('dimensions')?.split(',').filter(Boolean) ?? []
    const priceMin = searchParams.get('price_min') ?? ''
    const priceMax = searchParams.get('price_max') ?? ''
    const sortBy = (searchParams.get('sort') as State['sortBy']) || 'TITLE'
    const sortOrder = (searchParams.get('order') as State['sortOrder']) || 'asc'

    setFilters({
      dimensions,
      formats,
      priceRange: { max: priceMax, min: priceMin },
      productTypes,
      sortBy,
      sortOrder,
      tags,
      techniques,
      vendors,
      years,
    })
  }, [searchParams])

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
    filterKey:
      | 'productTypes'
      | 'vendors'
      | 'tags'
      | 'techniques'
      | 'formats'
      | 'years'
      | 'dimensions'
    showSearch?: boolean
  }) => {
    const searchTerm = searchTerms[sectionKey] || ''
    const filteredOptions = filtersOptions(options, searchTerm)

    if (options.length === 0) return null

    return (
      <Card className='border shadow-sm'>
        <div
          onClick={() => toggleSection(sectionKey)}
          className='hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between p-3 transition-colors sm:p-4'
        >
          <div className='flex items-center space-x-2 sm:space-x-3'>
            <div className='rounded-lg bg-muted p-1.5 sm:p-2'>
              <Icon className='size-3 sm:size-4' />
            </div>
            <div>
              <h3 className='text-sm font-medium sm:text-base'>{title}</h3>
              {selectedValues.length > 0 && (
                <p className='text-xs text-muted-foreground sm:text-sm'>
                  {selectedValues.length} seleccionado(s)
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform sm:size-5 ${
              openSections.includes(sectionKey) ? 'rotate-180' : ''
            }`}
          />
        </div>

        {openSections.includes(sectionKey) && (
          <div className='border-t p-3 sm:p-4'>
            {showSearch && (
              <div className='relative mb-3 sm:mb-4'>
                <Input
                  placeholder={`Buscar ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({ ...prev, [sectionKey]: e.target.value }))
                  }
                  className='h-8 text-sm sm:h-9'
                />
              </div>
            )}

            {selectedValues.length > 0 && (
              <div className='mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2'>
                {selectedValues.map((value) => {
                  const option = options.find((opt) => opt.value === value)
                  return (
                    <Badge key={value} variant='secondary' className='pl-2 pr-1 text-xs sm:pl-3'>
                      {option?.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFilter(filterKey, value)
                        }}
                        className='ml-1 rounded-full p-0.5 hover:bg-muted sm:ml-2'
                      >
                        <X className='size-2.5 sm:size-3' />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            <ScrollArea className='h-40 sm:h-48'>
              <div className='space-y-1 pr-2'>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionToggle(filterKey, option.value)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-xs transition-colors sm:p-3 sm:text-sm ${
                      selectedValues.includes(option.value)
                        ? 'border bg-muted font-medium'
                        : 'hover:bg-muted/50 border border-transparent'
                    }`}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredOptions.length === 0 && (
              <p className='py-4 text-center text-xs text-muted-foreground sm:text-sm'>
                No se encontraron opciones
              </p>
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
      <div className='fixed inset-0 z-40 bg-black/20 backdrop-blur-sm' onClick={onClose} />

      {/* Sidebar con responsive design mejorado */}
      <div
        className='fixed inset-y-0 right-0 z-50 flex w-full max-w-full flex-col 
                      bg-background shadow-2xl sm:left-0 sm:right-auto
                      sm:w-[28rem] sm:max-w-none'
      >
        {/* Header del sidebar - fijo y más prominente en móvil */}
        <div className='shrink-0 border-b bg-background px-4 py-3 sm:px-6 sm:py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 sm:space-x-3'>
              <div className='rounded-lg bg-muted p-1.5 sm:p-2'>
                <FilterIcon className='size-4 sm:size-5' />
              </div>
              <div>
                <h3 className='text-base font-semibold sm:text-lg'>Filtros</h3>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant='default' className='ml-2 rounded-full px-2 py-0.5 text-xs'>
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={onClose}
              className='size-8 p-0 hover:bg-muted sm:size-8'
            >
              <X className='size-4' />
            </Button>
          </div>
          <p className='mt-1 text-xs text-muted-foreground sm:text-sm'>
            Filtra y ordena los productos según tus preferencias
          </p>
        </div>

        {/* Contenido scrolleable del sidebar */}
        <div className='flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4'>
          {isLoadingFilters ? (
            <FilterSkeleton />
          ) : (
            <div className='space-y-3 sm:space-y-4'>
              {/* Sorting */}
              <Card className='border shadow-sm'>
                <div
                  onClick={() => toggleSection('sorting')}
                  className='hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between p-3 transition-colors sm:p-4'
                >
                  <div className='flex items-center space-x-2 sm:space-x-3'>
                    <div className='rounded-lg bg-muted p-1.5 sm:p-2'>
                      <Package className='size-3 sm:size-4' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium sm:text-base'>Ordenar por</h3>
                      <p className='text-xs text-muted-foreground sm:text-sm'>
                        {sortOptions.find((s) => s.value === filters.sortBy)?.label} (
                        {filters.sortOrder === 'asc' ? 'Asc' : 'Desc'})
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform sm:size-5 ${
                      openSections.includes('sorting') ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openSections.includes('sorting') && (
                  <div className='border-t p-3 sm:p-4'>
                    <div className='space-y-3 sm:space-y-4'>
                      <div className='space-y-2'>
                        <Label className='text-xs font-medium sm:text-sm'>Campo</Label>
                        <Select
                          value={filters.sortBy}
                          onValueChange={(value) => handleFilterChange('sortBy', value)}
                        >
                          <SelectTrigger className='h-9 sm:h-10'>
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
                        <Label className='text-xs font-medium sm:text-sm'>Orden</Label>
                        <RadioGroup
                          value={filters.sortOrder}
                          onValueChange={(value) =>
                            handleFilterChange('sortOrder', value as 'asc' | 'desc')
                          }
                          className='space-y-1 sm:space-y-2'
                        >
                          <div className='hover:bg-muted/50 flex items-center space-x-2 rounded-lg p-2 sm:space-x-3'>
                            <RadioGroupItem value='asc' id='sort-asc' />
                            <Label
                              htmlFor='sort-asc'
                              className='flex-1 cursor-pointer text-xs sm:text-sm'
                            >
                              Ascendente
                            </Label>
                          </div>
                          <div className='hover:bg-muted/50 flex items-center space-x-2 rounded-lg p-2 sm:space-x-3'>
                            <RadioGroupItem value='desc' id='sort-desc' />
                            <Label
                              htmlFor='sort-desc'
                              className='flex-1 cursor-pointer text-xs sm:text-sm'
                            >
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
                selectedValues={filters.techniques}
                filterKey='techniques'
                showSearch
              />
              {dimensionOptions.length === 0 && (
                <FilterSection
                  title='Formatos'
                  icon={Square}
                  sectionKey='formats'
                  options={formatOptions}
                  selectedValues={filters.formats}
                  filterKey='formats'
                  showSearch
                />
              )}
              <FilterSection
                title='Año'
                icon={CalendarDays}
                sectionKey='years'
                options={yearOptions}
                selectedValues={filters.years}
                filterKey='years'
                showSearch
              />
              <FilterSection
                title='Dimensiones'
                icon={Ruler}
                sectionKey='dimensions'
                options={dimensionOptions}
                selectedValues={filters.dimensions}
                filterKey='dimensions'
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
                  className='hover:bg-muted/50 flex w-full cursor-pointer items-center justify-between p-3 transition-colors sm:p-4'
                >
                  <div className='flex items-center space-x-2 sm:space-x-3'>
                    <div className='rounded-lg bg-muted p-1.5 sm:p-2'>
                      <DollarSign className='size-3 sm:size-4' />
                    </div>
                    <div>
                      <h3 className='text-sm font-medium sm:text-base'>Rango de precio</h3>
                      {(filters.priceRange.min || filters.priceRange.max) && (
                        <p className='text-xs text-muted-foreground sm:text-sm'>
                          ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-4 text-muted-foreground transition-transform sm:size-5 ${
                      openSections.includes('price') ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openSections.includes('price') && (
                  <div className='border-t p-3 sm:p-4'>
                    <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                      <div className='space-y-2'>
                        <Label htmlFor='price-min' className='text-xs font-medium sm:text-sm'>
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
                          className='h-9 text-sm sm:h-10'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='price-max' className='text-xs font-medium sm:text-sm'>
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
                          className='h-9 text-sm sm:h-10'
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Footer del sidebar - fijo y más visible en móvil */}
        <div
          className='shrink-0 border-t bg-background px-4 py-3 shadow-lg sm:px-6 
                        sm:py-4 sm:shadow-none'
        >
          <div className='space-y-2 sm:space-y-3'>
            <Button
              onClick={applyFilters}
              className='h-10 w-full rounded-lg text-sm font-medium sm:h-11 sm:text-base'
            >
              Aplicar filtros
            </Button>
            <Button
              onClick={clearFilters}
              variant='outline'
              className='h-10 w-full rounded-lg text-sm font-medium sm:h-11 sm:text-base'
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
