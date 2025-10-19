'use client'

import { ArrowUpDown, Eye } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { replaceRouteParams, ROUTES } from '@/src/config/routes'

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
    accessorKey: 'customer.name',
    cell: ({ row }) => {
      const { customer } = row.original
      if (!customer) {
        return <span className='text-muted-foreground'>-</span>
      }
      const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim()
      return fullName || <span className='text-muted-foreground'>-</span>
    },
    header: 'Nombre',
    id: 'customerName',
  },
  {
    accessorKey: 'customer.email',
    cell: ({ row }) => {
      const { customer } = row.original
      if (!customer?.email) {
        return <span className='text-muted-foreground'>-</span>
      }
      return <span className='text-sm'>{customer.email}</span>
    },
    header: 'Email',
    id: 'customerEmail',
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
      const { requiresShipping } = row.original
      const status = row.original.displayFulfillmentStatus ?? row.original.fulfillmentStatus

      if (requiresShipping === false) {
        return (
          <Badge className='bg-success-container text-on-success-container'>Entrega Digital</Badge>
        )
      }

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
    accessorKey: 'shippingLine',
    cell: ({ row }) => {
      const { requiresShipping, shippingLine } = row.original

      if (requiresShipping === false) {
        return <Badge variant='outline'>No requiere envío</Badge>
      }

      if (!shippingLine?.title) {
        return <span className='text-muted-foreground'>-</span>
      }

      return <span className='text-sm'>{shippingLine.title}</span>
    },
    header: 'Método de Envío',
    id: 'shippingMethod',
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
        <Link href={replaceRouteParams(ROUTES.ORDERS.DETAIL.PATH, { orderId: orderId ?? '' })}>
          <Eye className='mr-2 size-4' />
        </Link>
      )
    },
    id: 'actions',
  },
]
