'use client'

import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { RefreshCw } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { memo, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Guard } from '@/components/Guards'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table } from '@/src/components/Table'
import { PERMISSIONS } from '@/src/config/Permissions'
import { useAllOrdersHybrid, useCustomerOrders } from '@/src/modules/customer/hooks'

import { columns } from './columns'

import type { Order } from '@/src/modules/customer/types'
export const dynamic = 'force-dynamic'

type OrdersTab = 'my-orders' | 'all-orders'

function OrdersContentComponent({
  activeQuery,
  handlePageChange,
  handlePageSizeChange,
  handleRefresh,
  handleSearchSubmit,
  orders,
  pageInUrl,
  pageInfo,
  searchInUrl,
  searchInput,
  setSearchInput,
  table,
}: {
  activeQuery: any
  handlePageChange: (newPage: number) => void
  handlePageSizeChange: (size: number) => void
  handleRefresh: () => void
  handleSearchSubmit: () => void
  orders: Order[]
  pageInfo: any
  pageInUrl: number
  searchInUrl: string
  searchInput: string
  setSearchInput: (value: string) => void
  table: any
}) {
  return (
    <>
      <Table.Toolbar
        searchTerm={searchInput}
        onSearchChange={setSearchInput}
        placeholder='Buscar por número de orden, cliente, email...'
        onSubmit={handleSearchSubmit}
      >
        <Button variant='outline' onClick={handleRefresh} disabled={activeQuery.isFetching}>
          <RefreshCw className={`mr-2 size-4 ${activeQuery.isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </Table.Toolbar>

      {activeQuery.isFetching && (
        <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
          <RefreshCw className='size-4 animate-spin' />
          <span>Actualizando datos...</span>
        </div>
      )}

      <div className='rounded-md border bg-card shadow-elevation-1'>
        <Table.Data
          table={table}
          emptyMessage={
            searchInUrl
              ? `No se encontraron órdenes que coincidan con "${searchInUrl}"`
              : 'No se encontraron órdenes.'
          }
        />
      </div>

      <Table.Pagination
        table={table}
        isServerSide={true}
        hasNextPage={pageInfo?.hasNextPage}
        hasPreviousPage={pageInUrl > 1}
        currentPage={pageInUrl}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {orders.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {orders.length} órdenes
        </div>
      )}
    </>
  )
}

const OrdersContent = memo(OrdersContentComponent, (prev, next) => {
  // Only re-render if searchInput or orders data changes
  return (
    prev.searchInput === next.searchInput &&
    prev.orders.length === next.orders.length &&
    prev.activeQuery.isFetching === next.activeQuery.isFetching &&
    prev.pageInfo === next.pageInfo
  )
})

export default function OrdersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const activeTabInUrl = searchParams.get('tab') ?? 'my-orders'
  const pageInUrl = parseInt(searchParams.get('page') ?? '1', 10)
  const pageSizeInUrl = parseInt(searchParams.get('pageSize') ?? '10', 10)
  const searchInUrl = searchParams.get('search') ?? ''
  const sortByInUrl = (searchParams.get('sortBy') ?? 'processedAt') as string
  const sortOrderInUrl = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc'
  const afterCursorInUrl = searchParams.get('after') ?? null

  const [activeTab, setActiveTab] = useState<OrdersTab>(activeTabInUrl as OrdersTab)
  const [searchInput, setSearchInput] = useState(searchInUrl)
  const [historyCursors, setHistoryCursors] = useState<Record<number, string | null>>({})
  const [previousPageSize, setPreviousPageSize] = useState(pageSizeInUrl)

  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(activeTabInUrl as OrdersTab)
  }, [activeTabInUrl])

  const allOrdersQuery = useAllOrdersHybrid({
    after: afterCursorInUrl ?? undefined,
    first: pageSizeInUrl,
    query: searchInUrl,
    sortBy: sortByInUrl,
    sortOrder: sortOrderInUrl,
  })

  const customerOrdersQuery = useCustomerOrders({
    after: afterCursorInUrl ?? undefined,
    first: pageSizeInUrl,
  })

  const activeQuery = activeTab === 'all-orders' ? allOrdersQuery : customerOrdersQuery

  const orders: Order[] = (() => {
    let ordersArray: Order[]

    if (activeTab === 'all-orders') {
      const hybridData = allOrdersQuery.data as { orders: { edges: { node: Order }[] } } | undefined
      ordersArray =
        hybridData?.orders.edges.map((edge) => ({
          customer: edge.node.customer,
          displayFinancialStatus: edge.node.displayFinancialStatus,
          displayFulfillmentStatus: edge.node.displayFulfillmentStatus,
          id: edge.node.id,
          lineItemsCount: edge.node.lineItemsCount,
          name: edge.node.name,
          processedAt: edge.node.processedAt,
          requiresShipping: edge.node.requiresShipping,
          shippingLine: edge.node.shippingLine,
          totalPrice: {
            amount: edge.node.totalPrice.amount,
            currencyCode: edge.node.totalPrice.currencyCode,
          },
        })) ?? []
    } else {
      ordersArray =
        customerOrdersQuery.data?.customer?.orders?.edges.map((edge) => ({
          displayFinancialStatus: edge.node.financialStatus,
          fulfillmentStatus: edge.node.fulfillmentStatus,
          id: edge.node.id,
          lineItemsCount: edge.node.lineItems.edges.length,
          name: edge.node.name,
          processedAt: edge.node.processedAt,
          requiresShipping: edge.node.requiresShipping,
          totalPrice: {
            amount: edge.node.totalPrice.amount,
            currencyCode: edge.node.totalPrice.currencyCode,
          },
        })) ?? []
    }

    // Client-side sorting for fields not supported by Shopify API
    const serverSupportedSortKeys = [
      'name',
      'processedAt',
      'totalPrice',
      'createdAt',
      'updatedAt',
      'id',
    ]
    if (!serverSupportedSortKeys.includes(sortByInUrl)) {
      const sorted = [...ordersArray].sort((a, b) => {
        let aVal: string | number
        let bVal: string | number

        switch (sortByInUrl) {
          case 'customerName':
            aVal = `${a.customer?.firstName ?? ''} ${a.customer?.lastName ?? ''}`.trim()
            bVal = `${b.customer?.firstName ?? ''} ${b.customer?.lastName ?? ''}`.trim()
            break
          case 'customerEmail':
            aVal = a.customer?.email ?? ''
            bVal = b.customer?.email ?? ''
            break
          case 'displayFinancialStatus':
            aVal = a.displayFinancialStatus ?? ''
            bVal = b.displayFinancialStatus ?? ''
            break
          case 'shippingMethod':
            aVal = a.shippingLine?.title ?? ''
            bVal = b.shippingLine?.title ?? ''
            break
          case 'fulfillmentStatus':
            aVal = a.fulfillmentStatus ?? a.displayFulfillmentStatus ?? ''
            bVal = b.fulfillmentStatus ?? b.displayFulfillmentStatus ?? ''
            break
          default:
            return 0
        }

        // Compare values
        if (aVal < bVal) return sortOrderInUrl === 'asc' ? -1 : 1
        if (aVal > bVal) return sortOrderInUrl === 'asc' ? 1 : -1
        return 0
      })
      return sorted
    }

    return ordersArray
  })()

  const pageInfo = (() => {
    if (activeTab === 'all-orders') {
      const hybridData = allOrdersQuery.data as
        | {
            orders: {
              pageInfo: {
                hasNextPage: boolean
                hasPreviousPage: boolean
                startCursor?: string | null
                endCursor?: string | null
              }
            }
          }
        | undefined
      return hybridData?.orders.pageInfo
    }
    return customerOrdersQuery.data?.customer?.orders?.pageInfo
  })()

  const tableColumns =
    activeTab === 'all-orders'
      ? columns
      : // Customer sees: Orden, Fecha, Estado de Pago, Estado de Envío, Total
        columns.filter(
          (col) =>
            col.id !== 'customerName' &&
            col.id !== 'customerEmail' &&
            col.id !== 'shippingMethod' &&
            col.id !== 'displayFinancialStatus'
        )

  // Handlers
  const handleRefresh = useCallback(() => {
    void activeQuery.refetch()
    toast.info('Actualizando datos...')
  }, [activeQuery])

  const handleSorting = useCallback(
    (columnId: string) => {
      const currentSearchParams = new URLSearchParams(window.location.search)
      currentSearchParams.set('sortBy', columnId)
      const newSortOrder = sortByInUrl === columnId && sortOrderInUrl === 'desc' ? 'asc' : 'desc'
      currentSearchParams.set('sortOrder', newSortOrder)
      currentSearchParams.set('page', '1')
      currentSearchParams.delete('after')
      router.push(`/orders?${currentSearchParams.toString()}`, { scroll: false })
    },
    [sortByInUrl, sortOrderInUrl, router]
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

      router.push(`/orders?${newUrlParams.toString()}`, { scroll: false })
    },
    [pageInUrl, historyCursors, pageInfo, router, searchParams]
  )

  const handlePageSizeChange = useCallback(
    (size: number) => {
      const currentSearchParams = new URLSearchParams(window.location.search)
      currentSearchParams.set('pageSize', size.toString())
      currentSearchParams.set('page', '1')
      currentSearchParams.delete('after')
      router.push(`/orders?${currentSearchParams.toString()}`, { scroll: false })
    },
    [router]
  )

  const handleSearchSubmit = useCallback(() => {
    if (!activeQuery.isFetching) {
      const currentSearchParams = new URLSearchParams(window.location.search)
      currentSearchParams.set('page', '1')
      currentSearchParams.delete('after')
      if (searchInput) {
        currentSearchParams.set('search', searchInput)
      } else {
        currentSearchParams.delete('search')
      }
      router.push(`/orders?${currentSearchParams.toString()}`, { scroll: false })
    }
  }, [activeQuery.isFetching, searchInput, router])

  const handleTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab as OrdersTab)
      const newUrlParams = new URLSearchParams(searchParams.toString())
      newUrlParams.set('tab', tab)
      newUrlParams.set('page', '1')
      newUrlParams.delete('after')
      router.push(`/orders?${newUrlParams.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  // Update cursors
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

  // Update previousPageSize
  useEffect(() => {
    if (pageSizeInUrl !== previousPageSize) {
      setPreviousPageSize(pageSizeInUrl)
      if (pageInUrl > 1 || afterCursorInUrl) {
        const newUrlParams = new URLSearchParams(searchParams.toString())
        newUrlParams.set('page', '1')
        newUrlParams.delete('after')
        router.push(`/orders?${newUrlParams.toString()}`, { scroll: false })
        setHistoryCursors({})
      }
    }
  }, [pageSizeInUrl, previousPageSize, pageInUrl, afterCursorInUrl, router, searchParams])

  const table = useReactTable({
    columns: tableColumns,
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    meta: {
      currentSortBy: sortByInUrl,
      currentSortOrder: sortOrderInUrl,
      handleSorting,
    },
    onSortingChange: () => {
      // Handled by handleSorting in meta
    },
    state: {
      pagination: {
        pageIndex: pageInUrl - 1,
        pageSize: pageSizeInUrl,
      },
    },
  })

  if (activeQuery.isLoading && !orders.length) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='mb-6 text-3xl font-bold'>Órdenes</h1>
        <Table.Loader />
      </div>
    )
  }

  if (activeQuery.error) {
    return (
      <div className='container mx-auto py-10'>
        <h1 className='mb-6 text-3xl font-bold'>Órdenes</h1>
        <div className='bg-error-container/20 rounded-lg border border-error-container p-6 text-center'>
          <h3 className='font-semibold text-on-error-container'>
            {activeTab === 'all-orders'
              ? 'Error al cargar las órdenes'
              : 'Error al cargar tus órdenes'}
          </h3>
          <p className='text-on-error-container/80 mt-2 text-sm'>{activeQuery.error.message}</p>
          <Button
            onClick={handleRefresh}
            className='hover:bg-primary/90 mt-4 bg-primary text-on-primary'
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-10'>
      <h1 className='mb-6 text-3xl font-bold'>Órdenes</h1>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value='my-orders'>Mis Órdenes</TabsTrigger>
          <Guard.Permission permission={PERMISSIONS.VIEW_ALL_ORDERS}>
            <TabsTrigger value='all-orders'>Todas las Órdenes</TabsTrigger>
          </Guard.Permission>
        </TabsList>

        <TabsContent value='my-orders' className='space-y-6'>
          <OrdersContent
            activeQuery={activeQuery}
            handlePageChange={handlePageChange}
            handlePageSizeChange={handlePageSizeChange}
            handleRefresh={handleRefresh}
            handleSearchSubmit={handleSearchSubmit}
            orders={orders}
            pageInfo={pageInfo}
            pageInUrl={pageInUrl}
            searchInUrl={searchInUrl}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            table={table}
          />
        </TabsContent>

        <Guard.Permission permission={PERMISSIONS.VIEW_ALL_ORDERS}>
          <TabsContent value='all-orders' className='space-y-6'>
            <OrdersContent
              activeQuery={activeQuery}
              handlePageChange={handlePageChange}
              handlePageSizeChange={handlePageSizeChange}
              handleRefresh={handleRefresh}
              handleSearchSubmit={handleSearchSubmit}
              orders={orders}
              pageInfo={pageInfo}
              pageInUrl={pageInUrl}
              searchInUrl={searchInUrl}
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              table={table}
            />
          </TabsContent>
        </Guard.Permission>
      </Tabs>
    </div>
  )
}
