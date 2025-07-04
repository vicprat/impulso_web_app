'use client'

import { ArrowUpDown, Eye } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import type { Order } from '@/src/modules/customer/types'
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

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: 'name',
    cell: ({ row }) => <span className='font-medium'>{row.original.name}</span>,
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='h-auto p-0 font-semibold'
      >
        Fecha
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'customer',
    cell: ({ row }) => {
      const { customer } = row.original
      if (!customer || (!customer.firstName && !customer.lastName)) {
        return <span className='text-muted-foreground'>N/A</span>
      }
      return `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
    },
    header: 'Cliente',
    id: 'customer',
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
    header: 'Estado de Pago',
  },
  {
    accessorKey: 'displayFulfillmentStatus',
    cell: ({ row }) => {
      const status = row.original.displayFulfillmentStatus ?? row.original.fulfillmentStatus
      if (!status) return <Badge variant='secondary'>No disponible</Badge>

      const statusMap: Record<string, JSX.Element> = {
        FULFILLED: (
          <Badge className='bg-primary-container text-on-primary-container'>Enviado</Badge>
        ),
        PARTIALLY_FULFILLED: <Badge variant='outline'>Parcialmente Enviado</Badge>,
        UNFULFILLED: <Badge variant='secondary'>No Enviado</Badge>,
      }
      return (
        statusMap[status as keyof typeof statusMap] ?? <Badge variant='secondary'>{status}</Badge>
      )
    },
    header: 'Estado de Envío',
  },
  {
    accessorKey: 'totalPrice',
    cell: ({ row }) => {
      const { amount, currencyCode } = row.original.totalPrice
      return <div className='text-right font-medium'>{formatPrice(amount, currencyCode)}</div>
    },
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
        <Link href={`/orders/${orderId}`}>
          <Eye className='mr-2 size-4' />
        </Link>
      )
    },
    id: 'actions',
  },
]
