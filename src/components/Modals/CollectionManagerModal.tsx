'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Edit, ExternalLink, PlusCircle, QrCode, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useCollections, useDeleteCollection } from '@/services/collection/hooks'
import { ROUTES } from '@/src/config/routes'

import { CollectionModal } from './CollectionModal'
import { CollectionProductsModal } from './CollectionProductsModal'

import type { Collection } from '@/services/collection/types'

interface CollectionManagerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CollectionManagerModal({ isOpen, onClose }: CollectionManagerModalProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [productsCollection, setProductsCollection] = useState<Collection | null>(null)
  const queryClient = useQueryClient()

  const {
    data: collectionsData,
    error,
    isLoading,
  } = useCollections(
    {
      limit: 100,
    },
    {
      enabled: isOpen, // Cargar solo cuando el modal esté abierto
    }
  )

  const deleteCollectionMutation = useDeleteCollection({
    onError: (error) => {
      toast.error(`Error al eliminar colección: ${error.message}`)
      setDeletingId(null)
    },
    onSuccess: () => {
      toast.success('Colección eliminada exitosamente')
      setDeletingId(null)
    },
  })

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta colección?')) {
      setDeletingId(id)
      await deleteCollectionMutation.mutateAsync(id)
    }
  }

  const handleLoadCollections = () => {
    void queryClient.refetchQueries({ queryKey: ['collections', 'list'] })
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingCollection(null)
  }

  const handleViewCollection = (collection: Collection) => {
    const url = ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)
    window.open(url, '_blank')
  }

  const handleDownloadQR = async (collection: Collection) => {
    try {
      const url = `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)}`

      // Usar una API externa para generar el QR
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`

      // Crear un canvas para agregar texto
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 300
      canvas.height = 400

      // Fondo blanco
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Cargar y dibujar el QR
      const qrImg = new Image()
      qrImg.crossOrigin = 'anonymous'
      qrImg.onload = () => {
        const qrSize = 200
        const qrX = (canvas.width - qrSize) / 2
        const qrY = 50

        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

        // Agregar texto
        ctx.fillStyle = '#000000'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(collection.title, canvas.width / 2, qrY + qrSize + 30)

        ctx.font = '12px Arial'
        ctx.fillStyle = '#666666'
        ctx.fillText(url, canvas.width / 2, qrY + qrSize + 50)

        // Descargar la imagen
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

  const collections = collectionsData?.collections ?? []

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='flex max-h-[80vh] max-w-4xl flex-col overflow-hidden'>
          <DialogHeader>
            <DialogTitle>Gestionar Colecciones</DialogTitle>
            <DialogDescription>Crea, edita y elimina colecciones de productos.</DialogDescription>
          </DialogHeader>

          <div className='flex flex-1 flex-col overflow-hidden'>
            <div className='mb-4 flex items-center justify-between'>
              <div className='text-sm text-muted-foreground'>
                {isLoading ? (
                  <Skeleton className='h-4 w-32' />
                ) : (
                  `${collections.length} colecciones`
                )}
              </div>
              <div className='flex space-x-2'>
                <Button onClick={handleLoadCollections} variant='outline' size='sm'>
                  <RefreshCw className='mr-2 size-4' />
                  Cargar Colecciones
                </Button>
                <Button onClick={() => setIsCreateModalOpen(true)} size='sm'>
                  <PlusCircle className='mr-2 size-4' />
                  Nueva Colección
                </Button>
              </div>
            </div>

            <div className='flex-1 overflow-auto'>
              {isLoading ? (
                <div className='space-y-3'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='rounded-lg border p-4'>
                      <div className='flex items-center justify-between'>
                        <div className='space-y-2'>
                          <Skeleton className='h-4 w-48' />
                          <Skeleton className='h-3 w-32' />
                        </div>
                        <div className='flex space-x-2'>
                          <Skeleton className='size-8' />
                          <Skeleton className='size-8' />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className='py-8 text-center'>
                  <p className='text-red-600'>Error al cargar las colecciones</p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant='outline'
                    className='mt-2'
                  >
                    Reintentar
                  </Button>
                </div>
              ) : collections.length === 0 ? (
                <div className='py-8 text-center'>
                  <p className='mb-4 text-muted-foreground'>
                    Haz clic en "Cargar Colecciones" para ver las colecciones existentes
                  </p>
                  <div className='space-y-2'>
                    <Button onClick={handleLoadCollections} variant='outline'>
                      <RefreshCw className='mr-2 size-4' />
                      Cargar Colecciones
                    </Button>
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                      <PlusCircle className='mr-2 size-4' />
                      Crear Primera Colección
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  {collections.map((collection: Collection) => (
                    <div
                      key={collection.id}
                      className='hover:bg-muted/50 rounded-lg border p-4 transition-colors'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='min-w-0 flex-1'>
                          <div className='mb-1 flex items-center space-x-2'>
                            <h3 className='truncate font-medium'>{collection.title}</h3>
                            <Badge variant='secondary' className='text-xs'>
                              {collection.productsCount} productos
                            </Badge>
                          </div>
                          {collection.description && (
                            <p className='line-clamp-2 text-sm text-muted-foreground'>
                              {collection.description}
                            </p>
                          )}
                          <p className='mt-1 text-xs text-muted-foreground'>
                            {(() => {
                              const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)}`
                              return fullUrl.replace(/^https?:\/\/(www\.)?/, '')
                            })()}
                          </p>
                        </div>
                        <div className='ml-4 flex items-center space-x-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setProductsCollection(collection)}
                            disabled={deletingId === collection.id}
                            className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                          >
                            Productos
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleEdit(collection)}
                            disabled={deletingId === collection.id}
                          >
                            <Edit className='size-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewCollection(collection)}
                            disabled={deletingId === collection.id}
                            className='text-green-600 hover:bg-green-50 hover:text-green-700'
                            title='Ver colección'
                          >
                            <ExternalLink className='size-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDownloadQR(collection)}
                            disabled={deletingId === collection.id}
                            className='text-purple-600 hover:bg-purple-50 hover:text-purple-700'
                            title='Descargar QR'
                          >
                            <QrCode className='size-4' />
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleDelete(collection.id)}
                            disabled={deletingId === collection.id}
                            className='text-red-600 hover:bg-red-50 hover:text-red-700'
                          >
                            {deletingId === collection.id ? (
                              <div className='size-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent' />
                            ) : (
                              <Trash2 className='size-4' />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CollectionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <CollectionModal
        isOpen={!!editingCollection}
        onClose={() => setEditingCollection(null)}
        collection={editingCollection}
        onSuccess={handleEditSuccess}
      />

      <CollectionProductsModal
        isOpen={!!productsCollection}
        onClose={() => setProductsCollection(null)}
        collection={productsCollection}
      />
    </>
  )
}
