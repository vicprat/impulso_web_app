'use client'

import { type ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Check,
  Edit,
  ExternalLink,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { type Product } from '@/models/Product'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    editingRowId?: string | null
    setEditingRowId?: (id: string | null) => void
    updateProduct?: (payload: {
      id: string
      title?: string
      price?: string
      inventoryQuantity?: number
      status?: 'ACTIVE' | 'DRAFT'
    }) => void
    isUpdating?: boolean
    deactivateUser?: (userId: string) => void
    handleManageRoles?: (user: TData) => void
    handleToggleUserStatus?: (user: TData) => void
    reactivateUser?: (userId: string) => void
    toggleUserPublicStatus?: (userId: string, isPublic: boolean) => void
    handleSorting?: (columnId: string) => void
    currentSortBy?: string
    currentSortOrder?: 'asc' | 'desc'
  }
}

const EditableTitle = ({
  isEditing,
  onCancel,
  onUpdate,
  product,
}: {
  product: Product
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
}) => {
  const [value, setValue] = useState(product.title)

  // Resetear el valor cuando cambia el producto o cuando se inicia la edición
  useEffect(() => {
    setValue(product.title)
  }, [product.title, isEditing])

  if (!isEditing) {
    return (
      <div className='flex flex-col'>
        <span className='font-medium'>{product.title}</span>
        {product.primaryImage && (
          <span className='text-xs text-muted-foreground'>
            SKU: {product.primaryVariant?.sku ?? 'N/A'}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className='flex items-center space-x-2'>
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='h-8'
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUpdate(value)
          if (e.key === 'Escape') onCancel()
        }}
      />
      <Button size='sm' variant='outline' onClick={() => onUpdate(value)}>
        <Check className='size-3' />
      </Button>
      <Button size='sm' variant='outline' onClick={onCancel}>
        <X className='size-3' />
      </Button>
    </div>
  )
}

const EditablePrice = ({
  isEditing,
  onCancel,
  onUpdate,
  product,
}: {
  product: Product
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
}) => {
  const variant = product.variants[0]
  const priceAmount = variant.price.amount || '0'
  const currencyCode = variant.price.currencyCode || 'MXN'
  const [value, setValue] = useState(priceAmount)

  // Resetear el valor cuando cambia el producto o cuando se inicia la edición
  useEffect(() => {
    setValue(priceAmount)
  }, [priceAmount, isEditing])

  const formatPrice = (amount: string, currency: string) => {
    const numericAmount = parseFloat(amount)
    return `$${numericAmount.toLocaleString('es-MX')} ${currency}`
  }

  if (!isEditing) {
    const displayPrice = formatPrice(priceAmount, currencyCode)

    return <span className='font-medium'>{displayPrice}</span>
  }

  return (
    <div className='flex items-center space-x-2'>
      <Input
        type='number'
        step='0.01'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='h-8 w-24'
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUpdate(value)
          if (e.key === 'Escape') onCancel()
        }}
      />
      <Button size='sm' variant='outline' onClick={() => onUpdate(value)}>
        <Check className='size-3' />
      </Button>
      <Button size='sm' variant='outline' onClick={onCancel}>
        <X className='size-3' />
      </Button>
    </div>
  )
}

