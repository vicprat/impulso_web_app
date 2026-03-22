'use client'

import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, Filter, Search as SearchIcon, X } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Table } from '@/components/Table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDimensionsWithUnit } from '@/helpers/dimensions'
import { useDebounce } from '@/hooks/use-debounce'
import {
  useGetArtworkTypes,
  useGetProductsPaginated,
  useGetTechniques,
  useGetVendors,
} from '@/services/product/hook'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

import type { Product } from '@/models/Product'

const PAGE_SIZE = 50

export interface ProductSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedProductIds: string[], selectedProducts?: Product[]) => void
  title?: string
  description?: string
  confirmButtonText?: string
  initialSelectedIds?: string[]
  mode?: 'single' | 'multi'
  returnFullProducts?: boolean
}

interface ProductRow {
  id: string
  title: string
  vendor: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  image: string | null
  imageAlt: string | null
  productType: string
  medium: string
  year: string
  dimensions: string
  location: string
  collections: { id: string; title: string }[]
  price: string
  product: Product
}

const SortableHeader = ({
  column,
  label,
  onSort,
  sortConfig,
}: {
  column: string
  label: string
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null
  onSort?: (key: string) => void
}) => {
  const isSorted = sortConfig?.key === column
  return (
    <Button
      variant='ghost'
      className={`h-auto p-0 font-semibold ${isSorted ? 'text-primary' : ''}`}
      onClick={() => onSort?.(column)}
    >
      {label}
      <ArrowUpDown className='ml-2 size-4' />
      {isSorted && (
        <Badge variant='outline' className='ml-1 text-[10px]'>
          {sortConfig?.direction === 'asc' ? 'ASC' : 'DESC'}
        </Badge>
      )}
    </Button>
  )
}

const sortMapping: Record<string, string> = {
  collections: 'collections',
  dimensions: 'dimensions',
  location: 'location',
  medium: 'medium',
  price: 'price',
  productType: 'productType',
  status: 'status',
  title: 'title',
  vendor: 'vendor',
  year: 'year',
}

