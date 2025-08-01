'use client'

import {
  Activity,
  ArrowLeft,
  Box,
  Calendar,
  DollarSign,
  Edit2,
  ExternalLink,
  FileText,
  Hash,
  Image as ImageIcon,
  Inbox,
  Package,
  Palette,
  Plus,
  Ruler,
  Settings,
  Tag,
  Trash2,
  User,
  Warehouse
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Form } from '@/components/Forms'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteProduct, useGetArtworkTypes, useGetLocations, useGetProduct, useGetTechniques, useUpdateProduct } from '@/services/product/hook'
import { type UpdateProductPayload } from '@/services/product/types'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'
import { formatCurrency } from '@/src/helpers'
import { useQueryClient } from '@tanstack/react-query'

// Componente para agregar nuevas opciones
const AddOptionDropdown = ({
  options,
  isLoading,
  onAddNew,
  placeholder,
  label,
}: {
  options: { id: string; name: string }[]
  isLoading: boolean
  onAddNew: (name: string) => Promise<void>
  placeholder: string
  label: string
}) => {
  const [ isAdding, setIsAdding ] = useState(false)
  const [ newValue, setNewValue ] = useState('')

  const handleAddNew = async () => {
    if (!newValue.trim()) return

    try {
      setIsAdding(true)
      await onAddNew(newValue.trim())
      setNewValue('')
      toast.success(`${label} agregado exitosamente`)
    } catch (error) {
      toast.error(`Error al agregar ${label}: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className='space-y-2'>
      <Label>{label}</Label>
      <div className='flex gap-2'>
        <Select disabled={isLoading}>
          <SelectTrigger className='flex-1'>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.name}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant='outline'
          size='sm'
          onClick={() => setIsAdding(true)}
          disabled={isLoading}
        >
          <Plus className='size-4' />
        </Button>
      </div>

      {isAdding && (
        <div className='flex gap-2'>
          <Input
            placeholder={`Nuevo ${label.toLowerCase()}`}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                void handleAddNew()
              }
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewValue('')
              }
            }}
            autoFocus
          />
          <Button
            size='sm'
            onClick={handleAddNew}
            disabled={!newValue.trim()}
          >
            Agregar
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setIsAdding(false)
              setNewValue('')
            }}
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}

// Forzar que la página sea dinámica
export const dynamic = 'force-dynamic'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [ isEditing, setIsEditing ] = useState(false)
  const queryClient = useQueryClient()

  const productId = params.id as string

  const { data: product, error, isLoading, refetch } = useGetProduct(productId)

  // Hooks para obtener las opciones
  const { data: techniques = [], isLoading: isLoadingTechniques } = useGetTechniques()
  const { data: artworkTypes = [], isLoading: isLoadingArtworkTypes } = useGetArtworkTypes()
  const { data: locations = [], isLoading: isLoadingLocations } = useGetLocations()

  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  const handleSave = async (updatePayload: UpdateProductPayload) => {
    try {
      await updateMutation.mutateAsync(updatePayload)
      toast.success('Producto actualizado exitosamente')
      setIsEditing(false)
      void refetch()
    } catch (error) {
      toast.error(
        `Error al actualizar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleDelete = async () => {
    if (!product) return

    const confirmed = window.confirm(
      '¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    try {
      await deleteMutation.mutateAsync(product.id)
      toast.success('Producto eliminado exitosamente')
      router.push('/manage-inventory')
    } catch (error) {
      toast.error(
        `Error al eliminar: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  // Función para agregar nuevas opciones
  const handleAddNewOption = async (optionType: string, name: string) => {
    const response = await fetch(`/api/options/${optionType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al agregar la opción')
    }

    // Invalidar las queries para refrescar las opciones
    await queryClient.invalidateQueries({ queryKey: [ 'techniques' ] })
    await queryClient.invalidateQueries({ queryKey: [ 'artwork_types' ] })
    await queryClient.invalidateQueries({ queryKey: [ 'locations' ] })
  }

  if (isLoading) {
    return (
      <div className='container mx-auto space-y-6 py-6'>
        <div className='flex items-center space-x-4'>
          <Skeleton className='size-10' />
          <Skeleton className='h-8 w-64' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardContent className='p-6 text-center'>
            <h3 className='mb-2 text-lg font-semibold text-red-600'>Error al cargar producto</h3>
            <p className='mb-4 text-muted-foreground'>
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <div className='space-x-2'>
              <Button onClick={() => refetch()}>Reintentar</Button>
              <Button variant='outline' onClick={() => router.push(ROUTES.INVENTORY.MAIN.PATH)}>
                Volver al listado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='container mx-auto py-6'>
        <Card>
          <CardContent className='p-6 text-center'>
            <h3 className='mb-2 text-lg font-semibold'>Producto no encontrado</h3>
            <p className='mb-4 text-muted-foreground'>
              El producto que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button onClick={() => router.push(ROUTES.INVENTORY.MAIN.PATH)}>
              Volver al listado
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const variant = product.variants && product.variants.length > 0 ? product.variants[ 0 ] : undefined

  const getAvailabilityVariant = (available: boolean) => {
    return available ? 'default' : 'destructive'
  }

  return (
    <div className='min-h-screen bg-surface'>
      <div className='container mx-auto space-y-8 py-8'>
        {/* Header */}
        <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
          <CardContent className='p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => router.push(ROUTES.INVENTORY.MAIN.PATH)}
                  className='bg-surface-container-low hover:bg-surface-container'
                >
                  <ArrowLeft className='mr-2 size-4' />
                  Volver
                </Button>
                <div className='h-8 w-px bg-outline-variant' />
                <div>
                  <div className='mb-1 flex items-center gap-3'>
                    <h1 className='text-2xl font-bold text-on-surface'>{product.title}</h1>
                    <Badge
                      variant={
                        product.status === 'ACTIVE'
                          ? 'default'
                          : product.status === 'DRAFT'
                            ? 'secondary'
                            : 'destructive'
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>
                  <p className='text-sm text-on-surface-variant'>ID: {product.id.split('/').pop()}</p>
                </div>
              </div>

              <div className='flex items-center space-x-3'>
                <Button variant='outline' asChild>
                  <Link
                    href={replaceRouteParams(ROUTES.STORE.PRODUCT_DETAIL.PATH, {
                      handle: product.handle,
                    })}
                    target='_blank'
                    className='flex items-center'
                  >
                    <ExternalLink className='mr-2 size-4' />
                    Ver en tienda
                  </Link>
                </Button>
                <Button variant='container-success' onClick={handleEdit}>
                  <Edit2 className='mr-2 size-4' />
                  Editar
                </Button>
                <Button
                  variant='container-destructive'
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className='mr-2 size-4' />
                  {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing ? (
          <Form.Product
            mode='edit'
            product={product}
            onSave={handleSave}
            onCancel={handleCancelEdit}
            isLoading={updateMutation.isPending}
          />
        ) : (
          <>
            {/* Layout principal con información */}
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='space-y-6 lg:col-span-2'>
                {/* Información del Producto */}
                <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Box className='size-5 text-primary' />
                      Información del Producto
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <div className='space-y-4'>
                        <div>
                          <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            Título
                          </Label>
                          <p className='mt-1 text-sm font-medium text-on-surface'>{product.title}</p>
                        </div>
                        <div>
                          <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            Artista
                          </Label>
                          <div className='mt-1 flex items-center gap-2'>
                            <User className='size-3 text-on-surface-variant' />
                            <p className='text-sm font-medium text-on-surface'>{product.vendor}</p>
                          </div>
                        </div>
                      </div>
                      <div className='space-y-4'>
                        <div>
                          <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            Handle
                          </Label>
                          <div className='mt-1 flex items-center gap-2'>
                            <Hash className='size-3 text-on-surface-variant' />
                            <p className='font-mono text-sm text-on-surface'>{product.handle}</p>
                          </div>
                        </div>
                        <div>
                          <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            Tipo de Producto
                          </Label>
                          <div className='mt-1 flex items-center gap-2'>
                            <Package className='size-3 text-on-surface-variant' />
                            <p className='text-sm font-medium text-on-surface'>{product.productType}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {product.descriptionHtml && (
                      <>
                        <Separator className='bg-outline-variant' />
                        <div>
                          <Label className='mb-3 block text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            Descripción
                          </Label>
                          <div
                            className="prose prose-sm prose-slate dark:prose-invert max-w-none 
                   prose-headings:text-foreground prose-p:text-muted-foreground 
                   prose-strong:text-foreground prose-code:text-foreground
                   prose-pre:bg-muted prose-pre:border"
                            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Galería de Imágenes - Más discreta */}
                {product.images.length > 0 && (
                  <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='flex items-center gap-2 text-on-surface'>
                        <ImageIcon className='size-5 text-success' />
                        Imágenes ({product.images.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='grid grid-cols-3 gap-3 md:grid-cols-4'>
                        {product.images.slice(0, 8).map((image, index) => (
                          <div key={index} className='group relative aspect-square'>
                            <img
                              src={image.url}
                              alt={image.altText ?? product.title}
                              className='h-full w-full rounded-lg object-cover shadow-elevation-1 transition-all duration-300 group-hover:shadow-elevation-2 group-hover:scale-105'
                            />
                            {index === 0 && (
                              <Badge className='absolute left-1 top-1 bg-primary text-primary-foreground text-xs px-1 py-0'>
                                1
                              </Badge>
                            )}
                          </div>
                        ))}

                        {/* Mostrar contador si hay más imágenes */}
                        {product.images.length > 8 && (
                          <div className='flex aspect-square items-center justify-center rounded-lg bg-surface-container-high border-2 border-dashed border-outline-variant'>
                            <div className='text-center'>
                              <p className='text-sm font-bold text-on-surface'>+{product.images.length - 8}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Detalles de la Obra */}
                {product.artworkDetails && (
                  <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                    <CardHeader className='pb-4'>
                      <CardTitle className='flex items-center gap-2 text-on-surface'>
                        <Palette className='size-5 text-secondary' />
                        Detalles de la Obra
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3'>
                      {product.artworkDetails.medium && (
                        <div className='flex items-center gap-2'>
                          <FileText className='size-4 text-on-surface-variant' />
                          <div>
                            <Label className='text-xs text-on-surface-variant'>Técnica</Label>
                            <p className='text-sm font-medium'>{product.artworkDetails.medium}</p>
                          </div>
                        </div>
                      )}
                      {product.artworkDetails.year && (
                        <div className='flex items-center gap-2'>
                          <Calendar className='size-4 text-on-surface-variant' />
                          <div>
                            <Label className='text-xs text-on-surface-variant'>Año</Label>
                            <p className='text-sm font-medium'>{product.artworkDetails.year}</p>
                          </div>
                        </div>
                      )}
                      {(product.artworkDetails.width || product.artworkDetails.height || product.artworkDetails.depth) && (
                        <div className='flex items-center gap-2'>
                          <Ruler className='size-4 text-on-surface-variant' />
                          <div>
                            <Label className='text-xs text-on-surface-variant'>Medidas (cm)</Label>
                            <p className='text-sm font-medium'>
                              {product.artworkDetails.height} x {product.artworkDetails.width} {product.artworkDetails.depth ? `x ${product.artworkDetails.depth}` : ''}
                            </p>
                          </div>
                        </div>
                      )}
                      {product.artworkDetails.serie && (
                        <div className='flex items-center gap-2'>
                          <ImageIcon className='size-4 text-on-surface-variant' />
                          <div>
                            <Label className='text-xs text-on-surface-variant'>Serie</Label>
                            <p className='text-sm font-medium'>{product.artworkDetails.serie}</p>
                          </div>
                        </div>
                      )}
                      {product.artworkDetails.location && (
                        <div className='flex items-center gap-2'>
                          <Warehouse className='size-4 text-on-surface-variant' />
                          <div>
                            <Label className='text-xs text-on-surface-variant'>Ubicación</Label>
                            <p className='text-sm font-medium'>{product.artworkDetails.location}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                  <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                    <CardHeader className='pb-4'>
                      <CardTitle className='flex items-center gap-2 text-on-surface'>
                        <Tag className='size-5' />
                        Tags
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant='tertiary-container' className='font-medium'>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className='space-y-6'>
                {/* Precio */}
                <Card className='border-primary/20 bg-primary-container shadow-elevation-2'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-primary-container'>
                      <DollarSign className='size-5' />
                      Precio
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='text-center'>
                      <div className='mb-1 text-3xl font-bold text-on-primary-container'>
                        {variant?.price ? formatCurrency(variant.price.amount, variant.price.currencyCode) : 'N/A'}
                      </div>
                    </div>
                    {variant?.sku && (
                      <div className='bg-card p-3 rounded-lg'>
                        <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          SKU
                        </Label>
                        <p className='mt-1 font-mono text-sm text-on-surface'>{variant.sku}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Inventario */}
                <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Inbox className='size-5 text-warning' />
                      Inventario
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Package className='size-4 text-on-surface-variant' />
                        <span className='text-sm font-medium'>Cantidad</span>
                      </div>
                      <span className='text-lg font-semibold'>{variant?.inventoryQuantity ?? 0}</span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Activity className='size-4 text-on-surface-variant' />
                        <span className='text-sm font-medium'>Estado</span>
                      </div>
                      <Badge variant={getAvailabilityVariant(variant?.availableForSale ?? false)}>
                        {variant?.availableForSale ? 'Disponible' : 'Agotado'}
                      </Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <Settings className='size-4 text-on-surface-variant' />
                        <span className='text-sm font-medium'>Gestión</span>
                      </div>
                      <span className='text-sm text-muted-foreground'>{variant?.inventoryManagement ?? 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Opciones Disponibles */}
                <Card>
                  <CardHeader>
                    <CardTitle>Opciones Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <AddOptionDropdown
                      options={techniques}
                      isLoading={isLoadingTechniques}
                      onAddNew={(name) => handleAddNewOption('techniques', name)}
                      placeholder='Seleccionar técnica'
                      label='Técnicas'
                    />

                    <AddOptionDropdown
                      options={artworkTypes}
                      isLoading={isLoadingArtworkTypes}
                      onAddNew={(name) => handleAddNewOption('artwork_types', name)}
                      placeholder='Seleccionar tipo de obra'
                      label='Tipos de Obra'
                    />

                    <AddOptionDropdown
                      options={locations}
                      isLoading={isLoadingLocations}
                      onAddNew={(name) => handleAddNewOption('locations', name)}
                      placeholder='Seleccionar ubicación'
                      label='Ubicaciones'
                    />
                  </CardContent>
                </Card>

                {/* Detalles Técnicos */}
                <Card className='border-outline-variant/20 shadow-elevation-1'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Settings className='size-5 text-on-surface-variant' />
                      Detalles Técnicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='p-3 bg-surface-container-lowest rounded-lg'>
                      <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        ID del Producto
                      </Label>
                      <p className='mt-1 break-all font-mono text-xs text-on-surface'>
                        {product.id.split('/').pop()}
                      </p>
                    </div>
                    {variant && (
                      <div className='p-3 bg-surface-container-lowest rounded-lg'>
                        <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          ID de Variante
                        </Label>
                        <p className='mt-1 break-all font-mono text-xs text-on-surface'>
                          {variant.id.split('/').pop()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}