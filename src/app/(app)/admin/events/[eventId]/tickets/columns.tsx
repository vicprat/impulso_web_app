'use client'

import { ArrowUpDown, Eye, Ticket } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

import type { ColumnDef } from '@tanstack/react-table'
import type { JSX } from 'react'

const formatPrice = (amount: string, currency: string) => {
  const numericAmount = parseFloat(amount)
  return `$${numericAmount.toLocaleString('es-MX')} ${currency}`
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

interface TableMeta {
  currentSortBy: string
  currentSortOrder: 'asc' | 'desc'
  handleSorting: (columnId: string) => void
}

export const columns: ColumnDef<any, TableMeta>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    header: ({ column, table }) => (
      <Button
        variant='ghost'
        onClick={() => table.options.meta?.handleSorting?.('name')}
        className='h-auto p-0 font-semibold'
      >
        Orden
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'processedAt',
    cell: ({ row }) => formatDate(row.original.processedAt),
    header: ({ column, table }) => (
      <Button
        variant='ghost'
        onClick={() => table.options.meta?.handleSorting?.('processedAt')}
        className='h-auto p-0 font-semibold'
      >
        Fecha
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'customerName',
    cell: ({ row }) => {
      const customerName = (row.original as any).customerName
      if (!customerName || customerName === 'Cliente no disponible') {
        return <span className='text-muted-foreground'>Cliente no disponible</span>
      }
      return <span className='font-medium'>{customerName}</span>
    },
    header: ({ column, table }) => (
      <Button
        variant='ghost'
        onClick={() => table.options.meta?.handleSorting?.('customer')}
        className='h-auto p-0 font-semibold'
      >
        Cliente
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'lineItemsCount',
    cell: ({ row }) => {
      const count = row.original.lineItemsCount
      return (
        <div className='flex items-center gap-2'>
          <Ticket className='size-4 text-primary' />
          <span className='font-medium'>{count}</span>
        </div>
      )
    },
    header: ({ column, table }) => (
      <Button
        variant='ghost'
        onClick={() => table.options.meta?.handleSorting?.('lineItemsCount')}
        className='h-auto p-0 font-semibold'
      >
        Boletos
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'displayFinancialStatus',
    cell: ({ row }) => {
      const status = row.original.displayFinancialStatus
      if (!status) return <Badge variant='secondary'>No disponible</Badge>

      const statusMap: Record<string, JSX.Element> = {
        PAID: <Badge className='bg-success-container text-on-success-container'>Pagado</Badge>,
        PENDING: (
          <Badge className='bg-warning-container text-on-warning-container'>Pendiente</Badge>
        ),
        REFUNDED: <Badge variant='outline'>Reembolsado</Badge>,
      }
      return (
        statusMap[status as keyof typeof statusMap] ?? <Badge variant='secondary'>{status}</Badge>
      )
    },
    header: ({ column, table }) => (
      <Button
        variant='ghost'
        onClick={() => table.options.meta?.handleSorting?.('displayFinancialStatus')}
        className='h-auto p-0 font-semibold'
      >
        Estado de Pago
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'totalPrice',
    cell: ({ row }) => {
      const { amount, currencyCode } = row.original.totalPrice
      return <div className='text-right font-medium'>{formatPrice(amount, currencyCode)}</div>
    },
    header: ({ column, table }) => (
      <Button
        variant='ghost'
        onClick={() => table.options.meta?.handleSorting?.('totalPrice')}
        className='h-auto w-full justify-end p-0 text-right font-semibold'
      >
        Total
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    cell: ({ row }) => {
      const order = row.original
      const orderId = order.id.split('/').pop()

      return (
        <Link href={replaceRouteParams(ROUTES.ORDERS.DETAIL.PATH, { orderId: orderId ?? '' })}>
          <Button variant='ghost' size='sm'>
            <Eye className='size-4' />
          </Button>
        </Link>
      )
    },
    id: 'actions',
  },
]
