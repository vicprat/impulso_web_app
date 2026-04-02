'use client'

import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { formatDimensionsWithUnit } from '@/helpers/dimensions'
import { Table } from '@/src/components/Table'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

import type { Product } from '@/models/Product'

interface PrivateRoomProductsTableProps {
  products: Product[]
  isLoading: boolean
  currentPage: number
  pageSize: number
  totalProducts: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  selectedProducts?: Set<string>
  onProductSelect?: (productId: string, selected: boolean) => void
  onSelectAll?: (selected: boolean) => void
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null
  onSort?: (key: string) => void
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

const ImageCell = ({ imageUrl, product }: { product: Product; imageUrl: string | null }) => {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 5))
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.5))

  const handleResetZoom = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUpOrLeave = () => {
    setIsDragging(false)
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) handleResetZoom()
      }}
    >
      <DialogTrigger asChild>
        <div className='relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-md bg-muted transition-opacity hover:opacity-80'>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.images?.[0]?.altText ?? product.title}
              className='size-full object-cover'
            />
          ) : (
            <div className='flex size-full items-center justify-center bg-muted'>
              <span className='text-xs text-muted-foreground'>Sin imagen</span>
            </div>
          )}
        </div>
      </DialogTrigger>
      {imageUrl && (
        <DialogContent className='max-w-4xl border-none bg-transparent p-0 shadow-none'>
          <div className='relative flex h-[80vh] w-full flex-col items-center justify-center'>
            <div className='absolute right-4 top-4 z-10 flex space-x-2 rounded-md bg-black/50 p-2 backdrop-blur-sm'>
              <Button
                variant='secondary'
                size='icon'
                onClick={handleResetZoom}
                disabled={scale === 1}
                title='Restablecer zoom'
              >
                <RotateCcw className='size-4' />
              </Button>

              <Button
                variant='secondary'
                size='icon'
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title='Alejar'
              >
                <ZoomOut className='size-4' />
              </Button>

              <Button
                variant='secondary'
                size='icon'
                onClick={handleZoomIn}
                disabled={scale >= 5}
                title='Acercar'
              >
                <ZoomIn className='size-4' />
              </Button>
            </div>

            <div
              className={`flex size-full items-center justify-center overflow-hidden ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <img
                src={imageUrl}
                alt={product.images?.[0]?.altText ?? product.title}
                className={`max-h-full max-w-full origin-center object-contain ${!isDragging ? 'transition-transform duration-200' : ''}`}
                style={{
                  pointerEvents: 'none',
                  transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                }}
              />
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}

const getColumns = (
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null,
  onSort?: (key: string) => void
): ColumnDef<Product>[] => [
  {
    cell: ({ row, table }) => {
      const product = row.original
      const meta = table.options.meta as {
        selectedProducts?: Set<string>
        onProductSelect?: (productId: string, selected: boolean) => void
      }

      const isSelected = meta?.selectedProducts?.has(product.id) ?? false

      return (
        <div className='flex items-center justify-center'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={(e) => meta?.onProductSelect?.(product.id, e.target.checked)}
            className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
          />
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => {
      const meta = table.options.meta as {
        selectedProducts?: Set<string>
        onSelectAll?: (selected: boolean) => void
      }

      const allRows = table.getRowModel().rows
      const selectedCount = meta?.selectedProducts?.size ?? 0
      const isAllSelected = allRows.length > 0 && selectedCount === allRows.length
      const isIndeterminate = selectedCount > 0 && selectedCount < allRows.length

      return (
        <div className='flex items-center justify-center'>
          <input
            type='checkbox'
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={(e) => meta?.onSelectAll?.(e.target.checked)}
            className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
          />
        </div>
      )
    },
    id: 'select',
  },
  {
    accessorKey: 'image',
    cell: ({ row }) => {
      const product = row.original
      const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : null

      return <ImageCell product={product} imageUrl={imageUrl} />
    },
    header: 'Imagen',
  },
  {
    accessorKey: 'title',
    cell: ({ row }) => {
      const product = row.original
      return <span className='font-medium'>{product.title}</span>
    },
    header: () => (
      <SortableHeader column='title' label='Título' sortConfig={sortConfig} onSort={onSort} />
    ),
  },
  {
    accessorKey: 'vendor',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.vendor}</span>
    },
    header: () => (
      <SortableHeader column='vendor' label='Artista' sortConfig={sortConfig} onSort={onSort} />
    ),
  },
  {
    accessorKey: 'productType',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.productType}</span>
    },
    header: () => (
      <SortableHeader
        column='productType'
        label='Tipo de obra'
        sortConfig={sortConfig}
        onSort={onSort}
      />
    ),
  },
  {
    accessorKey: 'artworkDetails.medium',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails.medium ?? '-'}</span>
    },
    header: () => (
      <SortableHeader
        column='artworkDetails.medium'
        label='Técnica'
        sortConfig={sortConfig}
        onSort={onSort}
      />
    ),
  },
  {
    accessorKey: 'artworkDetails.year',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails.year ?? '-'}</span>
    },
    header: () => (
      <SortableHeader
        column='artworkDetails.year'
        label='Año'
        sortConfig={sortConfig}
        onSort={onSort}
      />
    ),
  },
  {
    accessorKey: 'dimensions',
    cell: ({ row }) => {
      const product = row.original
      const { depth, height, width } = product.artworkDetails
      return (
        <span className='text-sm'>{formatDimensionsWithUnit(height, width, depth) || '-'}</span>
      )
    },
    header: () => (
      <SortableHeader column='dimensions' label='Medidas' sortConfig={sortConfig} onSort={onSort} />
    ),
  },
  {
    accessorKey: 'artworkDetails.location',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails.location ?? '-'}</span>
    },
    header: () => (
      <SortableHeader
        column='artworkDetails.location'
        label='Ubicación'
        sortConfig={sortConfig}
        onSort={onSort}
      />
    ),
  },
  {
    accessorKey: 'collections',
    cell: ({ row }) => {
      const product = row.original
      const collections = product.collections || []

      if (collections.length === 0) {
        return <span className='text-xs text-muted-foreground'>-</span>
      }

      return (
        <div className='flex flex-wrap gap-1'>
          {collections.map((collection) => (
            <Badge key={collection.id} variant='outline' className='text-xs'>
              {collection.title}
            </Badge>
          ))}
        </div>
      )
    },
    header: () => (
      <SortableHeader
        column='collections'
        label='Colecciones'
        sortConfig={sortConfig}
        onSort={onSort}
      />
    ),
  },
  {
    accessorKey: 'price',
    cell: ({ row }) => {
      const product = row.original
      const variant = product.variants[0]
      const currentPrice = variant?.price.amount ?? '0'
      return <span className='font-semibold'>${parseFloat(currentPrice).toLocaleString()}</span>
    },
    header: () => (
      <SortableHeader column='price' label='Precio' sortConfig={sortConfig} onSort={onSort} />
    ),
    id: 'price',
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const product = row.original
      return (
        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {product.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
        </Badge>
      )
    },
    header: () => (
      <SortableHeader column='status' label='Estado' sortConfig={sortConfig} onSort={onSort} />
    ),
  },
  {
    cell: ({ row }) => {
      const product = row.original
      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.DETAIL.PATH, {
            id: product.id.split('/').pop() ?? '',
          })}
        >
          <Button variant='ghost' size='sm' title='Ver detalles'>
            <ExternalLink className='size-4' />
          </Button>
        </Link>
      )
    },
    header: 'Acciones',
    id: 'actions',
  },
]

export function PrivateRoomProductsTable({
  currentPage,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onProductSelect,
  onSelectAll,
  onSort,
  pageSize,
  products,
  selectedProducts,
  sortConfig,
  totalProducts,
}: PrivateRoomProductsTableProps) {
  const columns = useMemo(() => getColumns(sortConfig, onSort), [sortConfig, onSort])
  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onProductSelect,
      onSelectAll,
      selectedProducts,
    } as any,
  })

  const hasNextPage = useMemo(() => {
    return currentPage * pageSize < totalProducts
  }, [currentPage, pageSize, totalProducts])

  const hasPreviousPage = currentPage > 1

  if (isLoading) {
    return <Table.Loader />
  }

  return (
    <>
      <Table.Data
        table={table}
        emptyMessage='No hay productos en esta sala. Agrega productos usando el botón "Agregar Productos".'
      />
      {products.length > 0 && (
        <Table.Pagination
          table={table}
          isServerSide={true}
          hasNextPage={hasNextPage}
          hasPreviousPage={hasPreviousPage}
          currentPage={currentPage}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </>
  )
}
