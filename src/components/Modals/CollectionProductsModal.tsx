'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddProductsToCollection,
  useRemoveProductsFromCollection,
} from '@/services/collection/hooks'
import { useGetProductsPaginated } from '@/services/product/hook'

import type { Collection } from '@/services/collection/types'

interface CollectionProductsModalProps {
  isOpen: boolean
  onClose: () => void
  collection: Collection | null
}

export function CollectionProductsModal({
  isOpen,
  onClose,
  collection,
}: CollectionProductsModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  const {
    data: productsData,
    isLoading,
    error,
  } = useGetProductsPaginated({
    limit: 100,
    search: searchTerm,
  })

  const addProductsMutation = useAddProductsToCollection({
    onSuccess: () => {
      toast.success('Productos agregados a la colección exitosamente')
      setSelectedProducts(new Set())
      onClose()
    },
    onError: (error) => {
      toast.error(`Error al agregar productos: ${error.message}`)
    },
  })

  const removeProductsMutation = useRemoveProductsFromCollection({
    onSuccess: () => {
      toast.success('Productos removidos de la colección exitosamente')
      setSelectedProducts(new Set())
      onClose()
    },
    onError: (error) => {
      toast.error(`Error al remover productos: ${error.message}`)
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
    if (!collection || selectedProducts.size === 0) return

    addProductsMutation.mutate({
      collectionId: collection.id.split('/').pop() || '',
      productIds: Array.from(selectedProducts),
    })
  }

  const handleRemoveProducts = () => {
    if (!collection || selectedProducts.size === 0) return

    removeProductsMutation.mutate({
      collectionId: collection.id.split('/').pop() || '',
      productIds: Array.from(selectedProducts),
    })
  }

  const products = productsData?.products || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[80vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Gestionar Productos - {collection?.title}</DialogTitle>
          <DialogDescription>Agrega o remueve productos de esta colección</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col space-y-4'>
          <div className='flex items-center space-x-4'>
            <div className='flex-1'>
              <Label htmlFor='search'>Buscar productos</Label>
              <Input
                id='search'
                placeholder='Buscar por título, artista...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {selectedProducts.size > 0 && (
              <div className='flex space-x-2'>
                <Button
                  onClick={handleAddProducts}
                  disabled={addProductsMutation.isPending}
                  size='sm'
                >
                  Agregar ({selectedProducts.size})
                </Button>
                <Button
                  onClick={handleRemoveProducts}
                  disabled={removeProductsMutation.isPending}
                  variant='destructive'
                  size='sm'
                >
                  Remover ({selectedProducts.size})
                </Button>
              </div>
            )}
          </div>

          <div className='flex-1 overflow-auto'>
            {isLoading ? (
              <div className='space-y-3'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className='flex items-center space-x-4 p-4 border rounded'>
                    <Skeleton className='h-12 w-12' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-3 w-1/2' />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className='text-center py-8'>
                <p className='text-red-600'>Error al cargar productos</p>
              </div>
            ) : products.length === 0 ? (
              <div className='text-center py-8'>
                <p className='text-gray-600'>No se encontraron productos</p>
              </div>
            ) : (
              <div className='space-y-2'>
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className={`flex items-center space-x-4 p-4 border rounded cursor-pointer transition-colors ${
                      selectedProducts.has(product.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleProductToggle(product.id)}
                  >
                    <input
                      type='checkbox'
                      checked={selectedProducts.has(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className='h-4 w-4'
                    />
                    <div className='h-12 w-12 bg-gray-200 rounded flex items-center justify-center'>
                      {product.featuredImage ? (
                        <img
                          src={product.featuredImage.url}
                          alt={product.title}
                          className='h-full w-full object-cover rounded'
                        />
                      ) : (
                        <span className='text-gray-400 text-xs'>Sin imagen</span>
                      )}
                    </div>
                    <div className='flex-1'>
                      <h4 className='font-medium'>{product.title}</h4>
                      <p className='text-sm text-gray-600'>{product.vendor}</p>
                    </div>
                    <div className='text-sm text-gray-500'>
                      {product.status === 'ACTIVE' ? 'Activo' : 'Borrador'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

