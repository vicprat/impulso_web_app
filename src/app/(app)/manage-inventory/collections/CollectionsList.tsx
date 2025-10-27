'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  EyeOff,
  Globe,
  MoreVertical,
  PlusCircle,
  QrCode,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCollections,
  useDeleteCollection,
  usePublishCollection,
  useUnpublishCollection,
} from '@/services/collection/hooks'
import { CollectionModal } from '@/src/components/Modals/CollectionModal'
import { ROUTES } from '@/src/config/routes'

import type { Collection } from '@/services/collection/types'

export function CollectionsList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [collectionToDelete, setCollectionToDelete] = useState<Collection | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const {
    data: collectionsData,
    error,
    isLoading,
  } = useCollections({
    limit: 100,
  })

  const deleteCollectionMutation = useDeleteCollection({
    onError: (error) => {
      toast.error(`Error al eliminar colección: ${error.message}`)
      setDeletingId(null)
    },
    onSuccess: () => {
      toast.success('Colección eliminada exitosamente')
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
      setCollectionToDelete(null)
    },
  })

  const publishCollectionMutation = usePublishCollection({
    onError: (error) => {
      toast.error(`Error al publicar colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección publicada exitosamente')
    },
  })

  const unpublishCollectionMutation = useUnpublishCollection({
    onError: (error) => {
      toast.error(`Error al despublicar colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección despublicada exitosamente')
    },
  })

  const handleEdit = (collection: Collection) => {
    setEditingCollection(collection)
  }

  const handleDeleteClick = (collection: Collection) => {
    setCollectionToDelete(collection)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!collectionToDelete) return
    setDeletingId(collectionToDelete.id)
    await deleteCollectionMutation.mutateAsync(collectionToDelete.id)
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

  const isCollectionPublished = (collection: Collection) => {
    return collection.publishedOnCurrentPublication
  }

  const handleTogglePublish = async (
    collection: Collection,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.stopPropagation()

    if (collection.publishedOnCurrentPublication) {
      await unpublishCollectionMutation.mutateAsync(collection.id)
    } else {
      await publishCollectionMutation.mutateAsync(collection.id)
    }
  }

  const collections = collectionsData?.collections ?? []

  return (
    <>
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div>
            <div className='mb-2 flex items-center space-x-2'>
              <Link href='/manage-inventory'>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='mr-2 size-4' />
                  Volver al Inventario
                </Button>
              </Link>
            </div>
            <h1 className='text-2xl font-bold'>Gestión de Colecciones</h1>
            <p className='text-muted-foreground'>
              {isLoading ? <Skeleton className='h-4 w-32' /> : `${collections.length} colecciones`}
            </p>
          </div>
          <div className='flex space-x-2'>
            <Button onClick={handleLoadCollections} variant='outline' disabled={isLoading}>
              <RefreshCw className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className='mr-2 size-4' />
              Nueva Colección
            </Button>
          </div>
        </div>

        <div className='rounded-lg border bg-card'>
          {isLoading ? (
            <div className='space-y-3 p-4'>
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
              <Button onClick={handleLoadCollections} variant='outline' className='mt-2'>
                Reintentar
              </Button>
            </div>
          ) : collections.length === 0 ? (
            <div className='py-12 text-center'>
              <p className='mb-4 text-muted-foreground'>
                No hay colecciones creadas. Haz clic en "Nueva Colección" para crear una.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className='mr-2 size-4' />
                Crear Primera Colección
              </Button>
            </div>
          ) : (
            <div className='divide-y'>
              {collections.map((collection: Collection) => (
                <div
                  key={collection.id}
                  className='hover:bg-muted/50 cursor-pointer p-4 transition-colors'
                  onClick={() =>
                    void router.push(
                      `/manage-inventory/collections/${collection.id.split('/').pop()}`
                    )
                  }
                >
                  <div className='flex items-center justify-between'>
                    <div className='min-w-0 flex-1'>
                      <div className='mb-1 flex items-center space-x-2'>
                        <h3 className='truncate font-medium'>{collection.title}</h3>
                        <Badge variant='secondary' className='text-xs'>
                          {collection.productsCount} productos
                        </Badge>
                        {collection.ruleSet && (
                          <Badge variant='default' className='bg-blue-600 text-xs'>
                            Inteligente
                          </Badge>
                        )}
                        {isCollectionPublished(collection) ? (
                          <Badge variant='default' className='bg-green-600 text-xs'>
                            Publicada
                          </Badge>
                        ) : (
                          <Badge variant='outline' className='text-xs'>
                            Borrador
                          </Badge>
                        )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={(e) => e.stopPropagation()}
                            disabled={
                              deletingId === collection.id ||
                              publishCollectionMutation.isPending ||
                              unpublishCollectionMutation.isPending
                            }
                          >
                            <MoreVertical className='size-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleTogglePublish(collection, e)
                            }}
                            disabled={
                              deletingId === collection.id ||
                              publishCollectionMutation.isPending ||
                              unpublishCollectionMutation.isPending
                            }
                          >
                            {isCollectionPublished(collection) ? (
                              <>
                                <EyeOff className='mr-2 size-4' />
                                Despublicar
                              </>
                            ) : (
                              <>
                                <Globe className='mr-2 size-4' />
                                Publicar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(collection)
                            }}
                            disabled={deletingId === collection.id}
                          >
                            <Edit className='mr-2 size-4' />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewCollection(collection)
                            }}
                            disabled={deletingId === collection.id}
                          >
                            <ExternalLink className='mr-2 size-4' />
                            Ver colección
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              void handleDownloadQR(collection)
                            }}
                            disabled={deletingId === collection.id}
                          >
                            <QrCode className='mr-2 size-4' />
                            Descargar QR
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(collection)
                            }}
                            disabled={deletingId === collection.id}
                            className='text-red-600 focus:bg-red-50'
                          >
                            {deletingId === collection.id ? (
                              <>
                                <div className='mr-2 size-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent' />
                                Eliminando...
                              </>
                            ) : (
                              <>
                                <Trash2 className='mr-2 size-4' />
                                Eliminar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCollectionToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title='Eliminar Colección'
        message={
          collectionToDelete
            ? `¿Estás seguro de que quieres eliminar la colección "${collectionToDelete.title}"?\n\nEsta acción no se puede deshacer.`
            : ''
        }
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={deleteCollectionMutation.isPending}
      />
    </>
  )
}
