'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Edit, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface NewProduct {
  id: string
  title: string
  vendor: string
  productType: string
  price: string
  inventoryQuantity: number
  status: 'ACTIVE' | 'DRAFT'
  artworkDetails: {
    medium?: string
    year?: string
    serie?: string
    location?: string
    height?: string
    width?: string
    depth?: string
  }
  description?: string
  tags?: string[]
  imageUrl?: string | null
}

interface BulkCreateTableMeta {
  editingRowId?: string | null
  setEditingRowId?: (id: string | null) => void
  updateProduct?: (id: string, changes: Partial<NewProduct>) => void
  deleteProduct?: (id: string) => void
  editProduct?: (product: NewProduct) => void
  products?: NewProduct[]
  vendors?: string[]
  techniques?: { id: string; name: string }[]
  artworkTypes?: { id: string; name: string }[]
  locations?: { id: string; name: string }[]
  vendorsLoading?: boolean
  techniquesLoading?: boolean
  artworkTypesLoading?: boolean
  locationsLoading?: boolean
}

export const columns: ColumnDef<NewProduct>[] = [
  {
    accessorKey: 'image',
    cell: ({ row }) => {
      const product = row.original

      return (
        <div className='flex items-center justify-center'>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className='size-12 rounded object-cover'
            />
          ) : (
            <div className='flex size-12 items-center justify-center rounded border-2 border-dashed border-gray-300 text-xs text-gray-400'>
              Sin imagen
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
      const isIncomplete = !product.title.trim()

      return (
        <div className='flex flex-col'>
          <span className={`font-medium ${isIncomplete ? 'text-red-600' : ''}`}>
            {product.title || <em className='text-muted-foreground'>Sin título</em>}
          </span>
          {isIncomplete && <span className='text-xs text-red-600'>Requerido</span>}
        </div>
      )
    },
    header: 'Título',
  },
  {
    accessorKey: 'vendor',
    cell: ({ row }) => {
      const product = row.original
      const isIncomplete = !product.vendor.trim()

      return (
        <div className='flex flex-col'>
          <span className={isIncomplete ? 'text-red-600' : ''}>
            {product.vendor || <em className='text-muted-foreground'>Sin artista</em>}
          </span>
          {isIncomplete && <span className='text-xs text-red-600'>Requerido</span>}
        </div>
      )
    },
    header: 'Artista',
  },
  {
    accessorKey: 'productType',
    cell: ({ row }) => {
      const product = row.original
      const isIncomplete = !product.productType.trim()

      return (
        <div className='flex flex-col'>
          <span className={isIncomplete ? 'text-red-600' : ''}>
            {product.productType || <em className='text-muted-foreground'>Sin tipo</em>}
          </span>
          {isIncomplete && <span className='text-xs text-red-600'>Requerido</span>}
        </div>
      )
    },
    header: 'Tipo de obra',
  },
  {
    accessorKey: 'artworkDetails.medium',
    cell: ({ row }) => {
      const product = row.original
      return <span>{product.artworkDetails.medium || '-'}</span>
    },
    header: 'Técnica',
  },
  {
    accessorKey: 'price',
    cell: ({ row }) => {
      const product = row.original
      const price = parseFloat(product.price)
      const isIncomplete = !product.price || price < 0

      return (
        <div className='flex flex-col'>
          <span className={`font-semibold ${isIncomplete ? 'text-red-600' : ''}`}>
            ${isNaN(price) ? '0.00' : price.toFixed(2)}
          </span>
          {isIncomplete && <span className='text-xs text-red-600'>Requerido</span>}
        </div>
      )
    },
    header: 'Precio',
    id: 'price',
  },
  {
    accessorKey: 'inventoryQuantity',
    cell: ({ row }) => {
      const product = row.original
      return <span>{product.inventoryQuantity}</span>
    },
    header: 'Inventario',
    id: 'inventoryQuantity',
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
    cell: ({ row, table }) => {
      const product = row.original
      const { deleteProduct, editProduct } = (table.options.meta ?? {}) as BulkCreateTableMeta

      return (
        <div className='flex items-center justify-center space-x-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => editProduct?.(product)}
            className='text-blue-600 hover:bg-blue-100 hover:text-blue-700'
            title='Editar producto'
          >
            <Edit className='size-4' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => deleteProduct?.(product.id)}
            className='text-red-600 hover:bg-red-100 hover:text-red-700'
            title='Eliminar de la lista'
          >
            <Trash2 className='size-4' />
          </Button>
        </div>
      )
    },
    header: 'Acciones',
    id: 'actions',
  },
]
