'use client'

import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Filter, PlusCircle, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { useAuth } from '@/modules/auth/context/useAuth'
import { useGetProductsPaginated, useProductStats, useUpdateProduct } from '@/services/product/hook'
import { type UpdateProductPayload } from '@/services/product/types'
import { Table } from '@/src/components/Table'
import { ROUTES } from '@/src/config/routes'

import { Skeleton } from '@/src/components/ui/skeleton'
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

const defaultPageSize = 50
const pageSizeOptions = [ 25, 50, 100 ]

export function Client() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Obtener parámetros de la URL
  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const afterCursorInUrl = searchParams.get('after') ?? null
  const pageSizeInUrl = parseInt(searchParams.get('pageSize') ?? defaultPageSize.toString(), 10)
  const searchInUrl = searchParams.get('search') ?? ''
  const statusFilterInUrl = searchParams.get('status') ?? 'all'
  const sortByInUrl = searchParams.get('sortBy') ?? 'title'
  const sortOrderInUrl = (searchParams.get('sortOrder') ?? 'asc') as 'asc' | 'desc'

  const [ editingRowId, setEditingRowId ] = useState<string | null>(null)
  const [ editingChanges, setEditingChanges ] = useState<Record<string, any>>({})
  const [ searchInput, setSearchInput ] = useState(searchInUrl)
  const [ historyCursors, setHistoryCursors ] = useState<Record<number, string | null>>({})
  const [ previousPageSize, setPreviousPageSize ] = useState(pageSizeInUrl)

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
  }, [ searchInUrl, statusFilterInUrl, sortByInUrl, sortOrderInUrl, pageInUrl ])

  const {
    data: paginatedData,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useGetProductsPaginated({
    cursor: afterCursorInUrl || undefined,
    limit: pageSizeInUrl,
    search: searchInUrl,
    sortBy: sortByInUrl,
    sortOrder: sortOrderInUrl,
    status: statusFilterInUrl !== 'all' ? statusFilterInUrl : undefined,
  })

  const {
    data: statsData,
    isLoading: isLoadingStats,
    isFetching: isFetchingStats,
  } = useProductStats({
    search: searchInUrl,
    status: statusFilterInUrl !== 'all' ? statusFilterInUrl : undefined,
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

  // Sincronizar input de búsqueda con la URL
  useEffect(() => {
    setSearchInput(searchInUrl)
  }, [ searchInUrl ])

  const products = paginatedData?.products ?? []
  const pageInfo = paginatedData?.pageInfo

  const filteredProducts =
    statusFilterInUrl === 'all'
      ? products
      : products.filter((product) => product.status === statusFilterInUrl)

  const stats = {
    active: statsData?.active ?? (isLoadingStats ? '...' : 0),
    draft: statsData?.draft ?? (isLoadingStats ? '...' : 0),
    outOfStock: statsData?.outOfStock ?? (isLoadingStats ? '...' : 0),
    total: statsData?.total ?? (isLoadingStats ? '...' : 0),
  }



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
        depth: editingChanges.artworkDetails.depth,
        height: editingChanges.artworkDetails.height,
        location: editingChanges.artworkDetails.location,
        medium: editingChanges.artworkDetails.medium,
        serie: editingChanges.artworkDetails.serie,
        width: editingChanges.artworkDetails.width,
        year: editingChanges.artworkDetails.year,
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
          depth: payload.artworkDetails.depth,
          height: payload.artworkDetails.height,
          location: payload.artworkDetails.location,
          medium: payload.artworkDetails.medium,
          serie: payload.artworkDetails.serie,
          width: payload.artworkDetails.width,
          year: payload.artworkDetails.year,
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
    const newSortOrder = sortByInUrl === newSortBy && sortOrderInUrl === 'asc' ? 'desc' : 'asc'

    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.set('sortBy', newSortBy)
    newUrlParams.set('sortOrder', newSortOrder)
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
  }, [ sortByInUrl, sortOrderInUrl, router, searchParams ])

  const handlePageChange = useCallback((newPage: number) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    let targetCursor: string | null | undefined = undefined

    if (newPage === 1) {
      targetCursor = null
    } else {
      targetCursor = historyCursors[ newPage ]
    }

    if (newPage > pageInUrl && newPage === pageInUrl + 1) {
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        targetCursor = pageInfo.endCursor
      }
    }

    newUrlParams.set('page', newPage.toString())
    if (targetCursor === null) {
      newUrlParams.delete('after')
    } else if (targetCursor) {
      newUrlParams.set('after', targetCursor)
    } else {
      // Si no tenemos cursor para esta página, intentar navegar sin cursor
      // y dejar que el servidor maneje la paginación
      console.warn(`Cursor para página ${newPage} no encontrado. Intentando navegar sin cursor.`)
      newUrlParams.delete('after')
    }

    router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
  }, [ pageInUrl, historyCursors, pageInfo, router, searchParams ])

  const handlePageSizeChange = useCallback((size: number) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.set('pageSize', size.toString())
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
  }, [ router, searchParams ])

  const handleStatusFilterChange = useCallback((status: string) => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    if (status === 'all') {
      newUrlParams.delete('status')
    } else {
      newUrlParams.set('status', status)
    }
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
  }, [ router, searchParams ])

  const handleSearchSubmit = useCallback(() => {
    if (!isFetching) {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      if (searchInput) {
        newUrlParams.set('search', searchInput)
      } else {
        newUrlParams.delete('search')
      }
      router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
    }
  }, [ isFetching, searchInput, router, searchParams ])

  const handleClearSearch = useCallback(() => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.delete('search')
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
  }, [ router, searchParams ])

  const handleClearAllFilters = useCallback(() => {
    // Limpiar estado de edición
    setEditingRowId(null)
    setEditingChanges({})
    setHistoryCursors({})

    // Navegar a la URL base sin parámetros
    router.replace('/manage-inventory', { scroll: false })
  }, [ router ])

  // Manejar cambios de pageSize
  useEffect(() => {
    if (pageSizeInUrl !== previousPageSize) {
      setPreviousPageSize(pageSizeInUrl)
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString())
        newUrlParams.set('page', '1')
        newUrlParams.delete('after')
        router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
        setHistoryCursors({})
      }
    }
  }, [ pageSizeInUrl, previousPageSize, pageInUrl, afterCursorInUrl, router, searchParams ])

  // Actualizar historial de cursors
  useEffect(() => {
    setHistoryCursors((prev) => {
      const newCursors = { ...prev }
      let changed = false
      if (newCursors[ pageInUrl ] !== afterCursorInUrl) {
        newCursors[ pageInUrl ] = afterCursorInUrl
        changed = true
      }
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1
        if (newCursors[ nextPageNumber ] !== pageInfo.endCursor) {
          newCursors[ nextPageNumber ] = pageInfo.endCursor
          changed = true
        }
      } else if (pageInfo && !pageInfo.hasNextPage) {
        const nextPageNumber = pageInUrl + 1
        if (nextPageNumber in newCursors) {
          delete newCursors[ nextPageNumber ]
          changed = true
        }
      }
      return changed ? newCursors : prev
    })
  }, [ pageInUrl, afterCursorInUrl, pageInfo ])



  const table = useReactTable({
    columns,
    data: products,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      currentSortBy: sortByInUrl,
      currentSortOrder: sortOrderInUrl,
      editingChanges,
      editingRowId,
      handleSorting,
      isAdmin,
      isArtist,
      isUpdating: updateMutation.isPending,
      saveAllChanges,
      setEditingRowId,
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

  const totalPages = pageInfo?.hasNextPage ? pageInUrl + 1 : pageInUrl

  return (
    <div className='space-y-4 p-2 md:p-4 min-w-0 max-w-full'>
      <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 min-w-0'>
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

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Total</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='outline'>{stats.total}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Activos</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='default'>{stats.active}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Borradores</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='secondary'>{stats.draft}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Sin Stock</p>
            <div className='flex items-center space-x-2'>
              {isFetchingStats && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='destructive'>{stats.outOfStock}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0 min-w-0'>
        <div className='relative max-w-sm flex-1 flex'>
          <Input
            placeholder='Buscar por título, tipo, artista...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit()
              }
            }}
            className='rounded-r-none'
            disabled={isFetching}
          />
          <Button
            onClick={handleSearchSubmit}
            className='rounded-l-none px-3'
            variant='default'
            disabled={isFetching}
          >
            {isFetching ? (
              <RefreshCw className='size-4 animate-spin' />
            ) : (
              <Search className='size-4' />
            )}
          </Button>
          {searchInUrl && (
            <Button
              onClick={handleClearSearch}
              className='ml-2 px-3'
              variant='outline'
              size='sm'
              disabled={isFetching}
            >
              Limpiar
            </Button>
          )}
        </div>

        {searchInUrl && (
          <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
            <Search className='size-4' />
            <span>Buscando: "{searchInUrl}"</span>
          </div>
        )}

        <div className='flex items-center space-x-1'>
          <Select value={statusFilterInUrl} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className='w-44'>
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
        </div>

        <div className='flex items-center space-x-1'>
          <Select value={sortByInUrl} onValueChange={(value) => {
            const newUrlParams = new URLSearchParams(searchParams.toString())
            newUrlParams.set('sortBy', value)
            newUrlParams.set('page', '1')
            newUrlParams.delete('after')
            router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
          }}>
            <SelectTrigger className='w-36'>
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
        </div>

        <div className='flex items-center space-x-1'>
          <Select value={sortOrderInUrl} onValueChange={(value) => {
            const newUrlParams = new URLSearchParams(searchParams.toString())
            newUrlParams.set('sortOrder', value)
            newUrlParams.set('page', '1')
            newUrlParams.delete('after')
            router.push(`/manage-inventory?${newUrlParams.toString()}`, { scroll: false })
          }}>
            <SelectTrigger className='w-28'>
              <SelectValue placeholder='Orden' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='asc'>Ascendente</SelectItem>
              <SelectItem value='desc'>Descendente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Botón para limpiar todos los filtros */}
      {(searchInUrl || statusFilterInUrl !== 'all' || sortByInUrl !== 'title' || sortOrderInUrl !== 'asc') && (
        <div className='flex justify-end'>
          <Button
            onClick={handleClearAllFilters}
            variant='container-destructive'
            disabled={isFetching}
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}

      {/* Mostrar loader cuando se están cargando datos inicialmente o cuando se están actualizando filtros */}
      {isLoading ? (
        <Table.Loader />
      ) : (
        <>
          {/* Indicador sutil de carga solo para productos */}
          {isFetching && (
            <div className='mb-4 flex items-center space-x-2 text-sm text-muted-foreground'>
              <RefreshCw className='size-4 animate-spin' />
              <span>
                {searchInUrl
                  ? `Buscando productos que coincidan con "${searchInUrl}"...`
                  : 'Actualizando productos...'
                }
              </span>
            </div>
          )}
          <div className='w-full min-w-0 max-w-full'>
            <Table.Data
              table={table}
              emptyMessage={
                searchInUrl
                  ? `No se encontraron productos que coincidan con "${searchInUrl}"`
                  : statusFilterInUrl !== 'all'
                    ? `No hay productos con estado "${statusFilterInUrl}"`
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
        hasPreviousPage={pageInUrl > 1}
        currentPage={pageInUrl}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {filteredProducts.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {filteredProducts.length} de {stats.total} productos
          {statusFilterInUrl !== 'all' && ` (filtrado por: ${statusFilterInUrl})`}
        </div>
      )}
    </div>
  )
}
