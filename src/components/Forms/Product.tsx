'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Calendar,
  Check,
  ChevronsUpDown,
  DollarSign,
  Hash,
  Image as ImageIcon,
  Package,
  Palette,
  Ruler,
  Save,
  Tag,
  User,
  Warehouse,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type Product } from '@/models/Product'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCollections } from '@/services/collection/hooks'
import {
  useGetArtworkTypes,
  useGetLocations,
  useGetTechniques,
  useGetVendors,
} from '@/services/product/hook'
import { type CreateProductPayload, type UpdateProductPayload } from '@/services/product/types'

import { Tiptap } from '../TipTap'
import { MultiImageUploader } from './MultiImageUploader'

// Componente para dropdown con opción de agregar nueva
const AddOptionSelect = ({
  icon: Icon,
  isLoading,
  label,
  onAddNew,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  options: { id: string; name: string }[]
  isLoading: boolean
  onAddNew: (name: string) => Promise<void>
  placeholder: string
  label: string
  value?: string
  onValueChange: (value: string) => void
  icon?: React.ComponentType<{ className?: string }>
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newValue, setNewValue] = useState('')

  const handleAddNew = async () => {
    if (!newValue.trim()) return

    try {
      setIsAdding(true)
      await onAddNew(newValue.trim())
      setNewValue('')
      // No llamar onValueChange aquí para evitar el bucle infinito
      // El usuario puede seleccionar manualmente la nueva opción
    } catch (error) {
      console.error('Error al agregar opción:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setNewValue('')
  }

  return (
    <div className='space-y-3'>
      <Label className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
        {Icon && <Icon className='size-3' />}
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className='bg-surface-container-low hover:bg-surface-container'>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.name}>
              {option.name}
            </SelectItem>
          ))}
          <Separator />
          <div
            className='p-2'
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center gap-2'>
              <Input
                placeholder='Agregar nuevo...'
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation()
                }}
                onKeyUp={(e) => {
                  e.stopPropagation()
                }}
                onClick={(e) => {
                  e.stopPropagation()
                }}
                onFocus={(e) => {
                  e.stopPropagation()
                }}
                className='h-8'
                disabled={isAdding}
              />
              <Button
                type='button'
                size='sm'
                onClick={(e) => {
                  e.stopPropagation()
                  void handleAddNew()
                }}
                disabled={!newValue.trim() || isAdding}
              >
                {isAdding ? 'Agregando...' : 'Agregar'}
              </Button>
              {newValue && (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCancel()
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </SelectContent>
      </Select>
    </div>
  )
}

