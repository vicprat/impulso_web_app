'use client'

import { type ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Check,
  Edit,
  ExternalLink,
  Eye,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { type Product } from '@/models/Product'
import { useGetArtworkTypes, useGetLocations, useGetTechniques, useGetVendors } from '@/services/product/hook'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'


declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    editingRowId?: string | null
    setEditingRowId?: (id: string | null) => void
    updateProduct?: (payload: {
      id: string
      title?: string
      vendor?: string
      productType?: string
      price?: string
      inventoryQuantity?: number
      status?: 'ACTIVE' | 'DRAFT'
      artworkDetails?: {
        medium?: string
        year?: string
        serie?: string
        location?: string
        height?: string
        width?: string
        depth?: string
      }
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
    // Nuevos campos para manejo de cambios acumulados
    editingChanges?: Record<string, any>
    updateEditingChanges?: (changes: Record<string, any>) => void
    saveAllChanges?: () => void
    // Información del usuario para las columnas
    user?: any
    isAdmin?: boolean
    isArtist?: boolean
  }
}

// Componente para edición inline de texto
const EditableText = ({
  className = '',
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  placeholder,
  value,
}: {
  value: string | null
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  placeholder?: string
  className?: string
  fieldName?: string
}) => {
  const [ editValue, setEditValue ] = useState(value || '')

  useEffect(() => {
    setEditValue(value || '')
  }, [ value, isEditing ])

  if (!isEditing) {
    return <span className={className}>{value || '-'}</span>
  }

  return (
    <div className='flex items-center space-x-2'>
      <Input
        value={editValue}
        onChange={(e) => {
          const newValue = e.target.value
          setEditValue(newValue)
          onUpdate(newValue) // Actualizar cambios en tiempo real
        }}
        placeholder={placeholder}
        className={`h-8 ${className}`}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      />
    </div>
  )
}

// Componente para edición inline de número
const EditableNumber = ({
  className = '',
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  placeholder,
  step = '0.01',
  value,
}: {
  value: string | number | null
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  placeholder?: string
  className?: string
  step?: string
  fieldName?: string
}) => {
  const [ editValue, setEditValue ] = useState((value || '').toString())

  useEffect(() => {
    setEditValue((value || '').toString())
  }, [ value, isEditing ])

  if (!isEditing) {
    return <span className={className}>{value || '-'}</span>
  }

  return (
    <div className='flex items-center space-x-2'>
      <Input
        type='number'
        step={step}
        value={editValue}
        onChange={(e) => {
          const newValue = e.target.value
          setEditValue(newValue)
          onUpdate(newValue) // Actualizar cambios en tiempo real
        }}
        placeholder={placeholder}
        className={`h-8 ${className}`}
        onKeyDown={(e) => {
          if (e.key === 'Escape') onCancel()
        }}
      />
    </div>
  )
}

// Componente para edición inline de select
const EditableSelect = ({
  className = '',
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  options,
  placeholder,
  value,
}: {
  value: string
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
  fieldName?: string
}) => {
  if (!isEditing) {
    return <span className={className}>{value || '-'}</span>
  }

  return (
    <div className='flex items-center space-x-2'>
      <Select value={value} onValueChange={onUpdate}>
        <SelectTrigger className={`h-8 ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Componente para edición inline de medidas
const EditableDimensions = ({
  depth,
  fieldName = '',
  height,
  isEditing,
  onCancel,
  onUpdate,
  width,
}: {
  height?: string | null
  width?: string | null
  depth?: string | null
  isEditing: boolean
  onUpdate: (dimensions: { height?: string; width?: string; depth?: string }) => void
  onCancel: () => void
  fieldName?: string
}) => {
  const [ editHeight, setEditHeight ] = useState(height || '')
  const [ editWidth, setEditWidth ] = useState(width || '')
  const [ editDepth, setEditDepth ] = useState(depth || '')

  useEffect(() => {
    setEditHeight(height || '')
    setEditWidth(width || '')
    setEditDepth(depth || '')
  }, [ height, width, depth, isEditing ])

  if (!isEditing) {
    const dimensions = [ height, width, depth ].filter(Boolean)
    return <span className='text-sm'>{dimensions.length > 0 ? dimensions.join(' × ') : '-'}</span>
  }

  return (
    <div className='flex items-center space-x-2'>
      <div className='flex items-center space-x-1'>
        <Input
          type='number'
          step='0.1'
          value={editHeight}
          onChange={(e) => {
            const newHeight = e.target.value
            setEditHeight(newHeight)
            onUpdate({ depth: editDepth, height: newHeight, width: editWidth })
          }}
          placeholder='H'
          className='h-8 w-16 text-xs'
        />
        <span className='text-xs text-gray-400'>×</span>
        <Input
          type='number'
          step='0.1'
          value={editWidth}
          onChange={(e) => {
            const newWidth = e.target.value
            setEditWidth(newWidth)
            onUpdate({ depth: editDepth, height: editHeight, width: newWidth })
          }}
          placeholder='W'
          className='h-8 w-16 text-xs'
        />
        <span className='text-xs text-gray-400'>×</span>
        <Input
          type='number'
          step='0.1'
          value={editDepth}
          onChange={(e) => {
            const newDepth = e.target.value
            setEditDepth(newDepth)
            onUpdate({ depth: newDepth, height: editHeight, width: editWidth })
          }}
          placeholder='D'
          className='h-8 w-16 text-xs'
        />
      </div>
    </div>
  )
}

const EditableVendorSelect = ({
  className = '',
  disabled = false,
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  placeholder,
  value,
}: {
  value: string | null
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  placeholder?: string
  className?: string
  fieldName?: string
  disabled?: boolean
}) => {
  const { data: vendors, isLoading } = useGetVendors()

  if (!isEditing) {
    return (
      <div className='flex flex-col gap-1'>
        <span className={className}>{value || '-'}</span>
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton className='h-8 w-32' />
  }

  // El endpoint /api/vendors devuelve un array de strings, no objetos
  const vendorOptions = vendors?.map((vendor: string) => ({
    label: vendor,
    value: vendor,
  })) || []

  return (
    <div className='flex flex-col gap-1'>
      <Select value={value || ''} onValueChange={onUpdate} disabled={disabled}>
        <SelectTrigger className={`h-8 ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {vendorOptions.map((option: { value: string; label: string }) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

const EditableTechniqueSelect = ({
  className = '',
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  placeholder,
  value,
}: {
  value: string | null
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  placeholder?: string
  className?: string
  fieldName?: string
}) => {
  const { data: techniques, isLoading } = useGetTechniques()

  if (!isEditing) {
    return <span className={className}>{value || '-'}</span>
  }

  if (isLoading) {
    return <Skeleton className='h-8 w-32' />
  }

  const techniqueOptions = techniques?.map((technique: { id: string; name: string }) => ({
    label: technique.name,
    value: technique.name,
  })) || []

  return (
    <Select value={value || ''} onValueChange={onUpdate}>
      <SelectTrigger className={`h-8 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {techniqueOptions.map((option: { value: string; label: string }) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const EditableArtworkTypeSelect = ({
  className = '',
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  placeholder,
  value,
}: {
  value: string | null
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  placeholder?: string
  className?: string
  fieldName?: string
}) => {
  const { data: artworkTypes, isLoading } = useGetArtworkTypes()

  if (!isEditing) {
    return <span className={className}>{value || '-'}</span>
  }

  if (isLoading) {
    return <Skeleton className='h-8 w-32' />
  }

  const artworkTypeOptions = artworkTypes?.map((artworkType: { id: string; name: string }) => ({
    label: artworkType.name,
    value: artworkType.name,
  })) || []

  return (
    <Select value={value || ''} onValueChange={onUpdate}>
      <SelectTrigger className={`h-8 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {artworkTypeOptions.map((option: { value: string; label: string }) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

const EditableLocationSelect = ({
  className = '',
  fieldName = '',
  isEditing,
  onCancel,
  onUpdate,
  placeholder,
  value,
}: {
  value: string | null
  isEditing: boolean
  onUpdate: (value: string) => void
  onCancel: () => void
  placeholder?: string
  className?: string
  fieldName?: string
}) => {
  const { data: locations, isLoading } = useGetLocations()

  if (!isEditing) {
    return <span className={className}>{value || '-'}</span>
  }

  if (isLoading) {
    return <Skeleton className='h-8 w-32' />
  }

  const locationOptions = locations?.map((location: { id: string; name: string }) => ({
    label: location.name,
    value: location.name,
  })) || []

  return (
    <Select value={value || ''} onValueChange={onUpdate}>
      <SelectTrigger className={`h-8 ${className}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {locationOptions.map((option: { value: string; label: string }) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'image',
    cell: ({ row }) => {
      const product = row.original
      const image = product.images.length > 0 ? product.images[ 0 ] : undefined

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
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.title !== undefined ? editingChanges.title : product.title

      return (
        <div className='flex flex-col gap-2'>
          <EditableText
            value={currentValue}
            isEditing={isEditing}
            onUpdate={(value) => {
              updateEditingChanges?.({ title: value })
            }}
            onCancel={() => setEditingRowId?.(null)}
            placeholder='Título'
            className='font-semibold'
            fieldName='title'
          />
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
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
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, isAdmin, isArtist, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Los artistas no pueden cambiar el vendor (solo pueden editar sus propios productos)
      const isVendorDisabled = isArtist

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.vendor !== undefined ? editingChanges.vendor : product.vendor

      return (
        <EditableVendorSelect
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({ vendor: value })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='Artista'
          className='font-semibold'
          fieldName='vendor'
          disabled={isVendorDisabled}
        />
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
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
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.productType !== undefined ? editingChanges.productType : product.productType

      if (!isEditing) {
        return <span className='text-sm'>{currentValue}</span>
      }

      return (
        <EditableArtworkTypeSelect
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({ productType: value })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='Tipo de obra'
          className='w-32'
          fieldName='productType'
        />
      )
    },
    header: 'Tipo de obra',
  },
  {
    accessorKey: 'artworkDetails.medium',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.artworkDetails?.medium !== undefined
        ? editingChanges.artworkDetails.medium
        : product.artworkDetails.medium

      return (
        <EditableTechniqueSelect
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({
              artworkDetails: {
                medium: value || undefined,
              }
            })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='Técnica'
          className='text-sm'
          fieldName='medium'
        />
      )
    },
    header: 'Técnica',
  },
  {
    accessorKey: 'artworkDetails.year',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.artworkDetails?.year !== undefined
        ? editingChanges.artworkDetails.year
        : product.artworkDetails.year

      return (
        <EditableNumber
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({
              artworkDetails: {
                year: value || undefined,
              }
            })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='Año'
          className='text-sm'
          fieldName='year'
        />
      )
    },
    header: 'Año',
  },
  {
    accessorKey: 'dimensions',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentHeight = isEditing && editingChanges?.artworkDetails?.height !== undefined
        ? editingChanges.artworkDetails.height
        : product.artworkDetails.height
      const currentWidth = isEditing && editingChanges?.artworkDetails?.width !== undefined
        ? editingChanges.artworkDetails.width
        : product.artworkDetails.width
      const currentDepth = isEditing && editingChanges?.artworkDetails?.depth !== undefined
        ? editingChanges.artworkDetails.depth
        : product.artworkDetails.depth

      if (!isEditing) {
        const dimensions = []
        if (currentHeight) dimensions.push(`${currentHeight}cm`)
        if (currentWidth) dimensions.push(`${currentWidth}cm`)
        if (currentDepth) dimensions.push(`${currentDepth}cm`)
        return <span className='text-sm'>{dimensions.join(' × ') || '-'}</span>
      }

      return (
        <EditableDimensions
          height={currentHeight}
          width={currentWidth}
          depth={currentDepth}
          isEditing={isEditing}
          onUpdate={(dimensions) => {
            updateEditingChanges?.({
              artworkDetails: {
                depth: dimensions.depth || undefined,
                height: dimensions.height || undefined,
                width: dimensions.width || undefined,
              }
            })
          }}
          onCancel={() => setEditingRowId?.(null)}
          fieldName='dimensions'
        />
      )
    },
    header: 'Medidas (cm)',
    id: 'dimensions',
  },
  {
    accessorKey: 'artworkDetails.serie',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.artworkDetails?.serie !== undefined
        ? editingChanges.artworkDetails.serie
        : product.artworkDetails.serie

      return (
        <EditableText
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({
              artworkDetails: {
                serie: value || undefined,
              }
            })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='Serie'
          className='text-sm'
          fieldName='serie'
        />
      )
    },
    header: 'Serie',
  },
  {
    accessorKey: 'artworkDetails.location',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.artworkDetails?.location !== undefined
        ? editingChanges.artworkDetails.location
        : product.artworkDetails.location

      return (
        <EditableLocationSelect
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({
              artworkDetails: {
                location: value || undefined,
              }
            })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='Localización'
          className='text-sm'
          fieldName='location'
        />
      )
    },
    header: 'Localización',
  },
  {
    accessorKey: 'price',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id
      const variant = product.variants[ 0 ]
      const currentPrice = variant.price.amount

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.price !== undefined
        ? editingChanges.price
        : currentPrice

      if (!isEditing) {
        return <span className='font-semibold'>${parseFloat(currentValue).toLocaleString()}</span>
      }

      return (
        <EditableNumber
          value={currentValue}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({ price: value })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='0.00'
          className='font-semibold'
          fieldName='price'
        />
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'price'
      const isAsc = currentSortOrder === 'asc'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('price')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por precio'
        >
          Precio
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'price',
  },
  {
    accessorKey: 'inventory',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id
      const variant = product.variants[ 0 ]
      const currentQuantity = variant.inventoryQuantity ?? 0

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.inventoryQuantity !== undefined
        ? editingChanges.inventoryQuantity
        : currentQuantity

      if (!isEditing) {
        return (
          <div className='flex items-center space-x-2'>
            <span>{currentValue}</span>
            <Badge variant={currentValue > 0 ? 'default' : 'destructive'}>
              {currentValue > 0 ? 'Disponible' : 'Agotado'}
            </Badge>
          </div>
        )
      }

      return (
        <EditableNumber
          value={currentValue.toString()}
          isEditing={isEditing}
          onUpdate={(value) => {
            updateEditingChanges?.({ inventoryQuantity: parseInt(value) || 0 })
          }}
          onCancel={() => setEditingRowId?.(null)}
          placeholder='0'
          className='font-medium'
          step='1'
          fieldName='inventoryQuantity'
        />
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
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
    accessorKey: 'Status',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue = isEditing && editingChanges?.status !== undefined
        ? editingChanges.status
        : product.status

      const statusOptions = [
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Borrador', value: 'DRAFT' },
        { label: 'Archivado', value: 'ARCHIVED' }
      ]

      if (isEditing) {
        return (
          <EditableSelect
            value={currentValue}
            isEditing={isEditing}
            onUpdate={(value) => {
              updateEditingChanges?.({ status: value as 'ACTIVE' | 'DRAFT' })
            }}
            onCancel={() => setEditingRowId?.(null)}
            options={statusOptions}
            placeholder='Estado'
            className='w-32'
            fieldName='status'
          />
        )
      }

      return <Badge variant={currentValue === 'ACTIVE' ? 'active' : 'archived'}>{statusOptions.find(option => option.value === currentValue)?.label}</Badge>
    },
  },
  {
    cell: ({ row, table }) => {
      const product = row.original
      const { editingRowId, isUpdating, saveAllChanges, setEditingRowId } = table.options.meta ?? {}
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
            <Button
              size='sm'
              variant='outline'
              onClick={() => {
                saveAllChanges?.()
              }}
              disabled={isUpdating}
            >
              <Check className='size-3' />
            </Button>
          </div>
        )
      }

      return (
        <div className='flex items-center space-x-2'>
          <Button variant='ghost' onClick={() => setEditingRowId?.(product.id)} title='Editar'>
            <Edit className='size-4' />
          </Button>
          <Link
            href={replaceRouteParams(ROUTES.INVENTORY.DETAIL.PATH, {
              id: product.id.split('/').pop() ?? '',
            })}
          >
            <Button variant='ghost' title='Ver detalles'>
              <Eye className='size-4' />
            </Button>
          </Link>
          <Link
            href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, {
              handle: product.handle,
            })}
          >
            <Button
              variant='ghost'
              title='Ver en la tienda'
            >
              <ExternalLink className='size-4' />
            </Button>
          </Link>
        </div>
      )
    },
    id: 'actions',
  },
]