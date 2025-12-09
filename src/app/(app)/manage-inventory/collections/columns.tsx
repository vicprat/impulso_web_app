'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { Edit, ExternalLink, EyeOff, Globe, MoreVertical, QrCode, Trash2 } from 'lucide-react'
import Link from 'next/link'
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
import {
  useDeleteCollection,
  usePublishCollection,
  useUnpublishCollection,
} from '@/services/collection/hooks'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

import type { Collection } from '@/services/collection/types'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onEdit?: (item: TData) => void
    onRefresh?: () => void
  }
}

const ActionsCell = ({
  collection,
  onEdit,
  onRefresh,
}: {
  collection: Collection
  onEdit?: (collection: Collection) => void
  onRefresh?: () => void
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteCollectionMutation = useDeleteCollection({
    onError: (error) => {
      toast.error(`Error al eliminar colección: ${error.message}`)
      setIsDeleteDialogOpen(false)
    },
    onSuccess: () => {
      toast.success('Colección eliminada exitosamente')
      setIsDeleteDialogOpen(false)
      onRefresh?.()
    },
  })

  const publishCollectionMutation = usePublishCollection({
    onError: (error) => {
      toast.error(`Error al publicar colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección publicada exitosamente')
      onRefresh?.()
    },
  })

  const unpublishCollectionMutation = useUnpublishCollection({
    onError: (error) => {
      toast.error(`Error al despublicar colección: ${error.message}`)
    },
    onSuccess: () => {
      toast.success('Colección despublicada exitosamente')
      onRefresh?.()
    },
  })

  const handleTogglePublish = async () => {
    if (collection.publishedOnCurrentPublication) {
      await unpublishCollectionMutation.mutateAsync(collection.id)
    } else {
      await publishCollectionMutation.mutateAsync(collection.id)
    }
  }

  const handleViewCollection = () => {
    const url = ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', collection.handle)
    window.open(url, '_blank')
  }

  const handleDownloadQR = async () => {
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
    } catch {
      toast.error('Error al generar el código QR')
    }
  }

  const handleDeleteConfirm = async () => {
    await deleteCollectionMutation.mutateAsync(collection.id)
  }

  return (
    <>
      <div className='flex items-center space-x-2'>
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.COLLECTIONS.DETAIL.PATH, {
            id: collection.id.split('/').pop() ?? '',
          })}
        >
          <Button variant='ghost' size='sm'>
            <Edit className='size-4' />
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='outline' size='sm'>
              <MoreVertical className='size-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem onClick={handleTogglePublish}>
              {collection.publishedOnCurrentPublication ? (
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
            <DropdownMenuItem onClick={() => onEdit?.(collection)}>
              <Edit className='mr-2 size-4' />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleViewCollection}>
              <ExternalLink className='mr-2 size-4' />
              Ver colección
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadQR}>
              <QrCode className='mr-2 size-4' />
              Descargar QR
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setIsDeleteDialogOpen(true)}
              className='text-red-600 focus:bg-red-50'
            >
              <Trash2 className='mr-2 size-4' />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Eliminar Colección'
        message={`¿Estás seguro de que quieres eliminar la colección "${collection.title}"?\n\nEsta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        cancelButtonText='Cancelar'
        variant='destructive'
        isLoading={deleteCollectionMutation.isPending}
      />
    </>
  )
}

export const columns: ColumnDef<Collection>[] = [
  {
    accessorKey: 'title',
    cell: ({ row }) => {
      const collection = row.original
      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.COLLECTIONS.DETAIL.PATH, {
            id: collection.id.split('/').pop() ?? '',
          })}
          className='font-medium hover:underline'
        >
          {collection.title}
        </Link>
      )
    },
    header: 'Título',
  },
  {
    accessorKey: 'description',
    cell: ({ row }) => {
      const description = row.original.description
      return (
        <span className='line-clamp-2 text-sm text-muted-foreground'>{description || '-'}</span>
      )
    },
    header: 'Descripción',
  },
  {
    accessorKey: 'productsCount',
    cell: ({ row }) => {
      return (
        <Badge variant='secondary' className='text-xs'>
          {row.original.productsCount} productos
        </Badge>
      )
    },
    header: 'Productos',
  },
  {
    accessorKey: 'type',
    cell: ({ row }) => {
      const isSmartCollection = row.original.ruleSet && row.original.ruleSet.rules?.length > 0
      return isSmartCollection ? (
        <Badge variant='default' className='bg-blue-600 text-xs'>
          Inteligente
        </Badge>
      ) : (
        <Badge variant='outline' className='text-xs'>
          Manual
        </Badge>
      )
    },
    header: 'Tipo',
  },
  {
    accessorKey: 'status',
    cell: ({ row }) => {
      const isPublished = row.original.publishedOnCurrentPublication
      return isPublished ? (
        <Badge variant='default' className='bg-green-600 text-xs'>
          Publicada
        </Badge>
      ) : (
        <Badge variant='outline' className='text-xs'>
          Borrador
        </Badge>
      )
    },
    header: 'Estado',
  },
  {
    accessorKey: 'handle',
    cell: ({ row }) => {
      const handle = row.original.handle
      const fullUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${ROUTES.COLLECTIONS.DETAIL.PATH.replace(':collection', handle)}`
      const displayUrl = fullUrl.replace(/^https?:\/\/(www\.)?/, '')
      return (
        <a
          href={fullUrl}
          target='_blank'
          rel='noopener noreferrer'
          className='flex items-center gap-1 text-sm text-blue-600 hover:underline'
        >
          {displayUrl}
          <ExternalLink className='size-3' />
        </a>
      )
    },
    header: 'URL',
  },
  {
    cell: ({ row, table }) => {
      const collection = row.original
      const { onEdit, onRefresh } = table.options.meta ?? {}
      return <ActionsCell collection={collection} onEdit={onEdit} onRefresh={onRefresh} />
    },
    header: 'Acciones',
    id: 'actions',
  },
]
