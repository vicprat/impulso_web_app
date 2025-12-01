'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Check, Edit, ExternalLink, Eye, Grid, Loader2, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { formatDimensionsWithUnit } from '@/helpers/dimensions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { type Product } from '@/models/Product'
import {
  useGetArtworkTypes,
  useGetLocations,
  useGetTechniques,
  useGetVendors,
} from '@/services/product/hook'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

// Componente para la celda de descuentos (solo visualización)
const DiscountCell = ({
  getProductDiscounts,
  isAdmin,
  product,
}: {
  product: any
  isAdmin: boolean
  getProductDiscounts?: (productId: string) => any[]
}) => {
  if (!isAdmin) return null

  const productDiscounts = getProductDiscounts?.(product.id) ?? []
  const activeDiscounts = productDiscounts.filter((discount) => discount.isActive)

  const getCouponId = (coupon: any) => {
    return coupon.id.split('/').pop() ?? coupon.id
  }

  if (activeDiscounts.length === 0) {
    return <span className='text-sm text-muted-foreground'>-</span>
  }
  return (
    <div className='flex flex-wrap gap-1'>
      {activeDiscounts.map((discount, index) => {
        const couponId = getCouponId(discount)
        return (
          <Link
            key={index}
            href={replaceRouteParams(ROUTES.INVENTORY.COUPONS.DETAIL.PATH, {
              id: couponId,
            })}
            className='inline-flex'
          >
            <Badge
              variant='secondary'
              className='cursor-pointer flex-col items-center bg-green-100 text-green-800 transition-colors hover:bg-green-200'
              title={`${discount.title} - ${discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`} OFF`}
            >
              <div className='flex items-center gap-1'>
                {discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}
              </div>
              {discount.code && <span className='text-xs opacity-75'>{discount.code}</span>}
            </Badge>
          </Link>
        )
      })}
    </div>
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
    getProductDiscounts?: (productId: string) => any[]
    collections?: any[]
    handleAddProductToCollection?: (productId: string, collectionId: string) => Promise<void>
    handleRemoveProductFromCollection?: (productId: string, collectionId: string) => Promise<void>
    onAddSelectedProductsToCollection?: (collectionId: string) => Promise<void>
    onRemoveSelectedProductsFromCollection?: (collectionId: string) => Promise<void>
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
  const [editValue, setEditValue] = useState(value || '')

  useEffect(() => {
    setEditValue(value || '')
  }, [value, isEditing])

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
  const [editValue, setEditValue] = useState((value || '').toString())

  useEffect(() => {
    setEditValue((value || '').toString())
  }, [value, isEditing])

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

// Componente para edición inline de colecciones
const EditableCollectionSelect = ({
  className = '',
  collections = [],
  isEditing,
  onCancel,
  onUpdate,
  placeholder = 'Seleccionar colección',
  productId,
}: {
  productId: string
  isEditing: boolean
  onUpdate: (collectionId: string) => Promise<void>
  onCancel: () => void
  collections: any[]
  placeholder?: string
  className?: string
}) => {
  const [selectedCollection, setSelectedCollection] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  if (!isEditing) {
    return null
  }

  const handleCollectionChange = async (collectionId: string) => {
    if (!collectionId) return

    setIsAdding(true)
    try {
      setSelectedCollection(collectionId)
      await onUpdate(collectionId)
      // Limpiar la selección después de agregar
      setSelectedCollection('')
    } catch (error) {
      console.error('Error al agregar producto a colección:', error)
      // Mantener la selección en caso de error para que el usuario pueda intentar de nuevo
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className='flex items-center space-x-2'>
      <Select
        value={selectedCollection || undefined}
        onValueChange={handleCollectionChange}
        disabled={isAdding}
      >
        <SelectTrigger className={`h-8 ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {collections.map((collection) => (
            <SelectItem key={collection.id} value={collection.id}>
              {collection.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isAdding && <Loader2 className='size-4 animate-spin' />}
    </div>
  )
}

// Componente para mostrar las colecciones de un producto
const CollectionCell = ({
  collections = [],
  handleAddProductToCollection,
  handleRemoveProductFromCollection,
  isAdmin,
  isEditing,
  product,
}: {
  product: any
  isAdmin: boolean
  isEditing: boolean
  collections?: any[]
  handleAddProductToCollection?: (productId: string, collectionId: string) => Promise<void>
  handleRemoveProductFromCollection?: (productId: string, collectionId: string) => Promise<void>
}) => {
  if (!isAdmin) return null

  // Obtener las colecciones del producto (vienen en el objeto product)
  const productCollections = product.collections || []

  if (isEditing) {
    return (
      <div className='space-y-2'>
        <EditableCollectionSelect
          productId={product.id}
          collections={collections}
          isEditing={isEditing}
          onUpdate={async (collectionId) => {
            if (handleAddProductToCollection) {
              try {
                await handleAddProductToCollection(product.id, collectionId)
                // No cerrar el modo de edición, permitir seguir editando otros campos
              } catch (error) {
                console.error('Error al agregar producto a colección:', error)
              }
            }
          }}
          onCancel={() => {
            // No-op: no necesitamos cancelar nada aquí
          }}
          placeholder='Agregar a colección...'
        />
        {productCollections.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {productCollections.map((collection: { id: string; title: string; handle: string }) => {
              return (
                <Badge
                  key={collection.id}
                  variant='secondary'
                  className='inline-flex items-center gap-1 bg-red-100 text-red-800'
                  title={collection.title}
                >
                  <span>{collection.title}</span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      if (handleRemoveProductFromCollection) {
                        try {
                          await handleRemoveProductFromCollection(product.id, collection.id)
                        } catch (error) {
                          console.error('Error al remover producto de colección:', error)
                        }
                      }
                    }}
                    className='ml-1 rounded-full hover:bg-red-200'
                    type='button'
                  >
                    <X className='size-3' />
                  </button>
                </Badge>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Mostrar las colecciones del producto
  if (productCollections.length === 0) {
    return <span className='text-sm text-muted-foreground'>-</span>
  }

  return (
    <div className='flex flex-wrap gap-1'>
      {productCollections.map((collection: { id: string; title: string; handle: string }) => {
        const collectionId = collection.id.split('/').pop() ?? collection.id
        return (
          <Link
            key={collection.id}
            href={replaceRouteParams(ROUTES.INVENTORY.COLLECTIONS.DETAIL.PATH, {
              id: collectionId,
            })}
            className='inline-flex'
            onClick={(e) => e.stopPropagation()}
          >
            <Badge
              variant='secondary'
              className='cursor-pointer bg-blue-100 text-blue-800 transition-colors hover:bg-blue-200'
              title={collection.title}
            >
              <Grid className='mr-1 size-3' />
              {collection.title}
            </Badge>
          </Link>
        )
      })}
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
  const [editHeight, setEditHeight] = useState(height || '')
  const [editWidth, setEditWidth] = useState(width || '')
  const [editDepth, setEditDepth] = useState(depth || '')

  useEffect(() => {
    setEditHeight(height || '')
    setEditWidth(width || '')
    setEditDepth(depth || '')
  }, [height, width, depth, isEditing])

  if (!isEditing) {
    return (
      <span className='text-sm'>
        {formatDimensionsWithUnit(height, width, depth) || '-'}
      </span>
    )
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
  const vendorOptions =
    vendors?.map((vendor: string) => ({
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

  const techniqueOptions =
    techniques?.map((technique: { id: string; name: string }) => ({
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

  const artworkTypeOptions =
    artworkTypes?.map((artworkType: { id: string; name: string }) => ({
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

  const locationOptions =
    locations?.map((location: { id: string; name: string }) => ({
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

const ImageReplacer = ({
  onUpdate,
  product,
}: {
  product: Product
  onUpdate: (productId: string, imageUrl: string | null) => void
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
    product.images.length > 0 ? product.images[0].url : null
  )
  const [isHovered, setIsHovered] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    setCurrentImageUrl(product.images.length > 0 ? product.images[0].url : null)
  }, [product.images])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    await uploadFile(file)
    event.target.value = ''
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)

    try {
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

      const productId = product.id.split('/').pop()
      if (!productId) throw new Error('ID de producto inválido')

      const replaceResponse = await fetch(
        `/api/management/products/${productId}/replace-main-image`,
        {
          body: JSON.stringify({
            currentImageId: product.images[0]?.id || null,
            newImageUrl: uploadData.resourceUrl,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        }
      )

      if (!replaceResponse.ok) {
        const errorData = await replaceResponse.json()
        throw new Error(errorData.error ?? 'Error al reemplazar imagen')
      }

      const replaceData = await replaceResponse.json()
      const newImageUrl =
        replaceData.product?.images?.edges?.[0]?.node?.url || uploadData.resourceUrl

      setCurrentImageUrl(newImageUrl)
      onUpdate(product.id, newImageUrl)

      toast.success(`Imagen principal actualizada`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al actualizar imagen: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return

    setIsUploading(true)
    try {
      const productId = product.id.split('/').pop()
      if (!productId) throw new Error('ID de producto inválido')

      const removeResponse = await fetch(
        `/api/management/products/${productId}/remove-main-image`,
        {
          body: JSON.stringify({
            imageId: product.images[0]?.id || null,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'DELETE',
        }
      )

      if (!removeResponse.ok) {
        const errorData = await removeResponse.json()
        throw new Error(errorData.error ?? 'Error al remover imagen')
      }

      setCurrentImageUrl(null)
      onUpdate(product.id, null)
      setIsPreviewOpen(false)

      toast.success(`Imagen removida`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error al remover imagen: ${errorMessage}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      <div
        className='group relative size-16 cursor-pointer overflow-hidden rounded-md'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsPreviewOpen(true)}
      >
        {currentImageUrl ? (
          <>
            <img
              src={currentImageUrl}
              alt={product.images[0]?.altText ?? product.title}
              className='size-full object-cover transition-all group-hover:brightness-75'
              sizes='64px'
            />
            {isHovered && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/50 transition-all'>
                <Eye className='size-4 text-white' />
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Imagen del producto</DialogTitle>
          </DialogHeader>

          <div className='flex flex-col items-center gap-4'>
            {currentImageUrl ? (
              <div className='relative max-h-[60vh] w-full overflow-hidden rounded-lg border'>
                <img
                  src={currentImageUrl}
                  alt={product.images[0]?.altText ?? product.title}
                  className='h-auto w-full object-contain'
                />
                {isUploading && (
                  <div className='absolute inset-0 flex items-center justify-center bg-black/40'>
                    <Loader2 className='size-8 animate-spin text-white' />
                  </div>
                )}
              </div>
            ) : (
              <div className='flex h-64 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300'>
                <div className='flex flex-col items-center gap-2'>
                  <Upload className='size-8 text-gray-400' />
                  <span className='text-sm text-gray-500'>Sin imagen</span>
                </div>
              </div>
            )}

            <div className='text-sm text-muted-foreground'>{product.title}</div>
          </div>

          <DialogFooter className='flex-row justify-end gap-2'>
            <Input
              id={`image-input-${product.id}`}
              type='file'
              accept='image/*'
              onChange={handleFileChange}
              className='hidden'
            />
            <Button
              variant='outline'
              disabled={isUploading}
              onClick={() => document.getElementById(`image-input-${product.id}`)?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className='mr-2 size-4 animate-spin' />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className='mr-2 size-4' />
                  Reemplazar imagen
                </>
              )}
            </Button>
            {currentImageUrl && (
              <Button variant='destructive' disabled={isUploading} onClick={handleRemoveImage}>
                <X className='mr-2 size-4' />
                Remover imagen
              </Button>
            )}
            <Button variant='outline' onClick={() => setIsPreviewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export const columns: ColumnDef<Product>[] = [
  {
    cell: ({ row, table }) => {
      const { isBulkMode, onRowSelectionChange, selectedRows } = table.options.meta ?? {}
      const isSelected = selectedRows?.has(row.original.id) ?? false

      if (!isBulkMode) return null

      return (
        <div className='flex min-w-[56px] items-center justify-center'>
          <input
            type='checkbox'
            checked={isSelected}
            onChange={(e) => onRowSelectionChange?.(row.original.id, e.target.checked)}
            className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
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
        <div className='flex min-w-[56px] items-center justify-center'>
          <input
            type='checkbox'
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate
            }}
            onChange={(e) => onSelectAllChange?.(e.target.checked)}
            className='size-4 rounded border-gray-300 text-primary focus:ring-primary'
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
        <div className='flex min-w-[128px] justify-center'>
          <ImageReplacer
            product={product}
            onUpdate={(productId: string, imageUrl: string | null) => {
              // Imagen actualizada en el componente ImageReplacer
            }}
          />
        </div>
      )
    },
    header: () => <div className='min-w-[128px]'>Imagen</div>,
  },
  {
    accessorKey: 'id',
    cell: ({ row, table }) => {
      const product = row.original
      const productId = product.id.split('/').pop() ?? product.id

      return (
        <div className='min-w-[120px]'>
          <span className='font-mono text-sm text-muted-foreground'>{productId}</span>
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'id'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[120px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('id')}
            className='h-auto p-0 font-semibold'
          >
            ID
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
    id: 'id',
  },
  {
    accessorKey: 'title',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.title !== undefined ? editingChanges.title : product.title

      return (
        <div className='flex min-w-[240px] flex-col gap-2'>
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
        <div className='min-w-[240px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('title')}
            className='h-auto p-0 font-semibold'
          >
            Título
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'vendor',
    cell: ({ row, table }) => {
      const product = row.original
      const {
        editingChanges,
        editingRowId,
        isAdmin,
        isArtist,
        setEditingRowId,
        updateEditingChanges,
      } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Los artistas no pueden cambiar el vendor (solo pueden editar sus propios productos)
      const isVendorDisabled = isArtist

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.vendor !== undefined ? editingChanges.vendor : product.vendor

      return (
        <div className='min-w-[200px]'>
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
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'vendor'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[200px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('vendor')}
            className='h-auto p-0 font-semibold'
          >
            Artista
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'productType',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.productType !== undefined
          ? editingChanges.productType
          : product.productType

      const content = isEditing ? (
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
      ) : (
        <span className='text-sm'>{currentValue}</span>
      )

      return <div className='min-w-[192px]'>{content}</div>
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'productType'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[192px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('productType')}
            className='h-auto p-0 font-semibold'
          >
            Tipo de obra
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'artworkDetails.medium',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.artworkDetails?.medium !== undefined
          ? editingChanges.artworkDetails.medium
          : product.artworkDetails.medium

      return (
        <div className='min-w-[192px]'>
          <EditableTechniqueSelect
            value={currentValue}
            isEditing={isEditing}
            onUpdate={(value) => {
              updateEditingChanges?.({
                artworkDetails: {
                  medium: value || undefined,
                },
              })
            }}
            onCancel={() => setEditingRowId?.(null)}
            placeholder='Técnica'
            className='text-sm'
            fieldName='medium'
          />
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'medium'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[192px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('medium')}
            className='h-auto p-0 font-semibold'
          >
            Técnica
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'artworkDetails.year',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.artworkDetails?.year !== undefined
          ? editingChanges.artworkDetails.year
          : product.artworkDetails.year

      return (
        <div className='min-w-[136px]'>
          <EditableNumber
            value={currentValue}
            isEditing={isEditing}
            onUpdate={(value) => {
              updateEditingChanges?.({
                artworkDetails: {
                  year: value || undefined,
                },
              })
            }}
            onCancel={() => setEditingRowId?.(null)}
            placeholder='Año'
            className='text-sm'
            fieldName='year'
          />
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'year'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[136px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('year')}
            className='h-auto p-0 font-semibold'
          >
            Año
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'dimensions',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentHeight =
        isEditing && editingChanges?.artworkDetails?.height !== undefined
          ? editingChanges.artworkDetails.height
          : product.artworkDetails.height
      const currentWidth =
        isEditing && editingChanges?.artworkDetails?.width !== undefined
          ? editingChanges.artworkDetails.width
          : product.artworkDetails.width
      const currentDepth =
        isEditing && editingChanges?.artworkDetails?.depth !== undefined
          ? editingChanges.artworkDetails.depth
          : product.artworkDetails.depth

      const content = isEditing ? (
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
              },
            })
          }}
          onCancel={() => setEditingRowId?.(null)}
          fieldName='dimensions'
        />
      ) : (
        <span className='text-sm'>
          {formatDimensionsWithUnit(currentHeight, currentWidth, currentDepth) || '-'}
        </span>
      )

      return <div className='min-w-[224px]'>{content}</div>
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'dimensions'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[224px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('dimensions')}
            className='h-auto p-0 font-semibold'
          >
            Medidas (cm)
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
    id: 'dimensions',
  },
  {
    accessorKey: 'artworkDetails.serie',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.artworkDetails?.serie !== undefined
          ? editingChanges.artworkDetails.serie
          : product.artworkDetails.serie

      return (
        <div className='min-w-[192px]'>
          <EditableText
            value={currentValue}
            isEditing={isEditing}
            onUpdate={(value) => {
              updateEditingChanges?.({
                artworkDetails: {
                  serie: value || undefined,
                },
              })
            }}
            onCancel={() => setEditingRowId?.(null)}
            placeholder='Serie'
            className='text-sm'
            fieldName='serie'
          />
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'serie'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[192px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('serie')}
            className='h-auto p-0 font-semibold'
          >
            Serie
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'artworkDetails.location',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.artworkDetails?.location !== undefined
          ? editingChanges.artworkDetails.location
          : product.artworkDetails.location

      return (
        <div className='min-w-[200px]'>
          <EditableLocationSelect
            value={currentValue}
            isEditing={isEditing}
            onUpdate={(value) => {
              updateEditingChanges?.({
                artworkDetails: {
                  location: value || undefined,
                },
              })
            }}
            onCancel={() => setEditingRowId?.(null)}
            placeholder='Localización'
            className='text-sm'
            fieldName='location'
          />
        </div>
      )
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'location'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[200px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('location')}
            className='h-auto p-0 font-semibold'
          >
            Localización
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'price',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id
      const variant = product.variants[0]
      const currentPrice = variant.price.amount

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.price !== undefined ? editingChanges.price : currentPrice

      const content = isEditing ? (
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
      ) : (
        <span className='font-semibold'>${parseFloat(currentValue).toLocaleString()}</span>
      )

      return <div className='min-w-[168px]'>{content}</div>
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'price'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[168px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('price')}
            className='h-auto p-0 font-semibold'
            title='Ordenar por precio'
          >
            Precio
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
    id: 'price',
  },
  {
    accessorKey: 'inventory',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id
      const variant = product.variants[0]
      const currentQuantity = variant.inventoryQuantity ?? 0

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.inventoryQuantity !== undefined
          ? editingChanges.inventoryQuantity
          : currentQuantity

      const content = isEditing ? (
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
      ) : (
        <div className='flex items-center space-x-2'>
          <span>{currentValue}</span>
          <Badge variant={currentValue > 0 ? 'default' : 'destructive'}>
            {currentValue > 0 ? 'Disponible' : 'Agotado'}
          </Badge>
        </div>
      )

      return <div className='min-w-[168px]'>{content}</div>
    },
    header: ({ column, table }) => {
      const { currentSortBy, currentSortOrder, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'inventory'
      const isAsc = currentSortOrder === 'asc'

      return (
        <div className='min-w-[168px]'>
          <Button
            variant='ghost'
            onClick={() => handleSorting?.('inventory')}
            className='h-auto p-0 font-semibold'
          >
            Inventario
            <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
          </Button>
        </div>
      )
    },
    id: 'inventory',
  },
  {
    accessorKey: 'Status',
    cell: ({ row, table }) => {
      const product = row.original
      const { editingChanges, editingRowId, setEditingRowId, updateEditingChanges } =
        table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      // Usar el valor de editingChanges si está disponible, sino el valor original del producto
      const currentValue =
        isEditing && editingChanges?.status !== undefined ? editingChanges.status : product.status

      const statusOptions = [
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Borrador', value: 'DRAFT' },
        { label: 'Archivado', value: 'ARCHIVED' },
      ]

      const content = isEditing ? (
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
      ) : (
        <Badge variant={currentValue === 'ACTIVE' ? 'active' : 'archived'}>
          {statusOptions.find((option) => option.value === currentValue)?.label}
        </Badge>
      )

      return <div className='min-w-[160px]'>{content}</div>
    },
    header: () => <div className='min-w-[160px]'>Estado</div>,
  },

  {
    accessorKey: 'automaticDiscount',
    cell: ({ row, table }) => {
      const product = row.original
      const { getProductDiscounts, isAdmin } = table.options.meta ?? {}

      return (
        <div className='min-w-[220px]'>
          <DiscountCell
            product={product}
            isAdmin={isAdmin ?? false}
            getProductDiscounts={getProductDiscounts}
          />
        </div>
      )
    },
    header: () => <div className='min-w-[220px]'>Descuentos</div>,
    id: 'automaticDiscount',
  },

  {
    accessorKey: 'collections',
    cell: ({ row, table }) => {
      const product = row.original
      const {
        collections,
        editingRowId,
        handleAddProductToCollection,
        handleRemoveProductFromCollection,
        isAdmin,
      } = table.options.meta ?? {}
      const isEditing = editingRowId === product.id

      return (
        <div className='min-w-[200px]'>
          <CollectionCell
            product={product}
            isAdmin={isAdmin ?? false}
            isEditing={isEditing}
            collections={collections}
            handleAddProductToCollection={handleAddProductToCollection}
            handleRemoveProductFromCollection={handleRemoveProductFromCollection}
          />
        </div>
      )
    },
    header: () => (
      <div className='flex items-center gap-2'>
        <Grid className='size-4' />
        <span className='min-w-[200px]'>Colecciones</span>
      </div>
    ),
    id: 'collections',
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
        <div className='flex min-w-[200px] items-center space-x-2'>
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
            <Button variant='ghost' title='Ver en la tienda'>
              <ExternalLink className='size-4' />
            </Button>
          </Link>
        </div>
      )
    },
    header: () => <div className='min-w-[200px]'>Acciones</div>,
    id: 'actions',
  },
]
