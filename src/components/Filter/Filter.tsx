'use client'

import {
  Filter as FilterIcon,
  ChevronDown,
  X,
  Search,
  Palette,
  User,
  Tag,
  Grid3X3,
  DollarSign,
  Package,
  Square,
  MapPin,
  CalendarDays,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCollections, useFilterOptions } from '@/modules/shopify/hooks'

// El estado del filtro se mantiene, los tags inteligentes se consolidarán en `tags`.
interface State {
  collections: string[]
  productTypes: string[]
  vendors: string[]
  tags: string[]
  priceRange: {
    min: string
    max: string
  }
  availability: 'all' | 'available' | 'unavailable'
}

const defaultFilters: State = {
  availability: 'all',
  collections: [],
  priceRange: { max: '', min: '' },
  productTypes: [],
  tags: [],
  vendors: [],
}

const availabilityOptions = [
  { icon: Grid3X3, label: 'Todos los productos', value: 'all' },
  { icon: Package, label: 'Solo disponibles', value: 'available' },
  { icon: X, label: 'Agotados', value: 'unavailable' },
] as const

const FilterSkeleton = () => (
  <div className='space-y-4'>
    {[...Array(5)].map((_, i) => (
      <Card key={i} className='animate-pulse'>
        <CardContent className='p-4'>
          <div className='mb-3 h-4 w-24 rounded bg-gray-200'></div>
          <div className='space-y-2'>
            {[...Array(3)].map((_, j) => (
              <div key={j} className='h-8 rounded bg-gray-100'></div>
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
  const [openSections, setOpenSections] = useState<string[]>(['collections', 'price'])
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({})
  const router = useRouter()
  const searchParams = useSearchParams()

  const { data: collectionsData } = useCollections()
  const { data: filterOptions, isLoading: isLoadingFilters } = useFilterOptions()

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  const handleOptionToggle = (
    key: 'collections' | 'productTypes' | 'vendors' | 'tags',
    value: string
  ) => {
    const currentValues = filters[key]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    setFilters((prev) => ({ ...prev, [key]: newValues }))
  }

  const removeFilter = (
    key: 'collections' | 'productTypes' | 'vendors' | 'tags',
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

    ;[
      'collections',
      'product_types',
      'vendor',
      'tags',
      'price_min',
      'price_max',
      'availability',
    ].forEach((param) => newSearchParams.delete(param))

    if (filters.collections.length > 0)
      newSearchParams.set('collections', filters.collections.join(','))
    if (filters.productTypes.length > 0)
      newSearchParams.set('product_types', filters.productTypes.join(','))
    if (filters.vendors.length > 0) newSearchParams.set('vendor', filters.vendors.join(','))
    if (filters.tags.length > 0) newSearchParams.set('tags', filters.tags.join(','))

    if (filters.priceRange.min) newSearchParams.set('price_min', filters.priceRange.min)
    if (filters.priceRange.max) newSearchParams.set('price_max', filters.priceRange.max)
    if (filters.availability !== 'all') newSearchParams.set('availability', filters.availability)

    newSearchParams.delete('page')

    const queryString = newSearchParams.toString()
    const newPath = queryString ? `/store/search?${queryString}` : '/store'

    router.push(newPath)
    onClose()
  }

  const collectionOptions = useMemo(
    () => collectionsData?.collections.map((c) => ({ label: c.title, value: c.handle })) || [],
    [collectionsData]
  )

  const artistOptions = useMemo(
    () => filterOptions?.artists.map((v) => ({ label: v.label, value: v.input })) || [],
    [filterOptions]
  )

  const productTypeOptions = useMemo(
    () => filterOptions?.productTypes.map((pt) => ({ label: pt.label, value: pt.input })) || [],
    [filterOptions]
  )

  // --> CORREGIDO: Se mapea la propiedad `input` a `value` para que coincida con el tipo esperado por FilterSection.
  const techniqueOptions = useMemo(
    () =>
      filterOptions?.techniques
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) || [],
    [filterOptions]
  )
  const formatOptions = useMemo(
    () =>
      filterOptions?.formats
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) || [],
    [filterOptions]
  )
  const locationOptions = useMemo(
    () =>
      filterOptions?.locations
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) || [],
    [filterOptions]
  )
  const yearOptions = useMemo(
    () =>
      filterOptions?.years
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => b.label.localeCompare(a.label)) || [],
    [filterOptions]
  )
  const otherTagOptions = useMemo(
    () =>
      filterOptions?.otherTags
        .map((o) => ({ label: o.label, value: o.input }))
        .sort((a, b) => a.label.localeCompare(b.label)) || [],
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
    count += filters.collections.length
    count += filters.productTypes.length
    count += filters.vendors.length
    count += filters.tags.length
    if (filters.priceRange.min || filters.priceRange.max) count++
    if (filters.availability !== 'all') count++
    return count
  }

  const filtersOptions = (options: { value: string; label: string }[], searchTerm: string) => {
    if (!searchTerm) return options
    return options.filter((option) => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  useEffect(() => {
    const collections = searchParams.get('collections')?.split(',').filter(Boolean) || []
    const productTypes = searchParams.get('product_types')?.split(',').filter(Boolean) || []
    const vendors = searchParams.get('vendor')?.split(',').filter(Boolean) || []
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const priceMin = searchParams.get('price_min') || ''
    const priceMax = searchParams.get('price_max') || ''
    const availability = (searchParams.get('availability') as State['availability']) || 'all'

    setFilters({
      availability,
      collections,
      priceRange: { max: priceMax, min: priceMin },
      productTypes,
      tags,
      vendors,
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
    filterKey: 'collections' | 'productTypes' | 'vendors' | 'tags'
    showSearch?: boolean
  }) => {
    const searchTerm = searchTerms[sectionKey] || ''
    const filteredOptions = filtersOptions(options, searchTerm)

    if (options.length === 0) return null

    return (
      <Card className='border shadow-sm'>
        <div
          onClick={() => toggleSection(sectionKey)}
          className='hover flex w-full cursor-pointer items-center justify-between p-4 transition-colors'
        >
          <div className='flex items-center space-x-3'>
            <div className='rounded-lg bg-blue-100 p-2'>
              <Icon className='size-4 text-blue-600' />
            </div>
            <div>
              <h3 className='font-medium'>{title}</h3>
              {selectedValues.length > 0 && (
                <p className='text-sm text-gray-500'>{selectedValues.length} seleccionado(s)</p>
              )}
            </div>
          </div>
          <ChevronDown
            className={`size-5 text-gray-400 transition-transform ${
              openSections.includes(sectionKey) ? 'rotate-180' : ''
            }`}
          />
        </div>

        {openSections.includes(sectionKey) && (
          <div className='border-t p-4'>
            {showSearch && (
              <div className='relative mb-4'>
                <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
                <Input
                  placeholder={`Buscar ${title.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerms((prev) => ({ ...prev, [sectionKey]: e.target.value }))
                  }
                  className='h-9 pl-10'
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
                      className='bg-blue-100 pl-3 pr-1 text-blue-800 hover:bg-blue-200'
                    >
                      {option?.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFilter(filterKey, value)
                        }}
                        className='ml-2 rounded-full p-0.5 hover:bg-blue-300'
                      >
                        <X className='size-3' />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            )}

            <ScrollArea className='h-40'>
              <div className='space-y-1 pr-2'>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleOptionToggle(filterKey, option.value)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg p-3 text-sm transition-colors ${
                      selectedValues.includes(option.value)
                        ? 'border border-blue-200 bg-blue-50 font-medium'
                        : 'border border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <span>{option.label}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {filteredOptions.length === 0 && (
              <p className='py-4 text-center text-sm text-gray-500'>No se encontraron opciones</p>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className='z-50 flex h-[90vh] max-w-lg flex-col p-0'
        onClick={(e) => e.stopPropagation()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className='shrink-0 border-b px-6 py-4'>
          <DialogTitle className='flex items-center justify-between text-xl font-semibold'>
            <div className='flex items-center'>
              <div className='mr-3 rounded-lg bg-blue-100 p-2'>
                <FilterIcon className='size-5 text-blue-600' />
              </div>
              <span>Filtros</span>
              {getActiveFiltersCount() > 0 && (
                <Badge
                  variant='secondary'
                  className='ml-3 rounded-full bg-blue-600 px-2.5 py-0.5 text-white'
                >
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>
          </DialogTitle>
          <DialogDescription className='mt-1 text-gray-600'>
            Personaliza tu búsqueda con filtros avanzados
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto p-6'>
          {isLoadingFilters ? (
            <FilterSkeleton />
          ) : (
            <div className='space-y-4'>
              <FilterSection
                title='Colecciones'
                icon={Grid3X3}
                sectionKey='collections'
                options={collectionOptions}
                selectedValues={filters.collections}
                filterKey='collections'
                showSearch={collectionOptions.length > 5}
              />
              <FilterSection
                title='Artistas'
                icon={User}
                sectionKey='artists'
                options={artistOptions}
                selectedValues={filters.vendors}
                filterKey='vendors'
                showSearch={artistOptions.length > 5}
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

              {/* Secciones de Tags Inteligentes - todas escriben en `filters.tags` */}
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

              <Card className='border shadow-sm'>
                <div
                  onClick={() => toggleSection('price')}
                  className='hover flex w-full cursor-pointer items-center justify-between p-4 transition-colors'
                >
                  <div className='flex items-center space-x-3'>
                    <div className='rounded-lg bg-green-100 p-2'>
                      <DollarSign className='size-4 text-green-600' />
                    </div>
                    <div>
                      <h3 className='font-medium'>Rango de precio</h3>
                      {(filters.priceRange.min || filters.priceRange.max) && (
                        <p className='text-sm text-gray-500'>
                          ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronDown
                    className={`size-5 text-gray-400 transition-transform ${openSections.includes('price') ? 'rotate-180' : ''}`}
                  />
                </div>
                {openSections.includes('price') && (
                  <div className='border-t p-4'>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='space-y-2'>
                        <Label htmlFor='price-min' className='text-sm font-medium text-gray-700'>
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
                        <Label htmlFor='price-max' className='text-sm font-medium text-gray-700'>
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

              <Card className='border shadow-sm'>
                <div className='p-4'>
                  <div className='mb-4 flex items-center space-x-3'>
                    <div className='rounded-lg bg-purple-100 p-2'>
                      <Package className='size-4 text-purple-600' />
                    </div>
                    <h3 className='font-medium'>Disponibilidad</h3>
                  </div>
                  <RadioGroup
                    value={filters.availability}
                    onValueChange={(value) =>
                      handleFilterChange('availability', value as State['availability'])
                    }
                    className='space-y-2'
                  >
                    {availabilityOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <div
                          key={option.value}
                          className='flex items-center space-x-3 rounded-lg p-2 hover:bg-gray-50'
                        >
                          <RadioGroupItem
                            value={option.value}
                            id={`availability-${option.value}`}
                            className='text-blue-600'
                          />
                          <IconComponent className='size-4 text-gray-500' />
                          <Label
                            htmlFor={`availability-${option.value}`}
                            className='flex-1 cursor-pointer text-sm text-gray-700'
                          >
                            {option.label}
                          </Label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className='shrink-0 border-t p-6'>
          <div className='space-y-3'>
            <Button
              onClick={applyFilters}
              className='h-11 w-full rounded-lg bg-blue-600 font-medium text-white transition-colors hover:bg-blue-700'
            >
              Aplicar filtros
            </Button>
            <Button
              onClick={clearFilters}
              variant='outline'
              className='h-11 w-full rounded-lg border-gray-300 font-medium text-gray-700 transition-colors hover:bg-gray-100'
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
