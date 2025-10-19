'use client'

import { getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, ExternalLink, QrCode } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table } from '@/src/components/Table'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

import { downloadQRBlob, generateProductQR } from './generateProductQR'

import type { Product } from '@/models/Product'

const QRDownloadButton = ({ product }: { product: Product }) => {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadQR = async () => {
    setIsGenerating(true)
    try {
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
      const blob = await generateProductQR(
        {
          handle: product.handle,
          title: product.title,
          vendor: product.vendor,
        },
        baseUrl
      )
      downloadQRBlob(blob, `qr-${product.handle}.png`)
      toast.success('QR descargado exitosamente')
    } catch (error) {
      console.error('Error generando QR:', error)
      toast.error('Error al generar el código QR')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={handleDownloadQR}
      disabled={isGenerating}
      title='Descargar QR'
      className='text-purple-600 hover:bg-purple-50 hover:text-purple-700'
    >
      {isGenerating ? (
        <div className='size-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent' />
      ) : (
        <QrCode className='size-4' />
      )}
    </Button>
  )
}

interface CollectionProductsTableProps {
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
  isSmartCollection?: boolean
}

const columns: ColumnDef<Product>[] = [
  {
    cell: ({ row, table }) => {
      const product = row.original
      const meta = table.options.meta as {
        selectedProducts?: Set<string>
        onProductSelect?: (productId: string, selected: boolean) => void
        isSmartCollection?: boolean
      }

      if (meta?.isSmartCollection) return null

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
        isSmartCollection?: boolean
      }

      if (meta?.isSmartCollection) return null

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

      return (
        <div className='relative size-16 shrink-0 overflow-hidden rounded-md bg-muted'>
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
      )
    },
    header: 'Imagen',
  },
  {
    accessorKey: 'title',
    cell: ({ row }) => {
      const product = row.original
      return <span className='font-medium'>{product.title}</span>
    },
    header: () => {
      return (
        <Button variant='ghost' className='h-auto p-0 font-semibold'>
          Título
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
  },
  {
    accessorKey: 'vendor',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.vendor}</span>
    },
    header: () => {
      return (
        <Button variant='ghost' className='h-auto p-0 font-semibold'>
          Artista
          <ArrowUpDown className='ml-2 size-4' />
        </Button>
      )
    },
  },
  {
    accessorKey: 'productType',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.productType}</span>
    },
    header: 'Tipo de obra',
  },
  {
    accessorKey: 'artworkDetails.medium',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails?.medium ?? '-'}</span>
    },
    header: 'Técnica',
  },
  {
    accessorKey: 'artworkDetails.year',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails?.year ?? '-'}</span>
    },
    header: 'Año',
  },
  {
    accessorKey: 'dimensions',
    cell: ({ row }) => {
      const product = row.original
      const dimensions = []
      if (product.artworkDetails?.height) dimensions.push(`${product.artworkDetails.height}cm`)
      if (product.artworkDetails?.width) dimensions.push(`${product.artworkDetails.width}cm`)
      if (product.artworkDetails?.depth) dimensions.push(`${product.artworkDetails.depth}cm`)
      return <span className='text-sm'>{dimensions.join(' × ') || '-'}</span>
    },
    header: 'Medidas',
    id: 'dimensions',
  },
  {
    accessorKey: 'price',
    cell: ({ row }) => {
      const product = row.original
      const variant = product.variants[0]
      const currentPrice = variant.price.amount
      return <span className='font-semibold'>${parseFloat(currentPrice).toLocaleString()}</span>
    },
    header: 'Precio',
    id: 'price',
  },
  {
    accessorKey: 'inventory',
    cell: ({ row }) => {
      const product = row.original
      const variant = product.variants[0]
      const currentQuantity = variant.inventoryQuantity ?? 0

      return (
        <div className='flex items-center space-x-2'>
          <span>{currentQuantity}</span>
          <Badge variant={currentQuantity > 0 ? 'default' : 'destructive'}>
            {currentQuantity > 0 ? 'Disponible' : 'Agotado'}
          </Badge>
        </div>
      )
    },
    header: 'Inventario',
    id: 'inventory',
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
    header: 'Estado',
  },
  {
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className='flex items-center space-x-2'>
          <QRDownloadButton product={product} />
          <Link
            href={replaceRouteParams(ROUTES.INVENTORY.DETAIL.PATH, {
              id: product.id.split('/').pop() ?? '',
            })}
          >
            <Button variant='ghost' size='sm' title='Ver detalles'>
              <ExternalLink className='size-4' />
            </Button>
          </Link>
        </div>
      )
    },
    header: 'Acciones',
    id: 'actions',
  },
]

export function CollectionProductsTable({
  currentPage,
  isLoading,
  isSmartCollection = false,
  onPageChange,
  onPageSizeChange,
  onProductSelect,
  onSelectAll,
  pageSize,
  products,
  selectedProducts,
  totalProducts,
}: CollectionProductsTableProps) {
  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      isSmartCollection,
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
        emptyMessage='No hay productos en esta colección. Agrega productos usando el botón "Agregar Productos".'
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
