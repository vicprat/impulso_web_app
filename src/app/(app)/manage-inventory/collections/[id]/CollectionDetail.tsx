'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Download,
  Edit,
  ExternalLink,
  Minus,
  Plus,
  QrCode,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCollection, useRemoveProductsFromCollection } from '@/services/collection/hooks'
import { CollectionModal } from '@/src/components/Modals/CollectionModal'
import { ROUTES } from '@/src/config/routes'

import { AddProductsModal } from './AddProductsModal'
import { CollectionProductsTable } from './CollectionProductsTable'
import { generateProductQR } from './generateProductQR'

import type { Product } from '@/models/Product'

interface CollectionDetailProps {
  collectionId: string
}

export function CollectionDetail({ collectionId }: CollectionDetailProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddProductsModalOpen, setIsAddProductsModalOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [isDownloadingAllQRs, setIsDownloadingAllQRs] = useState(false)
  const queryClient = useQueryClient()

  const fullId = collectionId.startsWith('gid://shopify/Collection/')
    ? collectionId
    : `gid://shopify/Collection/${collectionId}`

  const {
    data: collection,
    error: collectionError,
    isLoading: isLoadingCollection,
  } = useCollection(fullId)

  const removeProductsMutation = useRemoveProductsFromCollection({
    onError: (error: Error & { details?: { message?: string }[] }) => {
      if (
        error?.details?.some((detail) =>
          detail.message?.includes("Can't manually add products to a smart collection")
        )
      ) {
        toast.error(
          'Esta es una colección inteligente. Los productos se gestionan automáticamente según las reglas definidas.'
        )
      } else {
        toast.error(`Error al remover productos: ${error.message}`)
      }
    },
    onSuccess: () => {
      toast.success('Productos removidos de la colección exitosamente')
      setSelectedProducts(new Set())
      setIsRemoveDialogOpen(false)
      void queryClient.invalidateQueries({ queryKey: ['collections', 'detail', fullId] })
    },
  })

  const handleRemoveProducts = () => {
    if (!collection || selectedProducts.size === 0) return

    removeProductsMutation.mutate({
      collectionId: collection.id.split('/').pop() ?? '',
      productIds: Array.from(selectedProducts),
    })
  }

  const handleViewCollection = () => {
    if (!collection) return
    const url = ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)
    window.open(url, '_blank')
  }

  const handleDownloadQR = async () => {
    if (!collection) return
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)}`

      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 400
      canvas.height = 400

      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const qrImg = new Image()
      qrImg.crossOrigin = 'anonymous'

      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height)

        canvas.toBlob((blob) => {
          if (blob) {
            const link = document.createElement('a')
            link.download = `qr-${collection.handle}.png`
            link.href = URL.createObjectURL(blob)
            link.click()
            URL.revokeObjectURL(link.href)
            toast.success('QR descargado exitosamente')
          }
        })
      }

      qrImg.onerror = () => {
        toast.error('Error al cargar el código QR')
      }

      qrImg.src = qrApiUrl
    } catch (error) {
      console.error('Error generando QR:', error)
      toast.error('Error al generar el código QR')
    }
  }

  const handleDownloadAllQRs = async () => {
    if (!collection || collectionProducts.length === 0) return

    setIsDownloadingAllQRs(true)
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

    try {
      toast.info(`Generando ${collectionProducts.length} códigos QR...`)

      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      for (let i = 0; i < collectionProducts.length; i++) {
        const product = collectionProducts[i]
        try {
          const blob = await generateProductQR(
            {
              handle: product.handle,
              title: product.title,
              vendor: product.vendor,
            },
            baseUrl
          )

          const sanitizedTitle = product.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
          zip.file(`${i + 1}_${sanitizedTitle}.png`, blob)

          if ((i + 1) % 5 === 0) {
            toast.info(`Generados ${i + 1} de ${collectionProducts.length} QRs...`)
          }
        } catch (error) {
          console.error(`Error generando QR para ${product.title}:`, error)
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const link = document.createElement('a')
      link.download = `qrs-${collection.handle}.zip`
      link.href = URL.createObjectURL(zipBlob)
      link.click()
      URL.revokeObjectURL(link.href)

      toast.success(`${collectionProducts.length} códigos QR descargados exitosamente`)
    } catch (error) {
      console.error('Error generando QRs:', error)
      toast.error('Error al generar los códigos QR')
    } finally {
      setIsDownloadingAllQRs(false)
    }
  }

  const handleRefresh = () => {
    void queryClient.refetchQueries({ queryKey: ['collections', 'detail', fullId] })
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    setSelectedProducts(new Set())
  }

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize)
    setCurrentPage(1)
    setSelectedProducts(new Set())
  }

  const collectionProducts: Product[] = useMemo(() => {
    if (!collection?.products) return []
    return collection.products as Product[]
  }, [collection])

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return collectionProducts.slice(startIndex, endIndex)
  }, [collectionProducts, currentPage, pageSize])

  const existingProductIds = useMemo(() => {
    return new Set(collectionProducts.map((p) => p.id))
  }, [collectionProducts])

  if (isLoadingCollection) {
    return (
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex items-center space-x-2'>
          <Skeleton className='size-8' />
          <Skeleton className='h-8 w-64' />
        </div>
        <Skeleton className='h-96 w-full' />
      </div>
    )
  }

  if (collectionError || !collection) {
    return (
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar la colección</h3>
            <p className='mt-2 text-muted-foreground'>
              {collectionError?.message ?? 'Colección no encontrada'}
            </p>
            <Link href='/manage-inventory/collections'>
              <Button className='mt-4'>
                <ArrowLeft className='mr-2 size-4' />
                Volver a Colecciones
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isSmartCollection = !!collection.ruleSet

  return (
    <>
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div className='min-w-0 flex-1'>
            <div className='mb-2 flex items-center space-x-2'>
              <Link href='/manage-inventory/collections'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='mr-2 size-4' />
                  Volver a Colecciones
                </Button>
              </Link>
            </div>
            <div className='flex items-center space-x-2'>
              <h1 className='truncate text-2xl font-bold'>{collection.title}</h1>
              <Badge variant='secondary'>{collection.productsCount} productos</Badge>
              {isSmartCollection && (
                <Badge variant='default' className='bg-blue-600'>
                  Inteligente
                </Badge>
              )}
            </div>
            {collection.description && (
              <p className='mt-1 text-muted-foreground'>{collection.description}</p>
            )}
            <p className='mt-1 text-xs text-muted-foreground'>
              {(() => {
                const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)}`
                return fullUrl.replace(/^https?:\/\/(www\.)?/, '')
              })()}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <Button onClick={handleRefresh} variant='outline' size='sm'>
              <RefreshCw className='mr-2 size-4' />
              Actualizar
            </Button>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant='outline'
              size='sm'
              className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
            >
              <Edit className='mr-2 size-4' />
              Editar
            </Button>
            <Button
              onClick={handleViewCollection}
              variant='outline'
              size='sm'
              className='text-green-600 hover:bg-green-50 hover:text-green-700'
            >
              <ExternalLink className='mr-2 size-4' />
              Ver en Tienda
            </Button>
            <Button
              onClick={handleDownloadQR}
              variant='outline'
              size='sm'
              className='text-purple-600 hover:bg-purple-50 hover:text-purple-700'
            >
              <QrCode className='mr-2 size-4' />
              QR Colección
            </Button>
            {collectionProducts.length > 0 && (
              <Button
                onClick={handleDownloadAllQRs}
                disabled={isDownloadingAllQRs}
                variant='outline'
                size='sm'
                className='text-orange-600 hover:bg-orange-50 hover:text-orange-700'
              >
                {isDownloadingAllQRs ? (
                  <>
                    <div className='mr-2 size-4 animate-spin rounded-full border-2 border-orange-600 border-t-transparent' />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className='mr-2 size-4' />
                    Descargar Todos los QRs ({collectionProducts.length})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {isSmartCollection && (
          <div className='rounded-md bg-blue-50 p-4 text-sm text-blue-800'>
            <p className='font-medium'>Colección Inteligente</p>
            <p className='mt-1 text-xs text-blue-600'>
              Los productos en esta colección se agregan automáticamente según las reglas definidas.
              No puedes agregar o remover productos manualmente.
            </p>
          </div>
        )}

        <div className='rounded-lg border bg-card'>
          <div className='border-b p-4'>
            <div className='flex items-center justify-between'>
              <h2 className='text-lg font-semibold'>Productos en la Colección</h2>
              <div className='flex items-center space-x-2'>
                {selectedProducts.size > 0 && !isSmartCollection && (
                  <Button
                    onClick={() => setIsRemoveDialogOpen(true)}
                    disabled={removeProductsMutation.isPending}
                    variant='destructive'
                    size='sm'
                  >
                    <Minus className='mr-2 size-4' />
                    Remover ({selectedProducts.size})
                  </Button>
                )}
                {!isSmartCollection && (
                  <Button
                    onClick={() => setIsAddProductsModalOpen(true)}
                    size='sm'
                    className='bg-green-600 hover:bg-green-700'
                  >
                    <Plus className='mr-2 size-4' />
                    Agregar Productos
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className='p-4'>
            <CollectionProductsTable
              products={paginatedProducts}
              isLoading={isLoadingCollection}
              currentPage={currentPage}
              pageSize={pageSize}
              totalProducts={collectionProducts.length}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              selectedProducts={selectedProducts}
              onProductSelect={(productId, selected) => {
                setSelectedProducts((prev) => {
                  const newSet = new Set(prev)
                  if (selected) {
                    newSet.add(productId)
                  } else {
                    newSet.delete(productId)
                  }
                  return newSet
                })
              }}
              onSelectAll={(selected) => {
                if (selected) {
                  setSelectedProducts(new Set(paginatedProducts.map((p) => p.id)))
                } else {
                  setSelectedProducts(new Set())
                }
              }}
              isSmartCollection={isSmartCollection}
            />
          </div>
        </div>

        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {paginatedProducts.length} de {collectionProducts.length} productos
        </div>
      </div>

      <CollectionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        collection={collection}
        onSuccess={() => {
          setIsEditModalOpen(false)
          handleRefresh()
        }}
      />

      <AddProductsModal
        isOpen={isAddProductsModalOpen}
        onClose={() => setIsAddProductsModalOpen(false)}
        collectionId={collection.id}
        collectionTitle={collection.title}
        existingProductIds={existingProductIds}
        onSuccess={handleRefresh}
        isSmartCollection={isSmartCollection}
      />

      <Confirm
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        onConfirm={handleRemoveProducts}
        title='Remover Productos'
        message={`¿Estás seguro de que quieres remover ${selectedProducts.size} producto${selectedProducts.size > 1 ? 's' : ''} de esta colección?\n\nLos productos no se eliminarán de tu inventario, solo se removerán de esta colección.`}
        confirmButtonText='Remover'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={removeProductsMutation.isPending}
      />
    </>
  )
}
