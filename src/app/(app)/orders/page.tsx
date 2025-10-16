'use client'

import { getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table'
import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Guard } from '@/components/Guards'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/hooks/use-debounce'
import { Table } from '@/src/components/Table'
import { PERMISSIONS } from '@/src/config/Permissions'
import { useAllOrdersLocal, useCustomerOrders } from '@/src/modules/customer/hooks'

import { columns } from './columns'

import type { Order } from '@/src/modules/customer/types'

type OrdersTab = 'my-orders' | 'all-orders'

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrdersTab>('my-orders')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [cursors, setCursors] = useState<Record<number, string | undefined>>({ 1: undefined })

  const debouncedSearch = useDebounce(searchTerm, 500)

  const allOrdersQuery = useAllOrdersLocal({
    after: cursors[currentPage],
    first: pageSize,
    query: debouncedSearch,
  })

  const customerOrdersQuery = useCustomerOrders({
    after: cursors[currentPage],
    first: pageSize,
  })

  const activeQuery = activeTab === 'all-orders' ? allOrdersQuery : customerOrdersQuery

  const orders: Order[] = (() => {
    if (activeTab === 'all-orders') {
      return (
        allOrdersQuery.data?.orders.edges.map((edge) => ({
          customer: edge.node.customer,
          displayFinancialStatus: edge.node.displayFinancialStatus,
          displayFulfillmentStatus: edge.node.displayFulfillmentStatus,
          id: edge.node.id,
          lineItemsCount: edge.node.lineItemsCount,
          name: edge.node.name,
          processedAt: edge.node.processedAt,
          totalPrice: {
            amount: edge.node.totalPrice.amount,
            currencyCode: edge.node.totalPrice.currencyCode,
          },
        })) ?? []
      )
    } else {
      const customerOrders =
        customerOrdersQuery.data?.customer?.orders?.edges.map((edge) => ({
          fulfillmentStatus: edge.node.fulfillmentStatus,
          id: edge.node.id,
          lineItemsCount: edge.node.lineItems.edges.length,
          name: edge.node.name,
          processedAt: edge.node.processedAt,
          totalPrice: {
            amount: edge.node.totalPrice.amount,
            currencyCode: edge.node.totalPrice.currencyCode,
          },
        })) ?? []

      return customerOrders.filter((order) =>
        order.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    }
  })()

  const pageInfo =
    activeTab === 'all-orders'
      ? allOrdersQuery.data?.orders.pageInfo
      : customerOrdersQuery.data?.customer?.orders?.pageInfo

  const tableColumns =
    activeTab === 'all-orders'
      ? columns
      : columns.filter((col) => col.id !== 'customerName' && col.id !== 'customerEmail')

  useEffect(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      setCursors((prev) => ({ ...prev, [currentPage + 1]: pageInfo.endCursor! }))
    }
  }, [pageInfo, currentPage])

  useEffect(() => {
    setCurrentPage(1)
    setCursors({ 1: undefined })
  }, [debouncedSearch, pageSize])

  useEffect(() => {
    setCurrentPage(1)
    setCursors({ 1: undefined })
    setSearchTerm('')
  }, [activeTab])

  const handleRefresh = useCallback(() => {
    void activeQuery.refetch()
    toast.info('Actualizando datos...')
  }, [activeQuery])

  const table = useReactTable({
    columns: tableColumns,
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    state: {
      pagination: {
        pageIndex: currentPage - 1,
        pageSize,
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

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OrdersTab)}>
        <TabsList>
          <TabsTrigger value='my-orders'>Mis Órdenes</TabsTrigger>
          <Guard.Permission permission={PERMISSIONS.VIEW_ALL_ORDERS}>
            <TabsTrigger value='all-orders'>Todas las Órdenes</TabsTrigger>
          </Guard.Permission>
        </TabsList>

        <TabsContent value='my-orders' className='space-y-6'>
          <OrdersContent />
        </TabsContent>

        <Guard.Permission permission={PERMISSIONS.VIEW_ALL_ORDERS}>
          <TabsContent value='all-orders' className='space-y-6'>
            <OrdersContent />
          </TabsContent>
        </Guard.Permission>
      </Tabs>
    </div>
  )

  function OrdersContent() {
    return (
      <>
        <Table.Toolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder='Buscar por número de orden...'
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
              debouncedSearch
                ? `No se encontraron órdenes que coincidan con "${debouncedSearch}"`
                : 'No se encontraron órdenes.'
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

        {orders.length > 0 && (
          <div className='text-center text-sm text-muted-foreground'>
            Mostrando {orders.length} órdenes
          </div>
        )}
      </>
    )
  }
}