const EditableInventory = ({
  isEditing,
  onCancel,
  onUpdate,
  product,
}: {
  product: Product
  isEditing: boolean
  onUpdate: (value: number) => void
  onCancel: () => void
}) => {
  const variant = product.variants[0]
  const currentQuantity = variant.inventoryQuantity ?? 0
  const [value, setValue] = useState(currentQuantity.toString())

  // Resetear el valor cuando cambia el producto o cuando se inicia la edición
  useEffect(() => {
    setValue(currentQuantity.toString())
  }, [currentQuantity, isEditing])

  if (!isEditing) {
    return (
      <div className='flex items-center space-x-2'>
        <span>{currentQuantity}</span>
        <Badge variant={currentQuantity > 0 ? 'default' : 'destructive'}>
          {currentQuantity > 0 ? 'Disponible' : 'Agotado'}
        </Badge>
      </div>
    )
  }

  return (
    <div className='flex items-center space-x-2'>
      <Input
        type='number'
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className='h-8 w-20'
        onKeyDown={(e) => {
          if (e.key === 'Enter') onUpdate(parseInt(value) || 0)
          if (e.key === 'Escape') onCancel()
        }}
      />
      <Button size='sm' variant='outline' onClick={() => onUpdate(parseInt(value) || 0)}>
        <Check className='size-3' />
      </Button>
      <Button size='sm' variant='outline' onClick={onCancel}>
        <X className='size-3' />
      </Button>
    </div>
  )
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    cell: ({ row }) => {
      const product = row.original
      const image = product.images.length > 0 ? product.images[0] : undefined

      if (!image) {
        return (
          <div className='flex size-16  items-center justify-center rounded-md'>
            <span className='text-xs '>Sin imagen</span>
          </div>
        )
      }

      return (
        <div className='relative size-16 overflow-hidden rounded-md'>
          <img
            src={image.url}
            alt={image.altText ?? product.title}
            className='object-cover'
            sizes='64px'
          />
        </div>
      )
    },
    header: 'Imagen',
  },
  {
    accessorKey: 'title',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      return (
        <EditableTitle
          product={product}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateProduct?.({ id: product.id, title: value })
          }}
          onCancel={() => setEditingRowId?.(null)}
        />
      )
    },
    header: ({ column, table }) => {
      const { handleSorting, currentSortBy, currentSortOrder } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'title'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('title')}
          className='h-auto p-0 font-semibold'
        >
          Título
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
  },
  {
    accessorKey: 'vendor',
    cell: ({ row }) => {
      const product = row.original
      return <span className='font-medium'>{product.vendor}</span>
    },
    header: ({ column, table }) => {
      const { handleSorting, currentSortBy, currentSortOrder } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'vendor'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('vendor')}
          className='h-auto p-0 font-semibold'
        >
          Artista
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
  },
  {
    accessorKey: 'productType',
    cell: ({ row }) => {
      const product = row.original
      return <Badge variant='outline'>{product.productType}</Badge>
    },
    header: ({ column, table }) => {
      const { handleSorting, currentSortBy, currentSortOrder } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'productType'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('productType')}
          className='h-auto p-0 font-semibold'
        >
          Tipo
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
  },
  {
    accessorKey: 'artworkDetails.medium',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails.medium ?? '-'}</span>
    },
    header: 'Técnica',
  },
  {
    accessorKey: 'artworkDetails.year',
    cell: ({ row }) => {
      const product = row.original
      return <span className='text-sm'>{product.artworkDetails.year ?? '-'}</span>
    },
    header: 'Año',
  },
  {
    cell: ({ row }) => {
      const product = row.original
      const { depth, height, width } = product.artworkDetails
      const dimensions = [height, width, depth].filter(Boolean)

      if (dimensions.length === 0) return <span className='text-sm text-muted-foreground'>-</span>

      return <span className='text-sm'>{dimensions.join(' × ')}</span>
    },
    header: 'Medidas (cm)',
    id: 'dimensions',
  },
  {
    accessorKey: 'artworkDetails.location',
    cell: ({ row }) => {
      const product = row.original
      const location = product.artworkDetails.location

      if (!location) return <span className='text-sm text-muted-foreground'>-</span>

      return (
        <Badge variant='secondary' className='text-xs'>
          {location}
        </Badge>
      )
    },
    header: 'Localización',
  },
  {
    accessorFn: (row) => row.variants[0]?.price?.amount,
    cell: ({ row, table }) => {
      const product = row.original
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      return (
        <EditablePrice
          product={product}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateProduct?.({ id: product.id, price: value })
          }}
          onCancel={() => setEditingRowId?.(null)}
        />
      )
    },
    header: ({ column, table }) => {
      const { handleSorting, currentSortBy, currentSortOrder } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'price'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('price')}
          className='h-auto p-0 font-semibold'
          title='Sorting por precio no disponible en Shopify'
        >
          Precio
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'price',
  },
  {
    accessorFn: (row) => row.variants[0]?.inventoryQuantity,
    cell: ({ row, table }) => {
      const product = row.original
      const { editingRowId, setEditingRowId, updateProduct } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      return (
        <EditableInventory
          product={product}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateProduct?.({ id: product.id, inventoryQuantity: value })
          }}
          onCancel={() => setEditingRowId?.(null)}
        />
      )
    },
    header: ({ column, table }) => {
      const { handleSorting, currentSortBy, currentSortOrder } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'inventory'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('inventory')}
          className='h-auto p-0 font-semibold'
        >
          Inventario
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'inventory',
  },
  {
    accessorKey: 'status',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingRowId, updateProduct } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      if (isEditing) {
        return (
          <Select
            value={product.status}
            onValueChange={(value: 'ACTIVE' | 'DRAFT') => {
              updateProduct?.({ id: product.id, status: value })
            }}
          >
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ACTIVE'>Activo</SelectItem>
              <SelectItem value='DRAFT'>Borrador</SelectItem>
            </SelectContent>
          </Select>
        )
      }

      const statusColors = {
        ACTIVE: 'default',
        ARCHIVED: 'destructive',
        DRAFT: 'secondary',
      } as const

      return <Badge variant={statusColors[product.status]}>{product.statusLabel}</Badge>
    },
    header: ({ column, table }) => {
      const { handleSorting, currentSortBy, currentSortOrder } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'status'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('status')}
          className='h-auto p-0 font-semibold'
        >
          Estado
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
  },
  {
    accessorKey: 'tags',
    cell: ({ row }) => {
      const product = row.original
      const displayTags = product.tags.slice(0, 3)
      const hasMore = product.tags.length > 3

      return (
        <div className='flex flex-wrap gap-1'>
          {displayTags.map((tag, index) => (
            <Badge key={index} variant='outline' className='text-xs'>
              {tag}
            </Badge>
          ))}
          {hasMore && (
            <Badge variant='outline' className='text-xs'>
              +{product.tags.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    header: 'Tags',
  },
  {
    cell: ({ row, table }) => {
      const product = row.original
      const { editingRowId, isUpdating, setEditingRowId } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      if (isEditing) {
        return (
          <div className='flex items-center space-x-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => setEditingRowId?.(null)}
              disabled={isUpdating}
            >
              <X className='size-3' />
            </Button>
          </div>
        )
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='size-8 p-0'>
              <span className='sr-only'>Abrir menú</span>
              <MoreHorizontal className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setEditingRowId?.(product.id)}>
              <Edit className='mr-2 size-4' />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={replaceRouteParams(ROUTES.INVENTORY.DETAIL.PATH, {
                  id: product.id.split('/').pop() ?? '',
                })}
              >
                <Eye className='mr-2 size-4' />
                Ver detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link
                href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, {
                  handle: product.handle,
                })}
                target='_blank'
              >
                <ExternalLink className='mr-2 size-4' />
                Ver en la tienda
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className='text-red-600'>
              <Trash2 className='mr-2 size-4' />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    id: 'actions',
  },
]
