'use client'

import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Check, CheckCircle, PlusCircle, RefreshCw, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBulkUpdateQueue } from '@/hooks/useBulkUpdateQueue'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useCollections } from '@/services/collection/hooks'
import {
  useGetArtworkTypes,
  useGetLocations,
  useGetTechniques,
  useGetVendors,
} from '@/services/product/hook'
import { type CreateProductPayload } from '@/services/product/types'
import { BulkUpdateProgress } from '@/src/components/BulkUpdateProgress'
import { Table } from '@/src/components/Table'
import { Skeleton } from '@/src/components/ui/skeleton'

import { columns } from './columns'
import { ProductFormDialog } from './ProductFormDialog'

export const dynamic = 'force-dynamic'

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

interface BulkCreateTableMeta {
  editingRowId: string | null
  setEditingRowId: (id: string | null) => void
  updateProduct: (id: string, changes: Partial<NewProduct>) => void
  deleteProduct: (id: string) => void
  editProduct: (product: NewProduct) => void
  products: NewProduct[]
  user?: any
  isAdmin?: boolean
  isArtist?: boolean
  vendors: string[]
  techniques: { id: string; name: string }[]
  artworkTypes: { id: string; name: string }[]
  locations: { id: string; name: string }[]
  vendorsLoading: boolean
  techniquesLoading: boolean
  artworkTypesLoading: boolean
  locationsLoading: boolean
  collections: any[]
  collectionsLoading: boolean
}

