'use client'

import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowLeft, PlusCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCollections } from '@/services/collection/hooks'
import { CollectionModal } from '@/src/components/Modals/CollectionModal'
import { Table } from '@/src/components/Table'
import { ROUTES } from '@/src/config/routes'

import { columns } from './columns'

import type { Collection } from '@/services/collection/types'

export function Client() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null)
  const queryClient = useQueryClient()

  const {
    data: collectionsData,
    error,
    isFetching,
    isLoading,
  } = useCollections({
    limit: 250,
  })

  const collections = collectionsData?.collections ?? []

  const handleRefresh = () => {
    void queryClient.refetchQueries({ queryKey: ['collections', 'list'] })
  }

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false)
  }

  const handleEditSuccess = () => {
    setEditingCollection(null)
  }

  const table = useReactTable({
    columns,
    data: collections,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onEdit: (collection: Collection) => setEditingCollection(collection),
      onRefresh: handleRefresh,
    },
  })

  if (isLoading) {
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

  if (error) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar colecciones</h3>
            <p className='mt-2 text-muted-foreground'>{error.message}</p>
            <Button onClick={handleRefresh} className='mt-4'>
              <RefreshCw className='mr-2 size-4' />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
        <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
          <div>
            <div className='mb-2 flex items-center space-x-2'>
              <Link href={ROUTES.INVENTORY.MAIN.PATH}>
                <Button variant='ghost' size='sm'>
                  <ArrowLeft className='mr-2 size-4' />
                  Volver al Inventario
                </Button>
              </Link>
            </div>
            <h1 className='text-2xl font-bold'>Gestión de Colecciones</h1>
            <p className='text-muted-foreground'>Administra tus colecciones de productos</p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' onClick={handleRefresh} disabled={isFetching}>
              <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <PlusCircle className='mr-2 size-4' />
              Nueva Colección
            </Button>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
          <div className='rounded-lg border p-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>Total</p>
              <Badge variant='outline'>{collections.length}</Badge>
            </div>
          </div>
          <div className='rounded-lg border p-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>Publicadas</p>
              <Badge variant='default'>
                {collections.filter((c: Collection) => c.publishedOnCurrentPublication).length}
              </Badge>
            </div>
          </div>
          <div className='rounded-lg border p-2'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-medium text-muted-foreground'>Inteligentes</p>
              <Badge variant='secondary'>
                {
                  collections.filter((c: Collection) => c.ruleSet && c.ruleSet.rules?.length > 0)
                    .length
                }
              </Badge>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Table.Loader />
        ) : (
          <div className='w-full min-w-0 max-w-full overflow-x-auto pb-2'>
            <Table.Data
              table={table}
              className='min-w-[800px]'
              emptyMessage='No se encontraron colecciones.'
            />
          </div>
        )}

        {collections.length > 0 && (
          <div className='text-center text-sm text-muted-foreground'>
            Mostrando {collections.length} colecciones
          </div>
        )}
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
    </>
  )
}
