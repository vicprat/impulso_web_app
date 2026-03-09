'use client'

import { Check, Search as SearchIcon, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { SearchInput } from '@/components/input/search'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetProductsPaginated } from '@/services/product/hook'

import type { Product } from '@/models/Product'

interface ProductSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  initialSelectedIds?: string[]
  onConfirm: (selectedItemIds: string[]) => void
  title?: string
  description?: string
  confirmButtonText?: string
}

export function ProductSelectorModal({
  confirmButtonText = 'Confirmar Selección',
  description = 'Busca y selecciona productos de tu inventario',
  initialSelectedIds = [],
  isOpen,
  onClose,
  onConfirm,
  title = 'Seleccionar Productos',
}: ProductSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())

  const {
    data: productsData,
    error,
    isLoading,
  } = useGetProductsPaginated({
    limit: 100,
    search: searchTerm,
  })

  // Initialize selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('')
      setSelectedProductIds(new Set(initialSelectedIds))
    }
  }, [isOpen, initialSelectedIds])

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  const handleConfirm = () => {
    onConfirm(Array.from(selectedProductIds))
    onClose()
  }

  const handleSelectAllVisible = () => {
    const visibleProducts = productsData?.products ?? []
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev)
      visibleProducts.forEach((p) => newSet.add(p.id))
      return newSet
    })
  }

  const handleDeselectAll = () => {
    setSelectedProductIds(new Set())
  }

  const products = productsData?.products ?? []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='flex max-h-[85vh] max-w-5xl flex-col overflow-hidden'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-1 flex-col space-y-4 overflow-hidden'>
          <div className='flex items-center justify-between space-x-4'>
            <div className='flex-1'>
              <Label htmlFor='search' className='sr-only'>
                Buscar productos
              </Label>
              <SearchInput
                initialValue={searchTerm}
                onSearch={setSearchTerm}
                placeholder='Buscar por título, artista...'
                className='max-w-none'
                isLoading={isLoading}
              />
            </div>
            {products.length > 0 && (
              <div className='flex space-x-2'>
                {selectedProductIds.size > 0 ? (
                  <Button onClick={handleDeselectAll} variant='outline' size='sm'>
                    <X className='mr-2 size-4' />
                    Deseleccionar Todos
                  </Button>
                ) : (
                  <Button onClick={handleSelectAllVisible} variant='outline' size='sm'>
                    Seleccionar Todos los Visibles
                  </Button>
                )}
              </div>
            )}
          </div>

          {selectedProductIds.size > 0 && (
            <div className='flex items-center justify-between rounded-md bg-blue-50 p-3 text-sm text-blue-800'>
              <span className='font-medium'>{selectedProductIds.size} productos seleccionados</span>
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
            ) : (
              <div className='divide-y'>
                {products.map((product: Product) => {
                  const isSelected = selectedProductIds.has(product.id)

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
                        onClick={(e) => e.stopPropagation()}
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
          <Button onClick={onClose} variant='outline'>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} className='bg-blue-600 hover:bg-blue-700'>
            <Check className='mr-2 size-4' />
            {confirmButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
