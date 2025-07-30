'use client'

import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Filter, PlusCircle, RefreshCw, Search } from 'lucide-react'
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
import { useAuth } from '@/modules/auth/context/useAuth'
import { useGetProductsPaginated, useProductStats, useUpdateProduct } from '@/services/product/hook'
import { type UpdateProductPayload } from '@/services/product/types'
import { Table } from '@/src/components/Table'
import { ROUTES } from '@/src/config/routes'

import { columns } from './columns'

// Forzar que la página sea dinámica
export const dynamic = 'force-dynamic'

interface InventoryTableMeta {
  editingRowId: string | null
  setEditingRowId: (id: string | null) => void
  updateProduct: (payload: {
    id: string
    title?: string
    vendor?: string
    productType?: string
    price?: string
    inventoryQuantity?: number
    status?: 'ACTIVE' | 'DRAFT'
    artworkDetails?: {
      medium?: string
      year?: string
      serie?: string
      location?: string
      height?: string
      width?: string
      depth?: string
    }
  }) => void
  isUpdating: boolean
  handleSorting: (columnId: string) => void
  currentSortBy: string
  currentSortOrder: 'asc' | 'desc'
  // Nuevos campos para manejo de cambios acumulados
  editingChanges?: Record<string, any>
  updateEditingChanges?: (changes: Record<string, any>) => void
  saveAllChanges?: () => void
  // Información del usuario para las columnas
  user?: any
  isAdmin?: boolean
  isArtist?: boolean
}

