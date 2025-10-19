'use client'

import { Plus, Search as SearchIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useAddProductsToCollection } from '@/services/collection/hooks'
import { useGetProductsPaginated } from '@/services/product/hook'

import type { Product } from '@/models/Product'

interface AddProductsModalProps {
  isOpen: boolean
  onClose: () => void
  collectionId: string
  collectionTitle: string
  existingProductIds: Set<string>
  onSuccess: () => void
  isSmartCollection?: boolean
}

export function AddProductsModal({
  collectionId,
  collectionTitle,
  existingProductIds,
  isOpen,
  isSmartCollection = false,
  onClose,
  onSuccess,
}: AddProductsModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const {
    data: productsData,
    error,
    isLoading,
  } = useGetProductsPaginated({
    limit: 100,
    search: debouncedSearchTerm,
  })

  const addProductsMutation = useAddProductsToCollection({
    onError: (error: Error & { details?: { message?: string }[] }) => {
      if (
        error?.details?.some((detail) =>
          detail.message?.includes("Can't manually add products to a smart collection")
        )
      ) {
        toast.error(
          'Esta es una colección inteligente. Los productos se agregan automáticamente según las reglas definidas.'
        )
      } else {
        toast.error(`Error al agregar productos: ${error.message}`)
      }
    },
    onSuccess: () => {
      toast.success(`${selectedProducts.size} productos agregados a la colección exitosamente`)
      setSelectedProducts(new Set())
      onSuccess()
      onClose()
    },
  })

  const handleProductToggle = (productId: string) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleAddProducts = () => {
    if (selectedProducts.size === 0) {
      toast.warning('Selecciona al menos un producto')
      return
    }

    addProductsMutation.mutate({
      collectionId: collectionId.split('/').pop() ?? '',
      productIds: Array.from(selectedProducts),
    })
  }

  const handleSelectAll = () => {
    const availableProducts = products.filter((p) => !existingProductIds.has(p.id))
    setSelectedProducts(new Set(availableProducts.map((p) => p.id)))
  }

  const handleDeselectAll = () => {
    setSelectedProducts(new Set())
  }

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setSelectedProducts(new Set())
    }
  }, [isOpen])

  const products = productsData?.products ?? []
  const availableProducts = products.filter((p) => !existingProductIds.has(p.id))
  const productsInCollection = products.filter((p) => existingProductIds.has(p.id))

  if (isSmartCollection) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Colección Inteligente</DialogTitle>
            <DialogDescription>
              Esta es una colección inteligente. Los productos se agregan automáticamente según las
              reglas definidas.
            </DialogDescription>
          </DialogHeader>
          <div className='rounded-md bg-blue-50 p-4 text-sm text-blue-800'>
            <p className='font-medium'>No puedes agregar productos manualmente</p>
            <p className='mt-1 text-xs text-blue-600'>
              Los productos en esta colección se gestionan automáticamente según las reglas que
              hayas configurado.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant='outline'>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex max-h-[85vh] max-w-5xl flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle>Agregar Productos - {collectionTitle}</DialogTitle>
          <DialogDescription>
            Selecciona productos de tu inventario para agregar a esta colección
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
          <div className='flex items-center justify-between space-x-4'>
            <div className='relative flex-1'>
              <Label htmlFor='search' className='sr-only'>
                Buscar productos
              </Label>
              <SearchIcon className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                id='search'
                placeholder='Buscar por título, artista...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
            {availableProducts.length > 0 && (
              <div className='flex space-x-2'>
                {selectedProducts.size > 0 ? (
                  <Button onClick={handleDeselectAll} variant='outline' size='sm'>
                    <X className='mr-2 size-4' />
                    Deseleccionar Todo
                  </Button>
                ) : (
                  <Button onClick={handleSelectAll} variant='outline' size='sm'>
                    Seleccionar Todos ({availableProducts.length})
                  </Button>
                )}
              </div>
            )}
          </div>

          {selectedProducts.size > 0 && (
            <div className='flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm text-blue-800'>
              <span className='font-medium'>{selectedProducts.size} productos seleccionados</span>
              <Button
                onClick={handleAddProducts}
                disabled={addProductsMutation.isPending}
                size='sm'
                className='bg-green-600 hover:bg-green-700'
              >
                <Plus className='mr-2 size-4' />
                Agregar a Colección
              </Button>
            </div>
          )}

          <div className='flex-1 overflow-auto rounded-md border'>
            {isLoading ? (
              <div className='space-y-3 p-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center space-x-4 p-3'>
                    <Skeleton className='size-12 rounded-md' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                    <Skeleton className='h-4 w-16' />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='py-8 text-center'>
                <p className='text-red-600'>Error al cargar productos</p>
              </div>
            ) : products.length === 0 ? (
              <div className='py-8 text-center'>
                <SearchIcon className='mx-auto mb-4 size-12 text-muted-foreground' />
                <p className='text-muted-foreground'>
                  {searchTerm
                    ? `No se encontraron productos que coincidan con "${searchTerm}"`
                    : 'No se encontraron productos'}
                </p>
              </div>
            ) : availableProducts.length === 0 ? (
              <div className='py-8 text-center'>
                <p className='text-muted-foreground'>
                  {searchTerm
                    ? 'Todos los productos encontrados ya están en esta colección'
                    : 'Todos tus productos ya están en esta colección'}
                </p>
                {productsInCollection.length > 0 && (
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {productsInCollection.length} productos ya en la colección
                  </p>
                )}
              </div>
            ) : (
              <div className='divide-y'>
                {availableProducts.map((product: Product) => {
                  const isSelected = selectedProducts.has(product.id)

                  return (
                    <div
                      key={product.id}
                      className={`flex cursor-pointer items-center space-x-4 p-4 transition-colors ${
                        isSelected ? 'border-l-4 border-l-blue-500 bg-blue-50' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleProductToggle(product.id)}
                    >
                      <input
                        type='checkbox'
                        checked={isSelected}
                        onChange={() => handleProductToggle(product.id)}
                        className='size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                      <div className='relative size-12 shrink-0 overflow-hidden rounded-md bg-muted'>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].altText ?? product.title}
                            className='size-full object-cover'
                          />
                        ) : (
                          <div className='flex size-full items-center justify-center bg-muted'>
                            <span className='text-xs text-muted-foreground'>Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className='min-w-0 flex-1'>
                        <h4 className='truncate font-medium'>{product.title}</h4>
                        <p className='truncate text-sm text-muted-foreground'>{product.vendor}</p>
                      </div>
                      <div className='shrink-0'>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {product.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} variant='outline' disabled={addProductsMutation.isPending}>
            Cancelar
          </Button>
          {selectedProducts.size > 0 && (
            <Button
              onClick={handleAddProducts}
              disabled={addProductsMutation.isPending}
              className='bg-green-600 hover:bg-green-700'
            >
              {addProductsMutation.isPending ? (
                <>
                  <div className='mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className='mr-2 size-4' />
                  Agregar {selectedProducts.size} producto{selectedProducts.size > 1 ? 's' : ''}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