// Componente para vendor con combobox (permite selección y escritura libre)
const VendorCombobox = ({
  disabled = false,
  isLoading,
  onValueChange,
  value,
  vendors,
}: {
  vendors?: string[]
  isLoading: boolean
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  // Actualizar inputValue cuando cambie el value
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue)
    setInputValue(selectedValue)
    setOpen(false)
  }

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    onValueChange(newValue)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'w-full justify-between bg-surface-container-low hover:bg-surface-container',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          disabled={disabled}
        >
          {value || 'Seleccionar artista...'}
          <ChevronsUpDown className='ml-2 size-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-full p-0'>
        <Command>
          <CommandInput
            placeholder='Buscar o escribir artista...'
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            <CommandEmpty>No se encontraron artistas.</CommandEmpty>
            <CommandGroup>
              {isLoading ? (
                <CommandItem disabled>Cargando artistas...</CommandItem>
              ) : (
                vendors?.map((vendor) => (
                  <CommandItem key={vendor} value={vendor} onSelect={() => handleSelect(vendor)}>
                    <Check
                      className={cn('mr-2 size-4', value === vendor ? 'opacity-100' : 'opacity-0')}
                    />
                    {vendor}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Función para crear el esquema de validación dinámicamente
const createProductFormSchema = (isArtist: boolean) =>
  z.object({
    collectionId: z.string().optional(),
    depth: z.string().optional(),
    description: z.string().optional(),
    handle: z.string().min(3, 'El handle debe tener al menos 3 caracteres').optional(),
    height: z.string().optional(),
    inventoryQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: 'Debe ser un número entero mayor o igual a 0',
    }),
    location: z.string().optional(),
    medium: z.string().optional(),
    price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Debe ser un número válido mayor o igual a 0',
    }),
    productType: z.string().optional(),
    serie: z.string().optional(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']),
    tags: z.string(),
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
    vendor: isArtist ? z.string().min(1, 'El campo artista es requerido') : z.string().optional(),
    width: z.string().optional(),
    year: z.string().optional(),
  })

type ProductFormData = z.infer<ReturnType<typeof createProductFormSchema>>

interface BaseProductFormProps {
  onCancel: () => void
  isLoading?: boolean
}

interface CreateProductFormProps extends BaseProductFormProps {
  mode: 'create'
  product?: never
  onSave: (payload: CreateProductPayload) => void
}

interface EditProductFormProps extends BaseProductFormProps {
  mode: 'edit'
  product: Product
  onSave: (payload: UpdateProductPayload) => void
}

type ProductFormProps = CreateProductFormProps | EditProductFormProps

interface NewImage {
  mediaContentType: 'IMAGE'
  originalSource: string
}

interface ImageData {
  id: string
  url: string
  altText?: string
  isPrimary?: boolean
  isNew?: boolean
  filename?: string
  size?: number
  status?: 'uploading' | 'completed' | 'error'
  mediaId?: string // MediaImage ID para eliminación
}

export function ProductForm({
  isLoading = false,
  mode,
  onCancel,
  onSave,
  product,
}: ProductFormProps) {
  const { hasRole, user } = useAuth()
  const { data: vendors, isLoading: vendorsLoading } = useGetVendors()
  const [allImages, setAllImages] = useState<ImageData[]>([])
  const [tagsArray, setTagsArray] = useState<string[]>([])
  const queryClient = useQueryClient()

  const isEditing = mode === 'edit'
  const variant = product?.variants && product.variants.length > 0 ? product.variants[0] : undefined

  // Determinar si el usuario puede cambiar el vendor
  const canChangeVendor = hasRole('admin') || hasRole('super_admin')
  const isArtist = hasRole('artist')

  // Valor por defecto del vendor para artistas
  const defaultVendor = isArtist && user?.artist?.name ? user.artist.name : ''

  // Inicializar imágenes existentes cuando el producto cambie
  useEffect(() => {
    if (product?.media) {
      const existingImages: ImageData[] = product.media
        .filter((node) => node.mediaContentType === 'IMAGE' && node.image?.url && node.image?.id)
        .map((node, index) => ({
          altText: node.image!.altText ?? undefined,
          id: node.image!.id,

          // La primera imagen es la principal
          isNew: false,

          isPrimary: index === 0,

          mediaId: node.id,
          // ProductImage ID (para compatibilidad)
          url: node.image!.url, // MediaImage ID (para eliminación)
        }))
      setAllImages(existingImages)
    } else {
      setAllImages([])
    }
  }, [product?.media])

  // Hooks para obtener las opciones
  const { data: techniques = [], isLoading: isLoadingTechniques } = useGetTechniques()
  const { data: artworkTypes = [], isLoading: isLoadingArtworkTypes } = useGetArtworkTypes()
  const { data: locations = [], isLoading: isLoadingLocations } = useGetLocations()

  // Obtener todas las colecciones (solo manuales)
  const { data: collectionsData, isLoading: isLoadingCollections } = useCollections({ limit: 250 })
  const allCollections = collectionsData?.collections ?? []
  const collectionsList = allCollections.filter(
    (collection: any) => !collection.ruleSet || collection.ruleSet.rules?.length === 0
  )

  // Función para agregar nuevas opciones
  const handleAddNewOption = useCallback(
    async (optionType: string, name: string) => {
      const response = await fetch(`/api/options/${optionType}`, {
        body: JSON.stringify({ name }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar la opción')
      }

      // Invalidar las queries para refrescar las opciones
      await queryClient.invalidateQueries({ queryKey: ['techniques'] })
      await queryClient.invalidateQueries({ queryKey: ['artwork_types'] })
      await queryClient.invalidateQueries({ queryKey: ['locations'] })
    },
    [queryClient]
  )

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const extractDescription = (html: string | undefined): string => {
    if (!html) return ''
    return html
  }

  const form = useForm<ProductFormData>({
    defaultValues: {
      collectionId: product?.collections?.[0]?.id ?? 'none',
      depth: product?.artworkDetails.depth ?? '',
      description: extractDescription(product?.descriptionHtml),
      handle: product?.handle ?? '',
      height: product?.artworkDetails.height ?? '',
      inventoryQuantity: (variant?.inventoryQuantity ?? 1).toString(),
      location: product?.artworkDetails.location ?? '',
      medium: product?.artworkDetails.medium ?? '',
      price: variant?.price.amount ?? '0.00',
      productType: product?.productType ?? '',
      serie: product?.artworkDetails.serie ?? '',
      status: product?.status ?? 'DRAFT',
      tags: product?.manualTags.join(', ') ?? '',
      title: product?.title ?? '',
      vendor: isArtist ? defaultVendor : (product?.vendor ?? ''),
      width: product?.artworkDetails.width ?? '',
      year: product?.artworkDetails.year ?? '',
    },
    resolver: zodResolver(createProductFormSchema(isArtist)),
  })

  useEffect(() => {
    if (product?.tags) {
      setTagsArray(product.tags)
    }
  }, [product])

  // Actualizar el vendor cuando el usuario se cargue completamente (especialmente para artistas)
  useEffect(() => {
    if (isArtist && user?.artist?.name && !isEditing) {
      form.setValue('vendor', user.artist.name)
    }
  }, [isArtist, user?.artist?.name, isEditing, form])

  // Reinicializar el formulario cuando cambie el rol del usuario (para actualizar la validación)
  useEffect(() => {
    form.clearErrors()
  }, [isArtist, form])

  const onSubmit = async (data: ProductFormData) => {
    if (isEditing && product) {
      // Obtener las imágenes originales del producto
      const originalImages = product.media || []

      // Identificar imágenes que fueron eliminadas usando mediaId
      const remainingMediaIds = allImages
        .filter((img) => !img.isNew)
        .map((img) => img.mediaId)
        .filter((id) => id?.startsWith('gid://')) // Solo IDs válidos de MediaImage

      // Solo eliminar imágenes que realmente existen en el producto actual
      const deletedMediaIds = originalImages
        .filter((node) => node.mediaContentType === 'IMAGE' && node.image?.url)
        .filter((node) => !remainingMediaIds.includes(node.id))
        .map((node) => node.id)
        .filter((id) => id)

      // Convertir ImageData a NewImage para el payload
      const newImages: NewImage[] = allImages
        .filter((img) => img.isNew)
        .map((img) => ({
          mediaContentType: 'IMAGE' as const,
          originalSource: img.url,
        }))

      const updatePayload: UpdateProductPayload = {
        collectionId: data.collectionId === 'none' ? undefined : data.collectionId,
        description: data.description,
        details: {
          artist: data.vendor ?? null,
          depth: data.depth ?? null,
          height: data.height ?? null,
          location: data.location ?? null,
          medium: data.medium ?? null,
          serie: data.serie ?? null,
          width: data.width ?? null,
          year: data.year ?? null,
        },

        id: product.id,

        // Solo enviar nuevas imágenes si hay nuevas imágenes para agregar
        images: newImages.length > 0 ? newImages : undefined,

        // Solo enviar imágenes a eliminar si hay imágenes para eliminar
        imagesToDelete: deletedMediaIds.length > 0 ? deletedMediaIds : undefined,

        inventoryQuantity: data.inventoryQuantity ? parseInt(data.inventoryQuantity) : undefined,

        price: data.price,

        productType: data.productType,

        status: data.status as 'ACTIVE' | 'DRAFT',

        tags: data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),

        title: data.title,

        vendor: data.vendor,
      }
      ;(onSave as (payload: UpdateProductPayload) => void)(updatePayload)
    } else {
      // Convertir ImageData a NewImage para el payload
      const newImages: NewImage[] = allImages.map((img) => ({
        mediaContentType: 'IMAGE' as const,
        originalSource: img.url,
      }))

      // Asegurar que el vendor se establezca para artistas
      const vendorValue = isArtist && user?.artist?.name ? user.artist.name : data.vendor

      const createPayload: CreateProductPayload = {
        collectionId: data.collectionId === 'none' ? undefined : data.collectionId,
        description: data.description ?? '',
        details: {
          artist: vendorValue ?? null,
          depth: data.depth ?? null,
          height: data.height ?? null,
          location: data.location ?? null,
          medium: data.medium ?? null,
          serie: data.serie ?? null,
          width: data.width ?? null,
          year: data.year ?? null,
        },
        images: newImages.length > 0 ? newImages : undefined,
        inventoryQuantity: parseInt(data.inventoryQuantity),
        price: data.price,
        productType: data.productType ?? '',
        status: data.status as 'ACTIVE' | 'DRAFT',
        tags: data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        title: data.title,
        vendor: vendorValue,
      }

      ;(onSave as (payload: CreateProductPayload) => void)(createPayload)
    }
  }

  const handleImagesChange = useCallback((images: ImageData[]) => {
    setAllImages(images)
  }, [])

  const handleTitleChange = useCallback(
    (value: string) => {
      form.setValue('title', value)
      if (!isEditing && value) {
        const generatedHandle = generateHandle(value)
        form.setValue('handle', generatedHandle)
      }
    },
    [form, isEditing]
  )

  const handleTagsChange = useCallback(
    (value: string) => {
      form.setValue('tags', value)
      const newTagsArray = value
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
      setTagsArray(newTagsArray)
    },
    [form]
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const currentTags = form.getValues('tags')
      const updatedTags = currentTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag !== tagToRemove && tag.length > 0)
        .join(', ')
      form.setValue('tags', updatedTags)
      setTagsArray(
        updatedTags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      )
    },
    [form]
  )

  return (
    <div>
      <div className='space-y-8'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* Información Básica */}
            <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-on-surface'>
                  <Box className='size-5 text-primary' />
                  {isEditing ? 'Editar Información Básica' : 'Información Básica'}
                </CardTitle>
                <CardDescription className='text-on-surface-variant'>
                  {isEditing
                    ? 'Modifica los detalles principales del producto'
                    : 'Completa los detalles principales de tu nueva obra'}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          <Package className='size-3' />
                          Título *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Título de la obra'
                            {...field}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className='bg-surface-container-low hover:bg-surface-container'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isEditing && (
                    <FormField
                      control={form.control}
                      name='handle'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            <Hash className='size-3' />
                            Handle (URL)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder='url-de-la-obra'
                              {...field}
                              disabled
                              className='bg-surface-container-lowest'
                            />
                          </FormControl>
                          <FormDescription className='text-on-surface-variant'>
                            Se genera automáticamente desde el título.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name='vendor'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          <User className='size-3' />
                          Artista
                        </FormLabel>
                        <FormControl>
                          {canChangeVendor ? (
                            <VendorCombobox
                              vendors={vendors}
                              isLoading={vendorsLoading}
                              value={field.value || ''}
                              onValueChange={field.onChange}
                            />
                          ) : (
                            <Input
                              value={field.value}
                              onChange={field.onChange}
                              placeholder='Nombre del artista'
                              className='bg-surface-container-low hover:bg-surface-container'
                              disabled
                            />
                          )}
                        </FormControl>
                        {!canChangeVendor && (
                          <p className='text-xs text-muted-foreground'>
                            Solo administradores pueden cambiar el artista
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='productType'
                    render={({ field }) => (
                      <AddOptionSelect
                        options={artworkTypes}
                        isLoading={isLoadingArtworkTypes}
                        onAddNew={(name) => handleAddNewOption('artwork_types', name)}
                        placeholder='Seleccionar tipo de obra'
                        label='Tipo de Producto'
                        value={field.value}
                        onValueChange={field.onChange}
                        icon={Package}
                      />
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='status'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          <Box className='size-3' />
                          Estado *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className='bg-surface-container-low hover:bg-surface-container'>
                              <SelectValue placeholder='Selecciona un estado' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='ACTIVE'>
                              <div className='flex items-center gap-2'>
                                <div className='size-2 rounded-full bg-green-500'></div>
                                Activo (Visible en tienda)
                              </div>
                            </SelectItem>
                            <SelectItem value='DRAFT'>
                              <div className='flex items-center gap-2'>
                                <div className='size-2 rounded-full bg-yellow-500'></div>
                                Borrador (Oculto)
                              </div>
                            </SelectItem>
                            {isEditing && (
                              <SelectItem value='ARCHIVED'>
                                <div className='flex items-center gap-2'>
                                  <div className='size-2 rounded-full bg-red-500'></div>
                                  Archivado
                                </div>
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='collectionId'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          <Tag className='size-3' />
                          Colección
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || 'none'}
                          disabled={isLoadingCollections}
                        >
                          <FormControl>
                            <SelectTrigger className='bg-surface-container-low hover:bg-surface-container'>
                              <SelectValue placeholder='Selecciona una colección' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='none'>Ninguna</SelectItem>
                            {collectionsList.map((collection: any) => (
                              <SelectItem key={collection.id} value={collection.id}>
                                {collection.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Precio e Inventario */}
                <Card className='border-primary/20 bg-primary-container shadow-elevation-2'>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-primary-container'>
                      <DollarSign className='size-5' />
                      Precio e Inventario
                    </CardTitle>
                    <CardDescription className='text-on-primary-container/70'>
                      Establece el precio e inventario inicial de tu obra
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='price'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-primary-container'>
                              <DollarSign className='size-3' />
                              Precio (MXN) *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                step='0.01'
                                placeholder='0.00'
                                {...field}
                                className='bg-card text-on-surface'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='inventoryQuantity'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-primary-container'>
                              <Package className='size-3' />
                              Inventario *
                            </FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min='0'
                                placeholder='1'
                                {...field}
                                className='bg-card text-on-surface'
                              />
                            </FormControl>
                            <FormDescription className='text-on-primary-container/70'>
                              Cantidad disponible en inventario
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isEditing && variant && (
                        <div className='col-span-full grid grid-cols-1 gap-4 md:grid-cols-2'>
                          <div className='rounded-lg bg-card p-4'>
                            <Label className='text-sm font-medium text-on-surface-variant'>
                              SKU Actual
                            </Label>
                            <p className='mt-1 font-mono text-sm text-on-surface'>
                              {variant.sku ?? 'Sin SKU'}
                            </p>
                          </div>
                          <div className='rounded-lg bg-card p-4'>
                            <Label className='text-sm font-medium text-on-surface-variant'>
                              Título de Variante
                            </Label>
                            <p className='mt-1 text-sm text-on-surface'>
                              {variant.title || 'Sin título'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Separator className='bg-outline-variant' />

                {/* Detalles de la Obra */}
                <div>
                  <CardHeader className='pb-4'>
                    <CardTitle className='flex items-center gap-2 text-on-surface'>
                      <Palette className='size-5 text-secondary' />
                      Detalles de la Obra
                    </CardTitle>
                    <CardDescription className='text-on-surface-variant'>
                      Información específica sobre la obra de arte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='medium'
                        render={({ field }) => (
                          <AddOptionSelect
                            options={techniques}
                            isLoading={isLoadingTechniques}
                            onAddNew={(name) => handleAddNewOption('techniques', name)}
                            placeholder='Seleccionar técnica'
                            label='Técnica'
                            value={field.value}
                            onValueChange={field.onChange}
                            icon={Palette}
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='year'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                              <Calendar className='size-3' />
                              Año
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='ej: 2024'
                                {...field}
                                className='bg-surface-container-low hover:bg-surface-container'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='serie'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                              <ImageIcon className='size-3' />
                              Serie
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='ej: Colección Primavera'
                                {...field}
                                className='bg-surface-container-low hover:bg-surface-container'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='location'
                        render={({ field }) => (
                          <AddOptionSelect
                            options={locations}
                            isLoading={isLoadingLocations}
                            onAddNew={(name) => handleAddNewOption('locations', name)}
                            placeholder='Seleccionar ubicación'
                            label='Localización'
                            value={field.value}
                            onValueChange={field.onChange}
                            icon={Warehouse}
                          />
                        )}
                      />
                    </div>

                    <Separator className='bg-outline-variant' />

                    <div>
                      <Label className='mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        <Ruler className='size-3' />
                        Medidas (cm)
                      </Label>
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <FormField
                          control={form.control}
                          name='height'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-sm font-medium text-on-surface'>
                                Altura
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.1'
                                  placeholder='0.0'
                                  {...field}
                                  className='bg-surface-container-low hover:bg-surface-container'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='width'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-sm font-medium text-on-surface'>
                                Ancho
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.1'
                                  placeholder='0.0'
                                  {...field}
                                  className='bg-surface-container-low hover:bg-surface-container'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name='depth'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className='text-sm font-medium text-on-surface'>
                                Profundidad
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  step='0.1'
                                  placeholder='0.0'
                                  {...field}
                                  className='bg-surface-container-low hover:bg-surface-container'
                                />
                              </FormControl>
                              <FormDescription className='text-on-surface-variant'>
                                Para obras con volumen
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <Separator className='bg-outline-variant' />

                {/* Descripción e Imágenes en Flexbox */}
                <div className='flex flex-col gap-6 lg:flex-row'>
                  {/* Descripción - Lado Izquierdo */}
                  <div className='flex-1'>
                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                            Descripción
                          </FormLabel>
                          <FormControl>
                            <div className='border-outline-variant/20 min-h-[300px] rounded-lg border bg-surface-container-low p-1'>
                              <Tiptap.Editor
                                content={field.value ?? ''}
                                onChange={(content) => field.onChange(content)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Imágenes - Lado Derecho */}
                  <div className='w-full lg:w-1/3'>
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <ImageIcon className='size-4 text-success' />
                        <Label className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                          {isEditing ? 'Gestionar Imágenes' : 'Imágenes de la Obra'}
                        </Label>
                      </div>

                      <div>
                        <Label className='mb-2 block text-xs text-on-surface-variant'>
                          {isEditing ? 'Gestionar Imágenes' : 'Subir Imágenes'}
                        </Label>
                        <div className='border-outline-variant/20 rounded-lg border bg-surface-container-lowest p-3'>
                          <MultiImageUploader
                            existingImages={allImages}
                            onImagesChange={handleImagesChange}
                          />
                        </div>

                        {!isEditing && allImages.length === 0 && (
                          <p className='mt-2 text-xs text-on-surface-variant'>
                            Recomendable: al menos 1 imagen
                          </p>
                        )}

                        {allImages.filter((img) => img.isNew).length > 0 && (
                          <div className='border-success/20 mt-3 rounded-md border bg-success-container p-3'>
                            <p className='text-xs font-medium text-on-success-container'>
                              {allImages.filter((img) => img.isNew).length} nueva
                              {allImages.filter((img) => img.isNew).length !== 1 ? 's' : ''} imagen
                              {allImages.filter((img) => img.isNew).length !== 1 ? 'es' : ''}
                            </p>
                            <p className='text-on-success-container/70 text-xs'>
                              Se procesarán al guardar
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className='border-outline-variant/20 bg-card shadow-elevation-1'>
              <CardHeader className='pb-4'>
                <CardTitle className='flex items-center gap-2 text-on-surface'>
                  <Tag className='size-5' />
                  Tags
                </CardTitle>
                <CardDescription className='text-on-surface-variant'>
                  Etiquetas para categorizar tu obra
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='tags'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                        Tags (separados por comas)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Arte Contemporáneo, Disponible, Óleo'
                          {...field}
                          onChange={(e) => handleTagsChange(e.target.value)}
                          className='bg-surface-container-low hover:bg-surface-container'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {tagsArray.length > 0 && (
                  <div className='border-outline-variant/20 rounded-lg border bg-surface-container-lowest p-4'>
                    <Label className='mb-3 block text-xs font-medium uppercase tracking-wide text-on-surface-variant'>
                      Vista Previa de Tags
                    </Label>
                    <div className='flex flex-wrap gap-2'>
                      {tagsArray.map((tag, index) => (
                        <Badge
                          key={index}
                          variant='tertiary-container'
                          className='flex items-center gap-1 font-medium'
                        >
                          {tag}
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='size-4 p-0 hover:bg-destructive hover:text-destructive-foreground'
                            onClick={() => removeTag(tag)}
                          >
                            <X className='size-3' />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Nota de edición */}
            {isEditing && (
              <Card className='border-warning/20 bg-warning-container shadow-elevation-1'>
                <CardContent className='p-6'>
                  <h4 className='mb-3 flex items-center gap-2 text-sm font-medium text-on-warning-container'>
                    <Box className='size-4' />
                    Nota sobre la edición
                  </h4>
                  <ul className='text-on-warning-container/80 space-y-2 text-sm'>
                    <li className='flex items-start gap-2'>
                      <div className='bg-on-warning-container/60 mt-1.5 size-1.5 rounded-full' />
                      El handle (URL) no se puede cambiar una vez creado el producto
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='bg-on-warning-container/60 mt-1.5 size-1.5 rounded-full' />
                      Las imágenes nuevas se agregarán a las existentes
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='bg-on-warning-container/60 mt-1.5 size-1.5 rounded-full' />
                      Los cambios de inventario y precio se procesan por separado
                    </li>
                    <li className='flex items-start gap-2'>
                      <div className='bg-on-warning-container/60 mt-1.5 size-1.5 rounded-full' />
                      Los detalles de la obra se guardan como metafields en Shopify
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Botones de acción */}
            <div>
              <CardContent className='p-6'>
                <div className='flex justify-end space-x-4'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={onCancel}
                    className='bg-surface-container-low hover:bg-surface-container'
                  >
                    <X className='mr-2 size-4' />
                    Cancelar
                  </Button>
                  <Button
                    type='submit'
                    disabled={isLoading}
                    className='hover:bg-primary/90 bg-primary'
                  >
                    <Save className='mr-2 size-4' />
                    {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Obra'}
                  </Button>
                </div>
              </CardContent>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