export default function ManageInventoryPage() {
  const [ editingRowId, setEditingRowId ] = useState<string | null>(null)
  const [ editingChanges, setEditingChanges ] = useState<Record<string, any>>({})
  const [ searchTerm, setSearchTerm ] = useState('')
  const [ currentPage, setCurrentPage ] = useState(1)
  const [ pageSize, setPageSize ] = useState(50)
  const [ statusFilter, setStatusFilter ] = useState<string>('all')
  const [ sortBy, setSortBy ] = useState<string>('title')
  const [ sortOrder, setSortOrder ] = useState<'asc' | 'desc'>('asc')

  const [ cursors, setCursors ] = useState<Record<number, string | undefined>>({ 1: undefined })

  const debouncedSearch = useDebounce(searchTerm, 500)

  const queryClient = useQueryClient()
  const { hasPermission, user } = useAuth()

  // Determinar si el usuario es administrador o artista
  const isAdmin = hasPermission('manage_products')
  const isArtist = hasPermission('manage_own_products') && !isAdmin

  useEffect(() => {
    // Invalidar caché de productos al cargar la página
    void queryClient.invalidateQueries({ queryKey: [ 'managementProducts' ] })
  }, [ queryClient ])

  // Limpiar estado de edición cuando cambian los filtros
  useEffect(() => {
    setEditingRowId(null)
    setEditingChanges({})
  }, [ debouncedSearch, statusFilter, sortBy, sortOrder, currentPage ])

  const {
    data: paginatedData,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useGetProductsPaginated({
    cursor: cursors[ currentPage ],
    limit: pageSize,
    search: debouncedSearch,
    sortBy,
    sortOrder,
  })

  const {
    data: statsData,
    isLoading: isLoadingStats,
  } = useProductStats({
    search: debouncedSearch,
  })

  const updateMutation = useUpdateProduct()

  // Forzar actualización cuando se actualiza un producto
  useEffect(() => {
    if (updateMutation.isSuccess) {
      // El hook useUpdateProduct ya maneja toda la invalidación necesaria
      // Solo necesitamos limpiar el estado de edición
      setEditingRowId(null)
      setEditingChanges({})
    }
  }, [ updateMutation.isSuccess ])

  const products = paginatedData?.products ?? []
  const pageInfo = paginatedData?.pageInfo

  const filteredProducts =
    statusFilter === 'all'
      ? products
      : products.filter((product) => product.status === statusFilter)

  const stats = {
    active: statsData?.active ?? 0,
    draft: statsData?.draft ?? 0,
    outOfStock: statsData?.outOfStock ?? 0,
    total: statsData?.total ?? 0,
  }

  useEffect(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      setCursors((prev) => ({ ...prev, [ currentPage + 1 ]: pageInfo.endCursor! }))
    }
  }, [ pageInfo, currentPage ])

  useEffect(() => {
    setCurrentPage(1)
    setCursors({ 1: undefined })
  }, [ debouncedSearch, pageSize, sortBy, sortOrder ])

  const updateEditingChanges = useCallback((changes: Record<string, any>) => {
    console.log('Updating editing changes:', changes) // Debug
    setEditingChanges(prev => {
      let newChanges = { ...prev }

      // Si hay cambios en artworkDetails, fusionarlos correctamente
      if (changes.artworkDetails) {
        newChanges = {
          ...newChanges,
          artworkDetails: {
            ...(newChanges.artworkDetails || {}),
            ...changes.artworkDetails
          }
        }
      } else {
        // Para otros campos, simplemente fusionar
        newChanges = { ...newChanges, ...changes }
      }

      console.log('New editing changes:', newChanges) // Debug
      return newChanges
    })
  }, [])

  const saveAllChanges = useCallback(() => {
    if (!editingRowId || Object.keys(editingChanges).length === 0) return

    toast.info('Guardando cambios...')

    // Preparar el payload completo para la actualización usando el mismo patrón que Form.Product
    const updatePayload: UpdateProductPayload = {
      details: editingChanges.artworkDetails ? {
        artist: editingChanges.vendor ?? editingChanges.artworkDetails.artist,
        medium: editingChanges.artworkDetails.medium,
        height: editingChanges.artworkDetails.height,
        serie: editingChanges.artworkDetails.serie,
        depth: editingChanges.artworkDetails.depth,
        year: editingChanges.artworkDetails.year,
        location: editingChanges.artworkDetails.location,
        width: editingChanges.artworkDetails.width,
      } : undefined,
      id: editingRowId,
      inventoryQuantity: editingChanges.inventoryQuantity,
      price: editingChanges.price,
      productType: editingChanges.productType,
      status: editingChanges.status,
      title: editingChanges.title,
      vendor: editingChanges.vendor,
    }

    console.log('Saving changes:', updatePayload) // Debug

    updateMutation.mutate(updatePayload, {
      onError: (err) => {
        console.error('Error updating product:', err) // Debug
        toast.error(`Error al actualizar: ${err.message}`)
      },
      onSuccess: (updatedProduct) => {
        console.log('Product updated successfully:', updatedProduct) // Debug
        toast.success('Producto actualizado con éxito.')
        setEditingRowId(null)
        setEditingChanges({})

        // El hook useUpdateProduct ya maneja toda la invalidación necesaria
        // No necesitamos invalidar manualmente aquí
      },
    })
  }, [ editingRowId, editingChanges, updateMutation ])

  const handleUpdateProduct = useCallback(
    (payload: {
      id: string
      title?: string
      vendor?: string
      productType?: string
      price?: string
      inventoryQuantity?: number
      status?: 'ACTIVE' | 'DRAFT'
      artworkDetails?: {
        medium?: string
        year?: string
        serie?: string
        location?: string
        height?: string
        width?: string
        depth?: string
      }
    }) => {
      toast.info('Guardando cambios...')

      // Preparar el payload completo para la actualización
      const updatePayload: UpdateProductPayload = {
        details: payload.artworkDetails ? {
          artist: payload.vendor ?? undefined,
          medium: payload.artworkDetails.medium,
          height: payload.artworkDetails.height,
          serie: payload.artworkDetails.serie,
          depth: payload.artworkDetails.depth,
          year: payload.artworkDetails.year,
          location: payload.artworkDetails.location,
          width: payload.artworkDetails.width,
        } : undefined,
        id: payload.id,
        inventoryQuantity: payload.inventoryQuantity,
        price: payload.price,
        productType: payload.productType,
        status: payload.status,
        title: payload.title,
        vendor: payload.vendor,
      }

      updateMutation.mutate(updatePayload, {
        onError: (err) => {
          toast.error(`Error al actualizar: ${err.message}`)
        },
        onSuccess: () => {
          toast.success('Producto actualizado con éxito.')
          setEditingRowId(null)

          // Invalidar todos los cachés relacionados con productos
          void queryClient.invalidateQueries({ queryKey: [ 'managementProducts' ] })
          void queryClient.invalidateQueries({ queryKey: [ 'productStats' ] })
          void queryClient.invalidateQueries({ queryKey: [ 'product' ] })

          // Forzar un refresh de los datos para asegurar que estén actualizados
          void refetch()
        },
      })
    },
    [ updateMutation, refetch, queryClient ]
  )

  const handleRefresh = useCallback(() => {
    // Limpiar caché y forzar actualización
    void queryClient.invalidateQueries({ queryKey: [ 'managementProducts' ] })
    void queryClient.invalidateQueries({ queryKey: [ 'productStats' ] })
    setEditingRowId(null)
    void refetch()
    toast.info('Actualizando datos...')
  }, [ refetch, queryClient ])

  const handleSorting = useCallback((columnId: string) => {
    const sortMapping: Record<string, string> = {
      inventory: 'inventoryQuantity',
      price: 'price',
      productType: 'productType',
      status: 'status',
      title: 'title',
      vendor: 'vendor',
    }

    const newSortBy = sortMapping[ columnId ] || 'title'
    const newSortOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc'

    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
  }, [ sortBy, sortOrder ])

  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      currentSortBy: sortBy,
      currentSortOrder: sortOrder,
      editingChanges,
      editingRowId,
      handleSorting,
      isAdmin,
      isArtist,
      isUpdating: updateMutation.isPending,
      setEditingRowId,
      saveAllChanges,
      
      updateEditingChanges,
      
updateProduct: handleUpdateProduct,
      // Información del usuario para las columnas
user,
    } as InventoryTableMeta,
  })

  if ((isLoading || isLoadingStats) && !products.length) {
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
          <Link href={ROUTES.INVENTORY.CREATE.PATH}>
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

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Ordenar por' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='title'>Título</SelectItem>
            <SelectItem value='vendor'>Artista</SelectItem>
            <SelectItem value='price'>Precio</SelectItem>
            <SelectItem value='createdAt'>Fecha de creación</SelectItem>
            <SelectItem value='updatedAt'>Fecha de actualización</SelectItem>
            <SelectItem value='inventoryQuantity'>Cantidad en inventario</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
          <SelectTrigger className='w-32'>
            <SelectValue placeholder='Orden' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='asc'>Ascendente</SelectItem>
            <SelectItem value='desc'>Descendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mostrar loader cuando se están cargando datos inicialmente o cuando se están actualizando filtros */}
      {isLoading ? (
        <Table.Loader />
      ) : (
        <>
          {isFetching && products.length > 0 && (
            <div className='mb-4 flex items-center space-x-2 text-sm text-muted-foreground'>
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
        </>
      )}

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