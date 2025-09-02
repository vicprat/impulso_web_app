/* eslint-disable @next/next/no-img-element */
'use client'

import { type ColumnDef } from '@tanstack/react-table'
import {
  ArrowUpDown,
  Check,
  Edit,
  ExternalLink,
  Eye,
  Loader2,
  Percent,
  Tag,
  Trash2,
  Upload,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
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

// Componente para la celda de descuentos con dialog de confirmación
const DiscountCell = ({
  product,
  isAdmin,
  onOpenAutomaticDiscountModal,
  getProductDiscounts,
  getDiscountProductCount,
  onDeleteDiscount
}: {
  product: any
  isAdmin: boolean
  onOpenAutomaticDiscountModal?: (product: { id: string; title: string }) => void
  getProductDiscounts?: (productId: string) => any[]
  getDiscountProductCount?: (discount: any) => number
  onDeleteDiscount?: (discountId: string) => Promise<void>
}) => {
  const [ isDeleteDialogOpen, setIsDeleteDialogOpen ] = useState(false)
  const [ discountToDelete, setDiscountToDelete ] = useState<{ id: string; title: string; productCount: number } | null>(null)
  const [ isDeleting, setIsDeleting ] = useState(false)

  if (!isAdmin) return null

  const productDiscounts = getProductDiscounts?.(product.id) ?? []
  const activeDiscounts = productDiscounts.filter(discount => discount.isActive)

  const handleDeleteClick = (discount: any) => {
    // Contar cuántos productos tienen este descuento
    const productCount = getDiscountProductCount?.(discount) ?? 1

    setDiscountToDelete({
      id: discount.id,
      title: discount.title,
      productCount: productCount
    })
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!discountToDelete || !onDeleteDiscount) return

    setIsDeleting(true)
    try {
      await onDeleteDiscount(discountToDelete.id)
      toast.success('Descuento eliminado exitosamente')
    } catch (error) {
      toast.error('Error al eliminar el descuento')
      console.error('Error al eliminar descuento:', error)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
      setDiscountToDelete(null)
    }
  }

  return (
    <>
      <div className='flex flex-col gap-2'>
        {/* Mostrar descuentos activos */}
        {activeDiscounts.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {activeDiscounts.map((discount, index) => (
              <div key={index} className='flex items-center gap-1'>
                <Badge
                  variant='secondary'
                  className='bg-green-100 text-green-800 hover:bg-green-200'
                  title={`${discount.title} - ${discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`} OFF`}
                >
                  <Percent className='mr-1 size-3' />
                  {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleDeleteClick(discount)}
                  className='h-5 w-5 p-0 text-red-600 hover:bg-red-100 hover:text-red-700'
                  title={`Eliminar descuento "${discount.title}"`}
                >
                  <Trash2 className='size-3' />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Botón para crear/editar descuentos */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => onOpenAutomaticDiscountModal?.({ id: product.id, title: product.title })}
          className='bg-purple-50 text-purple-700 hover:bg-purple-100'
          title={activeDiscounts.length > 0 ? 'Editar descuentos' : 'Crear descuento automático'}
        >
          <Tag className='mr-1 size-3' />
          {activeDiscounts.length > 0 ? 'Editar' : 'Descuento'}
        </Button>
      </div>

      {/* Dialog de confirmación */}
      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setDiscountToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Eliminar Descuento"
        message={
          discountToDelete ?
            `¿Estás seguro de que quieres eliminar el descuento "${discountToDelete.title}"?\n\n⚠️ Advertencia: Este descuento se eliminará de ${discountToDelete.productCount} producto${discountToDelete.productCount > 1 ? 's' : ''} que lo tengan aplicado.`
            : ''
        }
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  )
}


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
      images?: { mediaContentType: 'IMAGE'; originalSource: string }[]
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
    // Campos para bulk operations
    isBulkMode?: boolean
    selectedRows?: Set<string>
    onRowSelectionChange?: (id: string, selected: boolean) => void
    onSelectAllChange?: (selected: boolean) => void
    bulkChanges?: Record<string, any>
    onBulkChange?: (field: string, value: any) => void
    onApplyBulkChanges?: () => void
    onOpenCouponModal?: (product: { id: string; title: string }) => void
    onOpenAutomaticDiscountModal?: (product: { id: string; title: string }) => void
    getProductDiscounts?: (productId: string) => any[]
    getDiscountProductCount?: (discount: any) => number
    onDeleteDiscount?: (discountId: string) => Promise<void>
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

// Componente para reemplazar la imagen principal (solo para tabla)
const ImageReplacer = ({
  onUpdate,
  product,
}: {
  product: Product
  onUpdate: (productId: string, imageUrl: string | null) => void
}) => {
  const [ isEditing, setIsEditing ] = useState(false)
  const [ currentImageUrl, setCurrentImageUrl ] = useState<string | null>(
    product.images.length > 0 ? product.images[ 0 ].url : null
  )
  const [ isHovered, setIsHovered ] = useState(false)
  const [ isUploading, setIsUploading ] = useState(false)

  useEffect(() => {
    setCurrentImageUrl(product.images.length > 0 ? product.images[ 0 ].url : null)
  }, [ product.images ])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[ 0 ]
    await uploadFile(file)
    event.target.value = '' // Limpiar input
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    const preview = URL.createObjectURL(file)

    try {
      // 1. Subir el archivo
      const formData = new FormData()
      formData.append('file', file)

      const uploadResponse = await fetch('/api/uploads', {
        body: formData,
        method: 'POST',
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error ?? 'Error al subir el archivo')
      }

      const uploadData = await uploadResponse.json()

      // 2. Reemplazar la imagen principal usando la API de Shopify
      const productId = product.id.split('/').pop()
      if (!productId) throw new Error('ID de producto inválido')

      const replaceResponse = await fetch(`/api/management/products/${productId}/replace-main-image`, {
        body: JSON.stringify({
          currentImageId: product.images[ 0 ]?.id || null,
          newImageUrl: uploadData.resourceUrl
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'PUT'
      })

      if (!replaceResponse.ok) {
        const errorData = await replaceResponse.json()
        throw new Error(errorData.error ?? 'Error al reemplazar imagen')
      }

      const replaceData = await replaceResponse.json()

      // 3. Actualizar el estado local
      setCurrentImageUrl(uploadData.resourceUrl)
      onUpdate(product.id, uploadData.resourceUrl)
      setIsEditing(false)

      toast.success(`Imagen principal actualizada`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al actualizar imagen: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  if (isEditing) {
    return (
      <div className='w-32 space-y-2'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={isUploading}
            onClick={() => document.getElementById(`image-input-${product.id}`)?.click()}
            className='flex h-8 items-center gap-1 px-2 text-xs'
          >
            {isUploading ? (
              <Loader2 className='size-3 animate-spin' />
            ) : (
              <Upload className='size-3' />
            )}
            {isUploading ? 'Subiendo...' : 'Reemplazar'}
          </Button>

          <Input
            id={`image-input-${product.id}`}
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='hidden'
          />

          {currentImageUrl && (
            <Button
              type='button'
              variant='destructive'
              size='sm'
              onClick={() => {
                setCurrentImageUrl(null)
                onUpdate(product.id, null)
                setIsEditing(false)
              }}
              className='h-8 px-2 text-xs'
            >
              <X className='size-3' />
            </Button>
          )}
        </div>

        {/* Preview compacto */}
        {currentImageUrl && (
          <div className='relative overflow-hidden rounded border'>
            <div className='relative aspect-square w-16'>
              <img
                src={currentImageUrl}
                alt={product.images[ 0 ]?.altText ?? product.title}
                className='size-full object-cover'
              />

              {/* Overlay de estado */}
              {isUploading && (
                <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                  <Loader2 className='size-4 animate-spin text-white' />
                </div>
              )}
            </div>

            {/* Información compacta */}
            <div className='p-1 text-center'>
              <p className='text-xs text-gray-600'>Imagen principal</p>
            </div>
          </div>
        )}

        {/* Placeholder compacto */}
        {!currentImageUrl && (
          <div className='flex size-16 items-center justify-center rounded border-2 border-dashed border-gray-300 text-center'>
            <div className='flex flex-col items-center'>
              <Upload className='size-4 text-gray-400' />
              <span className='text-xs text-gray-500'>Sin imagen</span>
            </div>
          </div>
        )}

        <div className='flex justify-end space-x-1'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => setIsEditing(false)}
            className='h-6 px-2 text-xs'
          >
            Cancelar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className='group relative size-16 cursor-pointer overflow-hidden rounded-md'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsEditing(true)}
    >
      {currentImageUrl ? (
        <>
          <img
            src={currentImageUrl}
            alt={product.images[ 0 ]?.altText ?? product.title}
            className='size-full object-cover transition-all group-hover:brightness-75'
            sizes='64px'
          />
          {/* Overlay con ícono de editar */}
          {isHovered && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 transition-all'>
              <Edit className='size-4 text-white' />
            </div>
          )}
        </>
      ) : (
        <div className='flex size-16 items-center justify-center rounded-md border-2 border-dashed border-gray-300 transition-all hover:border-gray-400 hover:bg-gray-50'>
          <div className='flex flex-col items-center'>
            <Edit className='mb-1 size-4 text-gray-400' />
            <span className='text-xs text-gray-500'>Agregar</span>
          </div>
        </div>
      )}
    </div>
  )
}

export const columns: ColumnDef<Product>[] = [
  {
    cell: ({ row, table }) => {
      const { isBulkMode, onRowSelectionChange, selectedRows } = table.options.meta ?? {}
      const isSelected = selectedRows?.has(row.original.id) ?? false

      if (!isBulkMode) return null

      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onRowSelectionChange?.(row.original.id, e.target.checked)}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>
      )
    },
    enableHiding: false,
    enableSorting: false,
    header: ({ table }) => {
      const { isBulkMode, onSelectAllChange, selectedRows } = table.options.meta ?? {}
      const allRows = table.getFilteredRowModel().rows
      const selectedCount = selectedRows?.size ?? 0
      const isAllSelected = allRows.length > 0 && selectedCount === allRows.length
      const isIndeterminate = selectedCount > 0 && selectedCount < allRows.length

      if (!isBulkMode) return null

      return (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={(e) => onSelectAllChange?.(e.target.checked)}
            className="size-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
        </div>
      )
    },
    id: 'select',
  },
  {
    accessorKey: 'image',
    cell: ({ row, table }) => {
      const product = row.original
      const { updateProduct } = table.options.meta ?? {}

      return (
        <ImageReplacer
          product={product}
          onUpdate={(productId: string, imageUrl: string | null) => {
            // El componente ImageReplacer ahora maneja la lógica de reemplazo internamente
            // Solo necesitamos invalidar el caché después de la actualización
            if (imageUrl) {
              console.log('Imagen principal actualizada:', {
                newImageUrl: imageUrl,
                productId
              })

              // Invalidar el caché para refrescar los datos
              // No necesitamos llamar a updateProduct aquí
            }
          }}
        />
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
  {
    accessorKey: 'automaticDiscount',
    cell: ({ row, table }) => {
      const product = row.original
      const { isAdmin, onOpenAutomaticDiscountModal, getProductDiscounts, getDiscountProductCount, onDeleteDiscount } = table.options.meta ?? {}

      return (
        <DiscountCell
          product={product}
          isAdmin={isAdmin ?? false}
          onOpenAutomaticDiscountModal={onOpenAutomaticDiscountModal}
          getProductDiscounts={getProductDiscounts}
          getDiscountProductCount={getDiscountProductCount}
          onDeleteDiscount={onDeleteDiscount}
        />
      )
    },
    header: 'Descuentos',
    id: 'automaticDiscount',
  },
]