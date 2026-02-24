'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { ImageUploader } from '@/components/Forms/ImageUploader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

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
  collectionId?: string
}

interface ProductFormDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (product: Omit<NewProduct, 'id'>) => void
  product?: NewProduct | null
  vendors: string[]
  techniques: { id: string; name: string }[]
  artworkTypes: { id: string; name: string }[]
  locations: { id: string; name: string }[]
  vendorsLoading: boolean
  techniquesLoading: boolean
  artworkTypesLoading: boolean
  locationsLoading: boolean
  isArtist?: boolean
  defaultVendor?: string
  collections: any[]
  collectionsLoading: boolean
}

const emptyProduct: Omit<NewProduct, 'id'> = {
  artworkDetails: {},
  collectionId: 'none',
  description: '',
  imageUrl: null,
  inventoryQuantity: 1,
  price: '0',
  productType: '',
  status: 'ACTIVE',
  tags: [],
  title: '',
  vendor: '',
}

export function ProductFormDialog({
  artworkTypes,
  artworkTypesLoading,
  collections,
  collectionsLoading,
  defaultVendor,
  isArtist = false,
  isOpen,
  locations,
  locationsLoading,
  onClose,
  onSave,
  product,
  techniques,
  techniquesLoading,
  vendors,
  vendorsLoading,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<Omit<NewProduct, 'id'>>(emptyProduct)

  useEffect(() => {
    if (isOpen) {
      if (product) {
        const { id, ...rest } = product
        setFormData(rest)
      } else {
        setFormData({
          ...emptyProduct,
          vendor: defaultVendor || '',
        })
      }
    }
  }, [isOpen, product, defaultVendor])

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido')
      return
    }
    if (!formData.vendor.trim()) {
      toast.error('El artista es requerido')
      return
    }
    if (!formData.productType.trim()) {
      toast.error('El tipo de obra es requerido')
      return
    }
    if (!formData.price || parseFloat(formData.price) < 0) {
      toast.error('El precio debe ser un número positivo')
      return
    }

    onSave(formData)
    onClose()
  }

  const handleCancel = () => {
    setFormData(emptyProduct)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Producto' : 'Agregar Nuevo Producto'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Modifica los campos del producto'
              : 'Completa los campos requeridos para agregar un nuevo producto a la lista'}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='image'>
              Imagen <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            <ImageUploader
              key={product?.id || `new-${isOpen}`}
              value={formData.imageUrl}
              onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='title'>
              Título <span className='text-red-500'>*</span>
            </Label>
            <Input
              id='title'
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder='Nombre de la obra'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='vendor'>
              Artista <span className='text-red-500'>*</span>
            </Label>
            {vendorsLoading ? (
              <Skeleton className='h-10 w-full' />
            ) : (
              <Select
                value={formData.vendor}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, vendor: value }))}
                disabled={isArtist}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar artista' />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor} value={vendor}>
                      {vendor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='productType'>
              Tipo de Obra <span className='text-red-500'>*</span>
            </Label>
            {artworkTypesLoading ? (
              <Skeleton className='h-10 w-full' />
            ) : (
              <Select
                value={formData.productType}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, productType: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar tipo' />
                </SelectTrigger>
                <SelectContent>
                  {artworkTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='price'>
                Precio <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='price'
                type='number'
                step='0.01'
                min='0'
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder='0.00'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='inventoryQuantity'>Cantidad en Inventario</Label>
              <Input
                id='inventoryQuantity'
                type='number'
                min='0'
                value={formData.inventoryQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, inventoryQuantity: parseInt(e.target.value) }))
                }
                placeholder='1'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='status'>Estado</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'ACTIVE' | 'DRAFT') =>
                setFormData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='DRAFT'>Borrador</SelectItem>
                <SelectItem value='ACTIVE'>Activo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='technique'>
              Técnica <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            {techniquesLoading ? (
              <Skeleton className='h-10 w-full' />
            ) : (
              <Select
                value={formData.artworkDetails.medium}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    artworkDetails: { ...prev.artworkDetails, medium: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar técnica' />
                </SelectTrigger>
                <SelectContent>
                  {techniques.map((technique) => (
                    <SelectItem key={technique.id} value={technique.name}>
                      {technique.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='year'>
              Año <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            <Input
              id='year'
              value={formData.artworkDetails.year || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  artworkDetails: { ...prev.artworkDetails, year: e.target.value || undefined },
                }))
              }
              placeholder='2024'
            />
          </div>

          <div className='space-y-2'>
            <Label>
              Dimensiones (cm) <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            <div className='grid grid-cols-3 gap-2'>
              <Input
                type='number'
                step='0.1'
                value={formData.artworkDetails.height || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    artworkDetails: { ...prev.artworkDetails, height: e.target.value || undefined },
                  }))
                }
                placeholder='Alto'
              />
              <Input
                type='number'
                step='0.1'
                value={formData.artworkDetails.width || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    artworkDetails: { ...prev.artworkDetails, width: e.target.value || undefined },
                  }))
                }
                placeholder='Ancho'
              />
              <Input
                type='number'
                step='0.1'
                value={formData.artworkDetails.depth || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    artworkDetails: { ...prev.artworkDetails, depth: e.target.value || undefined },
                  }))
                }
                placeholder='Prof.'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='serie'>
              Serie <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            <Input
              id='serie'
              value={formData.artworkDetails.serie || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  artworkDetails: { ...prev.artworkDetails, serie: e.target.value || undefined },
                }))
              }
              placeholder='Nombre de la serie'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='location'>
              Localización <span className='text-muted-foreground'>(opcional)</span>
            </Label>
            {locationsLoading ? (
              <Skeleton className='h-10 w-full' />
            ) : (
              <Select
                value={formData.artworkDetails.location}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    artworkDetails: { ...prev.artworkDetails, location: value },
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar localización' />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.name}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='collection'>Colección</Label>
            {collectionsLoading ? (
              <Skeleton className='h-10 w-full' />
            ) : (
              <Select
                value={formData.collectionId || 'none'}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, collectionId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Seleccionar colección' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>Ninguna</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={handleCancel}>
            <X className='mr-2 size-4' />
            Cancelar
          </Button>
          <Button onClick={handleSave}>{product ? 'Guardar Cambios' : 'Agregar a Lista'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
