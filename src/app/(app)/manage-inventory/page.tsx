'use client'

import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { Download, Filter, PlusCircle, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebounce } from '@/hooks/use-debounce'
import { useGetProductsPaginated, useUpdateProduct } from '@/services/product/hook'
import { type UpdateProductPayload } from '@/services/product/types'
import { Table } from '@/src/components/Table'

import { columns } from './columns'

interface InventoryTableMeta {
  editingRowId: string | null
  setEditingRowId: (id: string | null) => void
  updateProduct: (payload: {
    id: string
    title?: string
    price?: string
    inventoryQuantity?: number
    status?: 'ACTIVE' | 'DRAFT'
  }) => void
  isUpdating: boolean
}

export default function ManageInventoryPage() {
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [cursors, setCursors] = useState<Record<number, string | undefined>>({ 1: undefined })

  const debouncedSearch = useDebounce(searchTerm, 500)

  const {
    data: paginatedData,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useGetProductsPaginated({
    cursor: cursors[currentPage],
    limit: pageSize,
    search: debouncedSearch,
  })

  const updateMutation = useUpdateProduct()

  const products = paginatedData?.products ?? []
  const pageInfo = paginatedData?.pageInfo

  const filteredProducts =
    statusFilter === 'all'
      ? products
      : products.filter((product) => product.status === statusFilter)

  const stats = {
    active: products.filter((p) => p.status === 'ACTIVE').length,
    draft: products.filter((p) => p.status === 'DRAFT').length,
    outOfStock: products.filter((p) => !p.isAvailable).length,
    total: products.length,
  }

  useEffect(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      setCursors((prev) => ({ ...prev, [currentPage + 1]: pageInfo.endCursor! }))
    }
  }, [pageInfo, currentPage])

  useEffect(() => {
    setCurrentPage(1)
    setCursors({ 1: undefined })
  }, [debouncedSearch, pageSize])

  const handleUpdateProduct = useCallback(
    (payload: Partial<UpdateProductPayload> & { id: string }) => {
      toast.info('Guardando cambios...')
      updateMutation.mutate(payload, {
        onError: (err) => {
          toast.error(`Error al actualizar: ${err.message}`)
        },
        onSuccess: () => {
          toast.success('Producto actualizado con éxito.')
          setEditingRowId(null)
        },
      })
    },
    [updateMutation]
  )

  const handleRefresh = useCallback(() => {
    void refetch()
    toast.info('Actualizando datos...')
  }, [refetch])

  const table = useReactTable({
    columns,
    data: filteredProducts,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    meta: {
      editingRowId,
      isUpdating: updateMutation.isPending,
      setEditingRowId,
      updateProduct: handleUpdateProduct,
    } as InventoryTableMeta,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
      },
    },
  })

  if (isLoading && !products.length) {
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
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar productos</h3>
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
    <div className='space-y-6 p-4 md:p-6'>
      <div className='flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div>
          <h1 className='text-2xl font-bold'>Gestión de Inventario</h1>
          <p className='text-muted-foreground'>Administra tu catálogo de obras de arte</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href='/manage-inventory/create'>
            <Button>
              <PlusCircle className='mr-2 size-4' />
              Crear Nueva Obra
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Total</p>
            <Badge variant='outline'>{stats.total}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Activos</p>
            <Badge variant='default'>{stats.active}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Borradores</p>
            <Badge variant='secondary'>{stats.draft}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-3'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Sin Stock</p>
            <Badge variant='destructive'>{stats.outOfStock}</Badge>
          </div>
        </div>
      </div>

      <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0'>
        <div className='relative max-w-sm flex-1'>
          <Search className='absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400' />
          <Input
            placeholder='Buscar por título, tipo, artista...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className='w-48'>
            <Filter className='mr-2 size-4' />
            <SelectValue placeholder='Filtrar por estado' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>Todos los estados</SelectItem>
            <SelectItem value='ACTIVE'>Activos</SelectItem>
            <SelectItem value='DRAFT'>Borradores</SelectItem>
            <SelectItem value='ARCHIVED'>Archivados</SelectItem>
          </SelectContent>
        </Select>

        <Button variant='outline' size='sm'>
          <Download className='mr-2 size-4' />
          Exportar
        </Button>
      </div>

      {isFetching && (
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <RefreshCw className='size-4 animate-spin' />
          <span>Actualizando datos...</span>
        </div>
      )}

      <div className='rounded-md border'>
        <Table.Data
          table={table}
          emptyMessage={
            debouncedSearch
              ? `No se encontraron productos que coincidan con "${debouncedSearch}"`
              : statusFilter !== 'all'
                ? `No hay productos con estado "${statusFilter}"`
                : 'No se encontraron productos.'
          }
        />
      </div>

      <Table.Pagination
        table={table}
        isServerSide={true}
        hasNextPage={pageInfo?.hasNextPage}
        hasPreviousPage={currentPage > 1}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setCurrentPage(1)
        }}
      />

      {filteredProducts.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {filteredProducts.length} de {stats.total} productos
          {statusFilter !== 'all' && ` (filtrado por: ${statusFilter})`}
        </div>
      )}
    </div>
  )
}
