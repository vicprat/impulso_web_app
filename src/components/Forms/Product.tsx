'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Save, X } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { type Product } from '@/models/Product'
import { type CreateProductPayload, type UpdateProductPayload } from '@/services/product/types'

import { Tiptap } from '../TipTap'
import { ImageUploader } from './ImageUploader'

const productFormSchema = z.object({
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
  vendor: z.string().optional(),
  width: z.string().optional(),
  year: z.string().optional(),
})

type ProductFormData = z.infer<typeof productFormSchema>

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

export function ProductForm({
  isLoading = false,
  mode,
  onCancel,
  onSave,
  product,
}: ProductFormProps) {
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [tagsArray, setTagsArray] = useState<string[]>([])

  const isEditing = mode === 'edit'
  const variant = product?.primaryVariant

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
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    const paragraphs = tempDiv.getElementsByTagName('p')
    return paragraphs.length > 0 ? (paragraphs[0].textContent ?? '') : ''
  }

  const form = useForm<ProductFormData>({
    defaultValues: {
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
      tags: product?.tags.join(', ') ?? '',
      title: product?.title ?? '',
      vendor: product?.vendor ?? '',
      width: product?.artworkDetails.width ?? '',
      year: product?.artworkDetails.year ?? '',
    },
    resolver: zodResolver(productFormSchema),
  })

  useEffect(() => {
    if (product?.tags) {
      setTagsArray(product.tags)
    }
  }, [product])

  const onSubmit = async (data: ProductFormData) => {
    if (isEditing) {
      const updatePayload: UpdateProductPayload = {
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
      onSave(updatePayload)
    } else {
      const createPayload: CreateProductPayload = {
        description: data.description ?? '',
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
        vendor: data.vendor,
      }

      onSave(createPayload)
    }
  }

  const handleTitleChange = (value: string) => {
    form.setValue('title', value)
    if (!isEditing && value) {
      const generatedHandle = generateHandle(value)
      form.setValue('handle', generatedHandle)
    }
  }

  const handleTagsChange = (value: string) => {
    form.setValue('tags', value)
    const newTagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    setTagsArray(newTagsArray)
  }

  const removeTag = (tagToRemove: string) => {
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
  }

  const handleUploadComplete = (resourceUrl: string) => {
    const newImage: NewImage = {
      mediaContentType: 'IMAGE',
      originalSource: resourceUrl,
    }
    setNewImages((prev) => {
      const updated = [...prev, newImage]
      return updated
    })
  }

  return (
    <div className='space-y-6'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Editar Información Básica' : 'Información Básica'}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? 'Modifica los detalles principales del producto'
                  : 'Completa los detalles principales de tu nueva obra'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Título de la obra'
                          {...field}
                          onChange={(e) => handleTitleChange(e.target.value)}
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
                        <FormLabel>Handle (URL)</FormLabel>
                        <FormControl>
                          <Input placeholder='url-de-la-obra' {...field} disabled />
                        </FormControl>
                        <FormDescription>
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
                      <FormLabel>Artista</FormLabel>
                      <FormControl>
                        <Input placeholder='Nombre del artista' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='productType'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Producto</FormLabel>
                      <FormControl>
                        <Input placeholder='ej: Pintura, Escultura, etc.' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Selecciona un estado' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='ACTIVE'>Activo (Visible en tienda)</SelectItem>
                          <SelectItem value='DRAFT'>Borrador (Oculto)</SelectItem>
                          {isEditing && <SelectItem value='ARCHIVED'>Archivado</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Tiptap.Editor
                        content={field.value ?? ''}
                        onChange={(content) => field.onChange(content)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Obra</CardTitle>
              <CardDescription>Información específica sobre la obra de arte</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='medium'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Técnica</FormLabel>
                      <FormControl>
                        <Input placeholder='ej: Óleo sobre tela, Acrílico, etc.' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='year'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Año</FormLabel>
                      <FormControl>
                        <Input placeholder='ej: 2024' {...field} />
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
                      <FormLabel>Serie</FormLabel>
                      <FormControl>
                        <Input placeholder='ej: Colección Primavera' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='location'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localización</FormLabel>
                      <FormControl>
                        <Input placeholder='ej: Ciudad de México' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Medidas */}
              <Separator />
              <div>
                <Label className='mb-3 block text-sm font-medium'>Medidas (cm)</Label>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <FormField
                    control={form.control}
                    name='height'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura</FormLabel>
                        <FormControl>
                          <Input type='number' step='0.1' placeholder='0.0' {...field} />
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
                        <FormLabel>Ancho</FormLabel>
                        <FormControl>
                          <Input type='number' step='0.1' placeholder='0.0' {...field} />
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
                        <FormLabel>Profundidad</FormLabel>
                        <FormControl>
                          <Input type='number' step='0.1' placeholder='0.0' {...field} />
                        </FormControl>
                        <FormDescription>Para obras con volumen</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
              <CardDescription>Etiquetas para categorizar tu obra</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <FormField
                control={form.control}
                name='tags'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (separados por comas)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Arte Contemporáneo, Disponible, Óleo'
                        {...field}
                        onChange={(e) => handleTagsChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {tagsArray.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {tagsArray.map((tag, index) => (
                    <Badge key={index} variant='secondary' className='flex items-center gap-1'>
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
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precio e Inventario</CardTitle>
              <CardDescription>Establece el precio e inventario inicial de tu obra</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='price'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio (MXN) *</FormLabel>
                      <FormControl>
                        <Input type='number' step='0.01' placeholder='0.00' {...field} />
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
                      <FormLabel>Inventario *</FormLabel>
                      <FormControl>
                        <Input type='number' min='0' placeholder='1' {...field} />
                      </FormControl>
                      <FormDescription>Cantidad disponible en inventario</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isEditing && variant && (
                  <div className='space-y-4'>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        SKU Actual
                      </Label>
                      <p className='rounded-md border bg-muted px-3 py-2 text-sm'>
                        {variant.sku ?? 'Sin SKU'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-sm font-medium text-muted-foreground'>
                        Título de Variante
                      </Label>
                      <p className='rounded-md border bg-muted px-3 py-2 text-sm'>
                        {variant.title || 'Sin título'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Imágenes</CardTitle>
              <CardDescription>
                {isEditing ? 'Gestiona las imágenes del producto' : 'Agrega imágenes de tu obra'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {isEditing && product.images.length > 0 && (
                <>
                  <div>
                    <Label className='mb-3 block text-sm font-medium'>Imágenes Actuales</Label>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                      {product.images.map((img, index) => (
                        <div key={index} className='space-y-2'>
                          <div className='relative aspect-square'>
                            <Image
                              src={img.url}
                              alt={img.altText ?? product.title}
                              fill
                              className='rounded-md object-cover'
                            />
                            {index === 0 && (
                              <Badge className='absolute left-1 top-1' variant='default'>
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className='text-center text-xs text-muted-foreground'>
                            {img.altText ?? 'Sin texto alternativo'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              <div>
                <Label className='mb-3 block text-sm font-medium'>
                  {isEditing ? 'Agregar Nuevas Imágenes' : 'Imágenes de la Obra'}
                </Label>
                <ImageUploader onUploadComplete={handleUploadComplete} />

                {!isEditing && newImages.length === 0 && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    Es recomendable agregar al menos una imagen de tu obra.
                  </p>
                )}

                {newImages.length > 0 && (
                  <div className='mt-4'>
                    <Label className='text-sm font-medium text-green-600'>
                      Nuevas imágenes que se agregarán ({newImages.length})
                    </Label>
                    <p className='mt-1 text-xs text-muted-foreground'>
                      Estas imágenes se procesarán al guardar el producto
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isEditing && (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4'>
              <h4 className='mb-2 text-sm font-medium text-yellow-800'>Nota sobre la edición</h4>
              <ul className='space-y-1 text-xs text-yellow-700'>
                <li>• El handle (URL) no se puede cambiar una vez creado el producto</li>
                <li>• Las imágenes nuevas se agregarán a las existentes</li>
                <li>• Los cambios de inventario y precio se procesan por separado</li>
                <li>• Los detalles de la obra se guardan como metafields en Shopify</li>
              </ul>
            </div>
          )}

          <div className='flex justify-end space-x-4 pt-6'>
            <Button type='button' variant='outline' onClick={onCancel}>
              <X className='mr-2 size-4' />
              Cancelar
            </Button>
            <Button type='submit' disabled={isLoading}>
              <Save className='mr-2 size-4' />
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Obra'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
