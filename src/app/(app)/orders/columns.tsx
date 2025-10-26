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
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'name'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('name')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por número de orden'
        >
          Orden
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'name',
  },
  {
    accessorKey: 'processedAt',
    cell: ({ row }) => formatDate(row.original.processedAt),
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'processedAt'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('processedAt')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por fecha'
        >
          Fecha
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'processedAt',
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
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'customerName'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('customerName')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por nombre'
        >
          Nombre
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
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
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'customerEmail'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('customerEmail')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por email'
        >
          Email
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'customerEmail',
  },
  {
    accessorKey: 'displayFinancialStatus',
    cell: ({ row }) => {
      const status = row.original.displayFinancialStatus
      if (!status) return <Badge variant='secondary'>No disponible</Badge>

      const statusMap: Record<string, JSX.Element> = {
        PAID: (
          <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
            Pagado
          </Badge>
        ),
        PENDING: (
          <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
            Pendiente
          </Badge>
        ),
        REFUNDED: (
          <Badge className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>
            Reembolsado
          </Badge>
        ),
      }
      return (
        statusMap[status as keyof typeof statusMap] ?? <Badge variant='secondary'>{status}</Badge>
      )
    },
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'displayFinancialStatus'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('displayFinancialStatus')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por estado de pago'
        >
          Estado de Pago
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'displayFinancialStatus',
  },
  {
    accessorKey: 'shippingLine',
    cell: ({ row }) => {
      const { requiresShipping, shippingLine } = row.original

      // Digital orders (tickets/events)
      if (requiresShipping === false) {
        return <Badge variant='outline'>Digital - Eventos/Tickets</Badge>
      }

      // Determine shipping method based on title
      if (shippingLine?.title) {
        const title = shippingLine.title.toLowerCase()

        if (title.includes('local')) {
          return (
            <Badge className='bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200'>
              Envío Local
            </Badge>
          )
        } else if (
          title.includes('estándar') ||
          title.includes('standard') ||
          title.includes('paqueteria')
        ) {
          return (
            <Badge className='bg-primary-container text-on-primary-container'>Envío Estándar</Badge>
          )
        } else {
          return <span className='text-sm'>{shippingLine.title}</span>
        }
      }

      return <span className='text-muted-foreground'>-</span>
    },
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'shippingMethod'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('shippingMethod')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por método de envío'
        >
          Método de Envío
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'shippingMethod',
  },
  {
    accessorKey: 'fulfillmentStatus',
    cell: ({ row }) => {
      const { requiresShipping } = row.original
      const fulfillmentStatus =
        row.original.fulfillmentStatus ?? row.original.displayFulfillmentStatus

      // Digital orders don't need shipping
      if (requiresShipping === false) {
        return (
          <Badge className='bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'>
            Entrega Digital
          </Badge>
        )
      }

      if (!fulfillmentStatus) return <Badge variant='secondary'>No disponible</Badge>

      const statusMap: Record<string, JSX.Element> = {
        FULFILLED: (
          <Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
            Enviado
          </Badge>
        ),
        PARTIALLY_FULFILLED: (
          <Badge className='bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'>
            Parcialmente Enviado
          </Badge>
        ),
        UNFULFILLED: (
          <Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
            Pendiente de Envío
          </Badge>
        ),
      }

      return statusMap[fulfillmentStatus] ?? <Badge variant='secondary'>{fulfillmentStatus}</Badge>
    },
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'fulfillmentStatus'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('fulfillmentStatus')}
          className='h-auto p-0 font-semibold'
          title='Ordenar por estado de envío'
        >
          Estado de Envío
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'fulfillmentStatus',
  },
  {
    accessorKey: 'totalPrice',
    cell: ({ row }) => {
      const { amount, currencyCode } = row.original.totalPrice
      return <div className='text-right font-medium'>{formatPrice(amount, currencyCode)}</div>
    },
    header: ({ table }) => {
      const { currentSortBy, handleSorting } = table.options.meta ?? {}
      const isSorted = currentSortBy === 'totalPrice'

      return (
        <Button
          variant='ghost'
          onClick={() => handleSorting?.('totalPrice')}
          className='h-auto w-full justify-end p-0 text-right font-semibold'
          title='Ordenar por total'
        >
          Total
          <ArrowUpDown className={`ml-2 size-4 ${isSorted ? 'text-primary' : ''}`} />
        </Button>
      )
    },
    id: 'totalPrice',
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
