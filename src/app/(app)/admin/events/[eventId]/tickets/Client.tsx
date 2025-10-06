'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowLeft, Download, Filter, RefreshCw, Search } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
import { useFinancialEntries } from '@/modules/finance/hooks'
import { useGetEvent } from '@/services/event/hook'
import { AttendeesList } from '@/src/components/AttendeesList'
import { Table } from '@/src/components/Table'
import { Skeleton } from '@/src/components/ui/skeleton'
import { useOrdersByProduct } from '@/src/modules/customer/hooks'

import { columns } from './columns'

// Forzar que la página sea dinámica
export const dynamic = 'force-dynamic'

const defaultPageSize = 50

export function Client() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const queryClient = useQueryClient()

  const eventId = params.eventId as string

  // Obtener parámetros de la URL
  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const afterCursorInUrl = searchParams.get('after') ?? null
  const pageSizeInUrl = parseInt(searchParams.get('pageSize') ?? defaultPageSize.toString(), 10)
  const searchInUrl = searchParams.get('search') ?? ''
  const statusFilterInUrl = searchParams.get('status') ?? 'all'
  const sortByInUrl = searchParams.get('sortBy') ?? 'processedAt'
  const sortOrderInUrl = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'

  const [searchInput, setSearchInput] = useState(searchInUrl)
  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})
  const [previousPageSize, setPreviousPageSize] = useState(pageSizeInUrl)

  // Obtener información del evento
  const { data: event, isLoading: isLoadingEvent } = useGetEvent(eventId)

  // Obtener órdenes del evento
  const {
    data: ordersData,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useOrdersByProduct(eventId, {
    after: afterCursorInUrl ?? undefined,
    first: pageSizeInUrl,
  })

  // Obtener entradas financieras para mapear información del cliente
  const { data: financialEntries } = useFinancialEntries({ eventId })

  // Función para obtener el nombre del cliente desde las entradas financieras
  const getCustomerNameFromFinancialEntries = (orderId: string): string => {
    if (!financialEntries) return 'Cliente no disponible'

    // Buscar la entrada financiera que coincida con el orderId
    const entry = financialEntries.find(
      (entry) =>
        entry.source === 'Shopify Order' && entry.sourceId === orderId && entry.relatedParty
    )

    return entry?.relatedParty ?? 'Cliente no disponible'
  }

  // Limpiar caché cuando cambian los filtros
  useEffect(() => {
    void queryClient.invalidateQueries({
      queryKey: ['orderManagement', 'ordersByProduct', eventId],
    })
  }, [queryClient, eventId, searchInUrl, statusFilterInUrl, sortByInUrl, sortOrderInUrl])

  // Sincronizar input de búsqueda con la URL
  useEffect(() => {
    setSearchInput(searchInUrl)
  }, [searchInUrl])

  const orders =
    ordersData?.orders.edges.map((edge) => {
      // Extraer el orderId de Shopify para buscar en las entradas financieras
      const orderId = edge.node.id.replace('gid://shopify/Order/', '')

      return {
        customer: edge.node.customer,
        // Obtener información del cliente desde entradas financieras
        customerName: getCustomerNameFromFinancialEntries(orderId),

        displayFinancialStatus: edge.node.displayFinancialStatus,

        displayFulfillmentStatus: edge.node.displayFulfillmentStatus,

        id: edge.node.id,

        lineItemsCount: edge.node.lineItems.edges.length,

        name: edge.node.name,

        processedAt: edge.node.processedAt,

        totalPrice: {
          amount:
            edge.node.currentTotalPriceSet?.shopMoney.amount ??
            edge.node.totalPriceSet?.shopMoney.amount ??
            '0',
          currencyCode:
            edge.node.currentTotalPriceSet?.shopMoney.currencyCode ??
            edge.node.totalPriceSet?.shopMoney.currencyCode ??
            'USD',
        },
      }
    }) ?? []

  const pageInfo = ordersData?.orders.pageInfo

  // Filtrar órdenes por estado si es necesario
  const filteredOrders =
    statusFilterInUrl === 'all'
      ? orders
      : orders.filter((order) => order.displayFinancialStatus === statusFilterInUrl)

  // Calcular estadísticas
  const stats = {
    paid: orders.filter((order) => order.displayFinancialStatus === 'PAID').length,
    pending: orders.filter((order) => order.displayFinancialStatus === 'PENDING').length,
    refunded: orders.filter((order) => order.displayFinancialStatus === 'REFUNDED').length,
    total: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.totalPrice.amount), 0),
    totalTickets: orders.reduce((sum, order) => sum + order.lineItemsCount, 0),
  }

  const handleRefresh = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['orderManagement', 'ordersByProduct', eventId],
    })
    void refetch()
    toast.info('Actualizando datos...')
  }, [refetch, queryClient, eventId])

  const handleSorting = useCallback(
    (columnId: string) => {
      const sortMapping: Record<string, string> = {
        customer: 'customer',
        displayFinancialStatus: 'displayFinancialStatus',
        displayFulfillmentStatus: 'displayFulfillmentStatus',
        lineItemsCount: 'lineItemsCount',
        name: 'name',
        processedAt: 'processedAt',
        totalPrice: 'totalPrice',
      }

      const newSortBy = sortMapping[columnId] || 'processedAt'
      const newSortOrder = sortByInUrl === newSortBy && sortOrderInUrl === 'asc' ? 'desc' : 'asc'

      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('sortBy', newSortBy)
      newUrlParams.set('sortOrder', newSortOrder)
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, { scroll: false })
    },
    [sortByInUrl, sortOrderInUrl, router, searchParams, eventId]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      let targetCursor: string | null | undefined = undefined

      if (newPage === 1) {
        targetCursor = null
      } else {
        targetCursor = historyCursors[newPage]
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
        newUrlParams.delete('after')
      }

      router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, { scroll: false })
    },
    [pageInUrl, historyCursors, pageInfo, router, searchParams, eventId]
  )

  const handlePageSizeChange = useCallback(
    (size: number) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('pageSize', size.toString())
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams, eventId]
  )

  const handleStatusFilterChange = useCallback(
    (status: string) => {
      const newUrlParams = new URLSearchParams(searchParams.toString())
      if (status === 'all') {
        newUrlParams.delete('status')
      } else {
        newUrlParams.set('status', status)
      }
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams, eventId]
  )

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
      router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, { scroll: false })
    }
  }, [isFetching, searchInput, router, searchParams, eventId])

  const handleClearSearch = useCallback(() => {
    const newUrlParams = new URLSearchParams(searchParams.toString())
    newUrlParams.delete('search')
    newUrlParams.set('page', '1')
    newUrlParams.delete('after')
    router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, { scroll: false })
  }, [router, searchParams, eventId])

  const handleClearAllFilters = useCallback(() => {
    setHistoryCursors({})
    router.replace(`/admin/events/${eventId}/tickets`, { scroll: false })
  }, [router, eventId])

  // Manejar cambios de pageSize
  useEffect(() => {
    if (pageSizeInUrl !== previousPageSize) {
      setPreviousPageSize(pageSizeInUrl)
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString())
        newUrlParams.set('page', '1')
        newUrlParams.delete('after')
        router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, {
          scroll: false,
        })
        setHistoryCursors({})
      }
    }
  }, [pageSizeInUrl, previousPageSize, pageInUrl, afterCursorInUrl, router, searchParams, eventId])

  // Actualizar historial de cursors
  useEffect(() => {
    setHistoryCursors((prev) => {
      const newCursors = { ...prev }
      let changed = false
      if (newCursors[pageInUrl] !== afterCursorInUrl) {
        newCursors[pageInUrl] = afterCursorInUrl
        changed = true
      }
      if (pageInfo?.hasNextPage && pageInfo.endCursor) {
        const nextPageNumber = pageInUrl + 1
        if (newCursors[nextPageNumber] !== pageInfo.endCursor) {
          newCursors[nextPageNumber] = pageInfo.endCursor
          changed = true
        }
      } else if (pageInfo && !pageInfo.hasNextPage) {
        const nextPageNumber = pageInUrl + 1
        if (nextPageNumber in newCursors) {
          delete newCursors[nextPageNumber]
          changed = true
        }
      }
      return changed ? newCursors : prev
    })
  }, [pageInUrl, afterCursorInUrl, pageInfo])

  const table = useReactTable({
    columns,
    data: filteredOrders,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      currentSortBy: sortByInUrl,
      currentSortOrder: sortOrderInUrl,
      handleSorting,
    },
  })

  if (isLoadingEvent) {
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

  if (!event) {
    return (
      <div className='space-y-4 p-4 md:p-6'>
        <div className='flex min-h-96 items-center justify-center'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-red-600'>Evento no encontrado</h3>
            <p className='mt-2 text-muted-foreground'>
              El evento que buscas no existe o no tienes permisos para verlo.
            </p>
            <Button onClick={() => router.push('/admin/events')} className='mt-4'>
              Volver a Eventos
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && !orders.length) {
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
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar tickets</h3>
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
    <div className='min-w-0 max-w-full space-y-4 p-2 md:p-4'>
      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => router.push(`/admin/events/${eventId}`)}
            className='bg-surface-container-low hover:bg-surface-container'
          >
            <ArrowLeft className='mr-2 size-4' />
            Volver al Evento
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>Tickets del Evento</h1>
            <p className='text-muted-foreground'>{event.title}</p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <PDFDownloadLink
            document={<AttendeesList.PDF attendees={filteredOrders} event={event} stats={stats} />}
            fileName={`Lista-Asistentes-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`}
          >
            {({ loading }) => (
              <Button
                disabled={loading}
                className='hover:bg-success-container/90 bg-success-container text-success'
              >
                <Download className='mr-2 size-4' />
                {loading ? 'Generando...' : 'Descargar Lista de Asistentes'}
              </Button>
            )}
          </PDFDownloadLink>

          <Button variant='outline' onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6'>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Total Órdenes</p>
            <div className='flex items-center space-x-2'>
              {isFetching && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='outline'>{stats.total}</Badge>
            </div>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Total Boletos</p>
            <div className='flex items-center space-x-2'>
              {isFetching && <RefreshCw className='size-3 animate-spin' />}
              <Badge variant='default'>{stats.totalTickets}</Badge>
            </div>
          </div>
        </div>

        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Ingresos</p>
            <div className='flex items-center space-x-2'>
              {isFetching && <RefreshCw className='size-3 animate-spin' />}
              <Badge className='bg-primary-container text-on-primary-container'>
                ${stats.totalRevenue.toLocaleString('es-MX')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className='flex min-w-0 flex-col space-y-3 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0'>
        <div className='relative flex max-w-sm flex-1'>
          <Input
            placeholder='Buscar por número de orden o cliente...'
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
              <SelectItem value='PAID'>Pagados</SelectItem>
              <SelectItem value='PENDING'>Pendientes</SelectItem>
              <SelectItem value='REFUNDED'>Reembolsados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select
            value={sortByInUrl}
            onValueChange={(value) => {
              const newUrlParams = new URLSearchParams(searchParams.toString())
              newUrlParams.set('sortBy', value)
              newUrlParams.set('page', '1')
              newUrlParams.delete('after')
              router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, {
                scroll: false,
              })
            }}
          >
            <SelectTrigger className='w-36'>
              <SelectValue placeholder='Ordenar por' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='processedAt'>Fecha de compra</SelectItem>
              <SelectItem value='name'>Número de orden</SelectItem>
              <SelectItem value='customer'>Cliente</SelectItem>
              <SelectItem value='lineItemsCount'>Cantidad de boletos</SelectItem>
              <SelectItem value='totalPrice'>Total</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-1'>
          <Select
            value={sortOrderInUrl}
            onValueChange={(value) => {
              const newUrlParams = new URLSearchParams(searchParams.toString())
              newUrlParams.set('sortOrder', value)
              newUrlParams.set('page', '1')
              newUrlParams.delete('after')
              router.push(`/admin/events/${eventId}/tickets?${newUrlParams.toString()}`, {
                scroll: false,
              })
            }}
          >
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
      {(searchInUrl ||
        statusFilterInUrl !== 'all' ||
        sortByInUrl !== 'processedAt' ||
        sortOrderInUrl !== 'desc') && (
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
          {/* Indicador sutil de carga solo para órdenes */}
          {isFetching && (
            <div className='mb-4 flex items-center space-x-2 text-sm text-muted-foreground'>
              <RefreshCw className='size-4 animate-spin' />
              <span>
                {searchInUrl
                  ? `Buscando órdenes que coincidan con "${searchInUrl}"...`
                  : 'Actualizando órdenes...'}
              </span>
            </div>
          )}
          <div className='w-full min-w-0 max-w-full'>
            <Table.Data
              table={table}
              emptyMessage={
                searchInUrl
                  ? `No se encontraron órdenes que coincidan con "${searchInUrl}"`
                  : statusFilterInUrl !== 'all'
                    ? `No hay órdenes con estado "${statusFilterInUrl}"`
                    : 'No se encontraron órdenes para este evento.'
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

      {filteredOrders.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {filteredOrders.length} de {stats.total} órdenes
          {statusFilterInUrl !== 'all' && ` (filtrado por: ${statusFilterInUrl})`}
        </div>
      )}
    </div>
  )
}