export function ProductSelectionModal({
  confirmButtonText = 'Confirmar',
  description = 'Busca y selecciona productos de tu inventario',
  initialSelectedIds = [],
  isOpen,
  onClose,
  onConfirm,
  returnFullProducts = false,
  title = 'Seleccionar Productos',
}: ProductSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null
  )
  const [columnVisibility] = useState<VisibilityState>({})
  const [vendorFilter, setVendorFilter] = useState('all')
  const [techniqueFilter, setTechniqueFilter] = useState('all')
  const [artworkTypeFilter, setArtworkTypeFilter] = useState('all')
  const [dimensionsFilter, setDimensionsFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [currentPage, setCurrentPage] = useState(1)
  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [selectedProducts, setSelectedProducts] = useState<Map<string, Product>>(new Map())
  const [showSelectedAccordion, setShowSelectedAccordion] = useState(false)

  const isInitializedRef = useRef(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const { data: vendors = [] } = useGetVendors()
  const { data: techniques = [] } = useGetTechniques()
  const { data: artworkTypes = [] } = useGetArtworkTypes()

  const sortBy = sortConfig ? sortMapping[sortConfig.key] || 'title' : undefined
  const sortOrder = sortConfig?.direction

  const cursor = currentPage === 1 ? undefined : (historyCursors[currentPage] ?? undefined)

  const {
    data: productsData,
    error,
    isFetching,
    isLoading,
  } = useGetProductsPaginated({
    artworkType: artworkTypeFilter !== 'all' ? artworkTypeFilter : undefined,
    cursor,
    dimensions: dimensionsFilter !== 'all' ? dimensionsFilter : undefined,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
    sortBy,
    sortOrder,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    technique: techniqueFilter !== 'all' ? techniqueFilter : undefined,
    vendor: vendorFilter !== 'all' ? vendorFilter : undefined,
  })

  useEffect(() => {
    if (isOpen && !isInitializedRef.current) {
      isInitializedRef.current = true
      setSelectedProductIds(new Set(initialSelectedIds))
      setSelectedProducts(new Map())
      setSearchTerm('')
      setVendorFilter('all')
      setTechniqueFilter('all')
      setArtworkTypeFilter('all')
      setDimensionsFilter('all')
      setStatusFilter('all')
      setSortConfig(null)
      setCurrentPage(1)
      setHistoryCursors({})
      setPagination({ pageIndex: 0, pageSize: PAGE_SIZE })
    } else if (!isOpen) {
      isInitializedRef.current = false
    }
  }, [isOpen, initialSelectedIds])

  useEffect(() => {
    setCurrentPage(1)
    setHistoryCursors({})
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [
    debouncedSearchTerm,
    vendorFilter,
    techniqueFilter,
    artworkTypeFilter,
    dimensionsFilter,
    statusFilter,
    sortConfig,
  ])

  useEffect(() => {
    if (productsData?.pageInfo?.endCursor) {
      setHistoryCursors((prev) => ({
        ...prev,
        [currentPage + 1]: productsData.pageInfo?.endCursor ?? null,
      }))
    }
  }, [productsData?.pageInfo, currentPage])

  useEffect(() => {
    if (productsData?.products) {
      setSelectedProducts((prev) => {
        const newMap = new Map(prev)
        let changed = false

        productsData.products.forEach((product) => {
          if (selectedProductIds.has(product.id) && !newMap.has(product.id)) {
            newMap.set(product.id, product)
            changed = true
          }
        })

        return changed ? newMap : prev
      })
    }
  }, [productsData?.products, selectedProductIds])

  const handleSorting = useCallback((columnId: string) => {
    setSortConfig((prev) => {
      if (prev?.key === columnId) {
        if (prev.direction === 'asc') {
          return { direction: 'desc', key: columnId }
        }
        return null
      }
      return { direction: 'asc', key: columnId }
    })
  }, [])

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1) return

      const needsFetch = page > currentPage && !historyCursors[page]

      if (needsFetch && productsData?.pageInfo?.hasNextPage && productsData.pageInfo.endCursor) {
        setHistoryCursors((prev) => ({
          ...prev,
          [page]: productsData.pageInfo?.endCursor ?? null,
        }))
      }

      setCurrentPage(page)
      setPagination((prev) => ({ ...prev, pageIndex: page - 1 }))
    },
    [currentPage, historyCursors, productsData]
  )

  const handlePageSizeChange = useCallback((size: number) => {
    setCurrentPage(1)
    setHistoryCursors({})
    setPagination({ pageIndex: 0, pageSize: size })
  }, [])

  const handleProductToggle = useCallback((productId: string, product?: Product) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })

    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      if (newMap.has(productId)) {
        newMap.delete(productId)
      } else if (product) {
        newMap.set(productId, product)
      }
      return newMap
    })
  }, [])

  const handleConfirm = useCallback(() => {
    const selectedProductsList = returnFullProducts
      ? Array.from(selectedProducts.values())
      : undefined
    onConfirm(Array.from(selectedProductIds), selectedProductsList)
    onClose()
  }, [selectedProductIds, selectedProducts, onConfirm, onClose, returnFullProducts])

  const handleDeselectAll = useCallback(() => {
    setSelectedProductIds(new Set())
    setSelectedProducts(new Map())
  }, [])

  const handleDeselectProduct = useCallback((productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      newSet.delete(productId)
      return newSet
    })
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      newMap.delete(productId)
      return newMap
    })
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setSearchTerm('')
    setVendorFilter('all')
    setTechniqueFilter('all')
    setArtworkTypeFilter('all')
    setDimensionsFilter('all')
    setStatusFilter('all')
    setSortConfig(null)
  }, [])

  const tableData: ProductRow[] = useMemo(() => {
    if (!productsData?.products) return []

    return productsData.products.map((product) => {
      const details = product.artworkDetails
      const variant = product.variants[0]
      return {
        collections: product.collections || [],
        dimensions:
          formatDimensionsWithUnit(
            details?.height ?? undefined,
            details?.width ?? undefined,
            details?.depth ?? undefined
          ) ?? '-',
        id: product.id,
        image: product.images?.[0]?.url ?? null,
        imageAlt: product.images?.[0]?.altText ?? product.title,
        location: details?.location ?? '-',
        medium: details?.medium ?? '-',
        price: variant?.price?.amount ?? '0',
        product,
        productType: product.productType || '-',
        status: product.status,
        title: product.title,
        vendor: product.vendor,
        year: details?.year ?? '-',
      }
    })
  }, [productsData])

  const handleSelectAllVisible = useCallback(() => {
    const visibleIds = tableData.map((row) => row.id)
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      visibleIds.forEach((id) => newSet.add(id))
      return newSet
    })
    setSelectedProducts((prev) => {
      const newMap = new Map(prev)
      tableData.forEach((row) => {
        newMap.set(row.id, row.product)
      })
      return newMap
    })
  }, [tableData])

  const columns: ColumnDef<ProductRow>[] = useMemo(
    () => [
      {
        cell: ({ row }) => (
          <div className='flex items-center justify-center'>
            <input
              type='checkbox'
              checked={selectedProductIds.has(row.original.id)}
              onChange={() => handleProductToggle(row.original.id, row.original.product)}
              className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
            />
          </div>
        ),
        header: ({ table }) => {
          const allRows = table.getRowModel().rows
          const selectedCount = selectedProductIds.size
          const isAllSelected = allRows.length > 0 && selectedCount >= allRows.length
          const isIndeterminate = selectedCount > 0 && selectedCount < allRows.length

          return (
            <div className='flex items-center justify-center'>
              <input
                type='checkbox'
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate
                }}
                onChange={(e) => {
                  if (e.target.checked) {
                    handleSelectAllVisible()
                  } else {
                    handleDeselectAll()
                  }
                }}
                className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
              />
            </div>
          )
        },
        id: 'select',
        size: 40,
      },
      {
        accessorKey: 'image',
        cell: ({ row }) => (
          <div className='relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'>
            {row.original.image ? (
              <img
                src={row.original.image}
                alt={row.original.imageAlt ?? ''}
                className='size-full object-cover'
              />
            ) : (
              <div className='flex size-full items-center justify-center'>
                <span className='text-xs text-muted-foreground'>Sin imagen</span>
              </div>
            )}
          </div>
        ),
        header: 'Imagen',
        size: 80,
      },
      {
        accessorKey: 'title',
        cell: ({ row }) => <span className='font-medium'>{row.original.title}</span>,
        header: () => (
          <SortableHeader
            column='title'
            label='Título'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 250,
      },
      {
        accessorKey: 'vendor',
        cell: ({ row }) => <span className='text-muted-foreground'>{row.original.vendor}</span>,
        header: () => (
          <SortableHeader
            column='vendor'
            label='Artista'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 150,
      },
      {
        accessorKey: 'status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {row.original.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
          </Badge>
        ),
        header: () => (
          <SortableHeader
            column='status'
            label='Estado'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 100,
      },
      {
        accessorKey: 'productType',
        cell: ({ row }) => (
          <span className='text-muted-foreground'>{row.original.productType}</span>
        ),
        header: () => (
          <SortableHeader
            column='productType'
            label='Tipo'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 120,
      },
      {
        accessorKey: 'medium',
        cell: ({ row }) => <span className='text-muted-foreground'>{row.original.medium}</span>,
        header: () => (
          <SortableHeader
            column='medium'
            label='Técnica'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 120,
      },
      {
        accessorKey: 'year',
        cell: ({ row }) => <span className='text-muted-foreground'>{row.original.year}</span>,
        header: () => (
          <SortableHeader
            column='year'
            label='Año'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 80,
      },
      {
        accessorKey: 'dimensions',
        cell: ({ row }) => <span className='text-muted-foreground'>{row.original.dimensions}</span>,
        header: () => (
          <SortableHeader
            column='dimensions'
            label='Medidas'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 120,
      },
      {
        accessorKey: 'location',
        cell: ({ row }) => <span className='text-muted-foreground'>{row.original.location}</span>,
        header: () => (
          <SortableHeader
            column='location'
            label='Ubicación'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 140,
      },
      {
        accessorKey: 'collections',
        cell: ({ row }) => {
          const collections = row.original.collections
          if (collections.length === 0) {
            return <span className='text-xs text-muted-foreground'>-</span>
          }
          return (
            <div className='flex flex-wrap gap-1'>
              {collections.slice(0, 2).map((collection) => (
                <Badge key={collection.id} variant='outline' className='text-xs'>
                  {collection.title}
                </Badge>
              ))}
              {collections.length > 2 && (
                <Badge variant='outline' className='text-xs'>
                  +{collections.length - 2}
                </Badge>
              )}
            </div>
          )
        },
        header: () => (
          <SortableHeader
            column='collections'
            label='Colecciones'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 150,
      },
      {
        accessorKey: 'price',
        cell: ({ row }) => {
          const price = parseFloat(row.original.price)
          return <span className='font-semibold'>${price.toLocaleString()}</span>
        },
        header: () => (
          <SortableHeader
            column='price'
            label='Precio'
            sortConfig={sortConfig}
            onSort={handleSorting}
          />
        ),
        size: 120,
      },
      {
        cell: ({ row }) => {
          const product = row.original.product
          return (
            <Link
              href={replaceRouteParams(ROUTES.INVENTORY.DETAIL.PATH, {
                id: product.id.split('/').pop() ?? '',
              })}
              target='_blank'
            >
              <Button variant='ghost' size='sm' title='Ver detalles'>
                <ExternalLink className='size-4' />
              </Button>
            </Link>
          )
        },
        header: 'Acciones',
        id: 'actions',
        size: 80,
      },
    ],
    [
      selectedProductIds,
      handleProductToggle,
      sortConfig,
      handleSorting,
      handleSelectAllVisible,
      handleDeselectAll,
    ]
  )

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    pageCount: -1,
    state: {
      columnVisibility,
      pagination,
    },
  })

  const hasActiveFilters =
    vendorFilter !== 'all' ||
    techniqueFilter !== 'all' ||
    artworkTypeFilter !== 'all' ||
    dimensionsFilter !== 'all' ||
    statusFilter !== 'all'

  const activeFilterCount = [
    vendorFilter !== 'all',
    techniqueFilter !== 'all',
    artworkTypeFilter !== 'all',
    dimensionsFilter !== 'all',
    statusFilter !== 'all',
  ].filter(Boolean).length

  const emptyMessage =
    searchTerm || hasActiveFilters
      ? 'No se encontraron productos que coincidan con los filtros'
      : 'No se encontraron productos.'

  if (!isOpen) return null

  const modalContent = (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex h-[85vh] max-w-[1400px] flex-col overflow-hidden p-0'>
        <DialogHeader className='px-6 py-4'>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className='flex min-h-0 flex-1 flex-col space-y-3 overflow-hidden px-6'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative min-w-[200px] flex-1'>
              <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por título, artista...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size='sm'
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className='mr-2 size-4' />
              Filtros
              {activeFilterCount > 0 && (
                <Badge variant='secondary' className='ml-2'>
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant='ghost' size='sm' onClick={handleClearAllFilters}>
                <X className='mr-1 size-4' />
                Limpiar filtros
              </Button>
            )}
            {tableData.length > 0 && (
              <div className='flex space-x-2'>
                {selectedProductIds.size > 0 ? (
                  <Button onClick={handleDeselectAll} variant='outline' size='sm'>
                    <X className='mr-2 size-4' />
                    Deseleccionar Todos
                  </Button>
                ) : (
                  <Button onClick={handleSelectAllVisible} variant='outline' size='sm'>
                    Seleccionar Todos ({table.getRowModel().rows.length})
                  </Button>
                )}
              </div>
            )}
          </div>

          {showFilters && (
            <div className='flex flex-wrap items-center gap-2 rounded-md border p-3'>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-36'>
                  <SelectValue placeholder='Estado' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos los estados</SelectItem>
                  <SelectItem value='ACTIVE'>Activos</SelectItem>
                  <SelectItem value='DRAFT'>Borradores</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={vendors.includes(vendorFilter) ? vendorFilter : 'all'}
                onValueChange={setVendorFilter}
              >
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder='Artista' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos los artistas</SelectItem>
                  {vendors.map((vendor: string) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={
                  artworkTypes.some(
                    (t: { id: string; name: string }) => t.name === artworkTypeFilter
                  )
                    ? artworkTypeFilter
                    : 'all'
                }
                onValueChange={setArtworkTypeFilter}
              >
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder='Tipo de obra' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos los tipos</SelectItem>
                  {artworkTypes.map((type: { id: string; name: string }) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={
                  techniques.some((t: { id: string; name: string }) => t.name === techniqueFilter)
                    ? techniqueFilter
                    : 'all'
                }
                onValueChange={setTechniqueFilter}
              >
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder='Técnica' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas las técnicas</SelectItem>
                  {techniques.map((technique: { id: string; name: string }) => (
                    <SelectItem key={technique.id} value={technique.name}>
                      {technique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dimensionsFilter} onValueChange={setDimensionsFilter}>
                <SelectTrigger className='w-44'>
                  <SelectValue placeholder='Medidas' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todas las medidas</SelectItem>
                  <SelectItem value='chico'>Chico</SelectItem>
                  <SelectItem value='mediano'>Mediano</SelectItem>
                  <SelectItem value='grande'>Grande</SelectItem>
                  <SelectItem value='extra-grande'>Extra Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedProductIds.size > 0 && (
            <Accordion
              type='single'
              collapsible
              className='rounded-md border'
              value={showSelectedAccordion ? 'selected-products' : ''}
              onValueChange={(value) => setShowSelectedAccordion(value === 'selected-products')}
            >
              <AccordionItem value='selected-products' className='border-0'>
                <AccordionTrigger className='flex items-center justify-between rounded-md  px-4 py-3 hover:no-underline'>
                  <div className='flex items-center gap-2'>
                    <Badge variant='default'>{selectedProductIds.size}</Badge>
                    <span className='text-sm font-medium text-blue-800'>
                      productos seleccionados
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className='max-h-[200px] overflow-y-auto '>
                  <div className='space-y-2 p-2'>
                    {Array.from(selectedProducts.values()).map((product) => (
                      <div
                        key={product.id}
                        className='flex items-center justify-between rounded-md border p-2'
                      >
                        <div className='flex items-center gap-3'>
                          {product.images?.[0]?.url && (
                            <img
                              src={product.images[0].url}
                              alt={product.title}
                              className='size-10 rounded-md object-cover'
                            />
                          )}
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-medium'>{product.title}</p>
                            <p className='truncate text-xs text-muted-foreground'>
                              {product.vendor}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeselectProduct(product.id)}
                          className='text-red-500 hover:text-red-600'
                        >
                          <X className='size-4' />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          <div ref={tableContainerRef} className='min-h-0 flex-1 overflow-auto rounded-md border'>
            {isLoading ? (
              <div className='space-y-3 p-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center space-x-4 p-3'>
                    <Skeleton className='size-10 rounded-md' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                    <Skeleton className='h-6 w-20' />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='py-8 text-center'>
                <p className='text-red-600'>Error al cargar productos</p>
              </div>
            ) : (
              <Table.Data table={table} className='min-w-[1200px]' emptyMessage={emptyMessage} />
            )}
          </div>

          <Table.Pagination
            table={table}
            isServerSide={true}
            hasNextPage={productsData?.pageInfo?.hasNextPage ?? false}
            hasPreviousPage={currentPage > 1}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            isLoading={isFetching}
          />
        </div>

        <DialogFooter className='px-6 py-4'>
          <Button onClick={onClose} variant='outline'>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className='bg-blue-600 hover:bg-blue-700'
            disabled={selectedProductIds.size === 0}
          >
            {confirmButtonText} {selectedProductIds.size > 0 && `(${selectedProductIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return createPortal(modalContent, document.body)
}