export function Client() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { hasPermission, user } = useAuth()

  const isAdmin = hasPermission('manage_products')
  const isArtist = hasPermission('manage_own_products') && !isAdmin

  const [products, setProducts] = useState<NewProduct[]>([])
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [hasCompletedBulk, setHasCompletedBulk] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<NewProduct | null>(null)

  const { data: vendors = [], isLoading: vendorsLoading } = useGetVendors()
  const { data: techniques = [], isLoading: techniquesLoading } = useGetTechniques()
  const { data: artworkTypes = [], isLoading: artworkTypesLoading } = useGetArtworkTypes()
  const { data: locations = [], isLoading: locationsLoading } = useGetLocations()

  // Obtener colecciones
  const { data: collectionsData, isLoading: collectionsLoading } = useCollections({ limit: 250 })
  const allCollections = collectionsData?.collections ?? []
  const collections = allCollections.filter(
    (collection: any) => !collection.ruleSet || collection.ruleSet.rules?.length === 0
  )

  const bulkCreateQueue = useBulkUpdateQueue(
    async (payload: CreateProductPayload & { id: string }) => {
      // Remover el ID temporal antes de enviar al servidor
      const { id, ...payloadWithoutId } = payload

      const response = await fetch('/api/management/products', {
        body: JSON.stringify(payloadWithoutId),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error ?? `HTTP ${response.status}: ${response.statusText}`)
      }

      return response.json()
    },
    {
      delayBetweenUpdates: 300,
      maxConcurrent: 2,
      onComplete: (queue) => {
        const successCount = queue.progress.success
        const errorCount = queue.progress.error
        const totalCount = queue.progress.total

        if (errorCount === 0) {
          toast.success(
            `✅ Creación en lote completada: ${successCount} de ${totalCount} productos creados exitosamente`
          )
        } else {
          toast.warning(
            `⚠️ Creación en lote completada: ${successCount} exitosos, ${errorCount} errores de ${totalCount} productos`
          )
        }

        setHasCompletedBulk(true)

        setTimeout(() => {
          void queryClient.invalidateQueries({ queryKey: ['managementProducts', 'paginated'] })
          void queryClient.invalidateQueries({ queryKey: ['managementProducts', 'stats'] })
          void queryClient.invalidateQueries({ queryKey: ['vendors'] })
          void queryClient.invalidateQueries({ queryKey: ['techniques'] })
          void queryClient.invalidateQueries({ queryKey: ['artworkTypes'] })
        }, 1000)
      },
    }
  )

  const handleOpenDialog = useCallback(() => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }, [])

  const handleEditProduct = useCallback((product: NewProduct) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }, [])

  const handleSaveFromDialog = useCallback(
    (productData: Omit<NewProduct, 'id'>) => {
      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...productData,
                  id: editingProduct.id,
                }
              : p
          )
        )
        toast.success('Producto actualizado')
      } else {
        const newProduct: NewProduct = {
          ...productData,
          id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }
        setProducts((prev) => [...prev, newProduct])
        toast.success('Producto agregado a la lista')
      }
      setEditingProduct(null)
    },
    [editingProduct]
  )

  const handleUpdateProduct = useCallback((id: string, changes: Partial<NewProduct>) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...changes,
              artworkDetails: {
                ...product.artworkDetails,
                ...(changes.artworkDetails || {}),
              },
            }
          : product
      )
    )
  }, [])

  const handleDeleteProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((product) => product.id !== id))
    toast.info('Producto eliminado de la lista')
  }, [])

  const validateProduct = (product: NewProduct): string | null => {
    if (!product.title.trim()) {
      return 'El título es requerido'
    }
    if (!product.vendor.trim()) {
      return 'El artista es requerido'
    }
    if (!product.productType.trim()) {
      return 'El tipo de obra es requerido'
    }
    if (!product.price || parseFloat(product.price) < 0) {
      return 'El precio debe ser un número positivo'
    }
    return null
  }

  const handleCreateAll = useCallback(() => {
    if (products.length === 0) {
      toast.warning('Agrega al menos un producto antes de crear')
      return
    }

    const errors: string[] = []
    const validProducts: (CreateProductPayload & { id: string })[] = []

    products.forEach((product, index) => {
      const validationError = validateProduct(product)
      if (validationError) {
        errors.push(`Fila ${index + 1}: ${validationError}`)
      } else {
        const payload: CreateProductPayload & { id: string } = {
          collectionId: product.collectionId === 'none' ? undefined : product.collectionId,
          description: product.description || '',
          details: product.artworkDetails,
          id: product.id,
          // Usar el ID del producto original
          inventoryQuantity: product.inventoryQuantity,
          price: product.price,
          productType: product.productType,
          status: product.status,
          tags: product.tags || [],
          title: product.title,
          vendor: product.vendor,
        }

        if (product.imageUrl) {
          payload.images = [
            {
              mediaContentType: 'IMAGE',
              originalSource: product.imageUrl,
            },
          ]
        }

        validProducts.push(payload)
      }
    })

    if (errors.length > 0) {
      toast.error('Errores de validación', {
        description: errors.slice(0, 3).join('\n') + (errors.length > 3 ? '\n...' : ''),
        duration: 5000,
      })
      return
    }

    bulkCreateQueue.addItems(validProducts)
    toast.success(`✅ ${validProducts.length} productos agregados a la cola de creación`)

    // Procesar la cola inmediatamente después de agregar items
    setTimeout(() => {
      void bulkCreateQueue.processQueue()
    }, 100)
  }, [products, bulkCreateQueue])

  const handleGoToInventory = useCallback(() => {
    router.push('/manage-inventory')
  }, [router])

  const handleClearCompleted = useCallback(() => {
    setProducts([])
    setHasCompletedBulk(false)
    bulkCreateQueue.clearQueue()
    toast.info('Lista limpiada')
  }, [bulkCreateQueue])

  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      artworkTypes,
      artworkTypesLoading,
      collections,
      collectionsLoading,
      deleteProduct: handleDeleteProduct,
      editProduct: handleEditProduct,
      editingRowId,
      isAdmin,
      isArtist,
      locations,
      locationsLoading,
      products,
      setEditingRowId,
      techniques,
      techniquesLoading,
      updateProduct: handleUpdateProduct,
      user,
      vendors,
      vendorsLoading,
    } as any,
  })

  if (vendorsLoading || techniquesLoading || artworkTypesLoading || locationsLoading) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-10 w-32' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  return (
    <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div>
          <h1 className='text-2xl font-bold'>Creación en Lote</h1>
          <p className='text-muted-foreground'>Crea múltiples obras de arte simultáneamente</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleGoToInventory}>
            Volver al Inventario
          </Button>
          <Button onClick={handleOpenDialog} variant='outline'>
            <PlusCircle className='mr-2 size-4' />
            Agregar Producto
          </Button>
          {products.length > 0 && (
            <>
              <Button
                onClick={handleCreateAll}
                disabled={bulkCreateQueue.queue.isProcessing}
                className='min-w-[140px]'
              >
                {bulkCreateQueue.queue.isProcessing ? (
                  <>
                    <RefreshCw className='mr-2 size-4 animate-spin' />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Check className='mr-2 size-4' />
                    Crear Todos ({products.length})
                  </>
                )}
              </Button>
              <Button
                onClick={() => setProducts([])}
                variant='destructive'
                disabled={bulkCreateQueue.queue.isProcessing}
              >
                <Trash2 className='mr-2 size-4' />
                Limpiar Todo
              </Button>
            </>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Productos en Lista</p>
            <Badge variant='outline'>{products.length}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>En Cola</p>
            <Badge variant='default'>{bulkCreateQueue.queue.items.length}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Completados</p>
            <Badge variant='secondary'>{bulkCreateQueue.queue.progress.success}</Badge>
          </div>
        </div>
      </div>

      {bulkCreateQueue.queue.isProcessing && (
        <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2'>
              <RefreshCw className='size-4 animate-spin text-blue-600' />
              <span className='text-sm font-medium text-blue-800'>Creando productos...</span>
            </div>
            <Badge variant='outline' className='text-blue-600'>
              {bulkCreateQueue.queue.progress.completed} de {bulkCreateQueue.queue.progress.total}
            </Badge>
          </div>
          <p className='mt-1 text-xs text-blue-600'>
            No cierres esta página mientras se crean los productos.
          </p>
        </div>
      )}

      {hasCompletedBulk &&
        !bulkCreateQueue.queue.isProcessing &&
        bulkCreateQueue.queue.items.length > 0 && (
          <div className='flex items-center justify-between rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300'>
            <div className='flex items-center space-x-2'>
              <CheckCircle className='size-4' />
              <span>
                Creación completada: {bulkCreateQueue.queue.progress.success} productos creados
                exitosamente
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <Button onClick={handleGoToInventory} variant='outline' size='sm'>
                Ver Inventario
              </Button>
              <Button onClick={handleClearCompleted} variant='outline' size='sm'>
                Limpiar Lista
              </Button>
            </div>
          </div>
        )}

      {bulkCreateQueue.queue.items.length > 0 && !bulkCreateQueue.queue.isProcessing && (
        <BulkUpdateProgress
          queue={bulkCreateQueue.queue}
          onRetryFailed={bulkCreateQueue.retryFailedItems}
          onClear={bulkCreateQueue.clearQueue}
          onProcess={bulkCreateQueue.processQueue}
        />
      )}

      {products.length === 0 ? (
        <div className='flex min-h-96 items-center justify-center rounded-lg border-2 border-dashed'>
          <div className='text-center'>
            <PlusCircle className='mx-auto size-12 text-muted-foreground' />
            <h3 className='mt-4 text-lg font-semibold'>No hay productos en la lista</h3>
            <p className='mt-2 text-muted-foreground'>
              Haz clic en "Agregar Producto" para comenzar
            </p>
            <Button onClick={handleOpenDialog} className='mt-4'>
              <PlusCircle className='mr-2 size-4' />
              Agregar Primer Producto
            </Button>
          </div>
        </div>
      ) : (
        <div className='w-full min-w-0 max-w-full'>
          <Table.Data table={table} emptyMessage='No hay productos en la lista.' />
        </div>
      )}

      {products.length > 0 && (
        <div className='rounded-lg border border-amber-200 bg-amber-50 p-3'>
          <p className='text-sm text-amber-800'>
            💡 Asegúrate de completar todos los campos requeridos (título, artista, tipo de obra,
            precio) antes de crear los productos.
          </p>
        </div>
      )}

      <ProductFormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveFromDialog}
        product={editingProduct}
        vendors={vendors}
        techniques={techniques}
        artworkTypes={artworkTypes}
        locations={locations}
        vendorsLoading={vendorsLoading}
        techniquesLoading={techniquesLoading}
        artworkTypesLoading={artworkTypesLoading}
        locationsLoading={locationsLoading}
        collections={collections}
        collectionsLoading={collectionsLoading}
        isArtist={isArtist}
        defaultVendor={isArtist && user?.artist?.name ? user.artist.name : ''}
      />
    </div>
  )
}
