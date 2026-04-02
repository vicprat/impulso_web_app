'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDeleteDiscount } from '@/services/product/queries'
import { type Discount } from '@/services/product/types'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onRefresh?: () => void
  }
}

const ActionsCell = ({ coupon, onRefresh }: { coupon: Discount; onRefresh?: () => void }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteDiscountMutation = useDeleteDiscount({
    onError: (error) => {
      toast.error(`Error al eliminar cupón: ${error.message}`)
      setIsDeleteDialogOpen(false)
    },
    onSuccess: () => {
      toast.success('Cupón eliminado exitosamente')
      setIsDeleteDialogOpen(false)
      onRefresh?.()
    },
  })

  const handleDeleteConfirm = async () => {
    await deleteDiscountMutation.mutateAsync(coupon.id)
  }

  const couponId = coupon.id.split('/').pop() ?? coupon.id

  return (
    <>
      <div className='flex items-center space-x-2'>
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.COUPONS.DETAIL.PATH, {
            id: couponId,
          })}
        >
          <Button variant='ghost' size='sm'>
            <Edit className='size-4' />
          </Button>
        </Link>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => setIsDeleteDialogOpen(true)}
          className='text-destructive hover:text-destructive'
        >
          <Trash2 className='size-4' />
        </Button>
      </div>

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title='Confirmar Eliminación'
        message={`¿Estás seguro de que quieres eliminar el cupón ${coupon.code}? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        variant='destructive'
        isLoading={deleteDiscountMutation.isPending}
      />
    </>
  )
}

const getStatusBadge = (coupon: Discount) => {
  const now = new Date()
  const startsAt = new Date(coupon.startsAt)
  const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null

  if (!coupon.isActive) {
    return <Badge variant='secondary'>Inactivo</Badge>
  }

  if (now < startsAt) {
    return <Badge variant='outline'>Pendiente</Badge>
  }

  if (endsAt && now > endsAt) {
    return <Badge variant='destructive'>Expirado</Badge>
  }

  return <Badge variant='default'>Activo</Badge>
}

const getDiscountLabel = (coupon: Discount) => {
  if (coupon.type === 'PERCENTAGE') {
    return `${coupon.value}% OFF`
  } else {
    return `$${coupon.value.toFixed(2)} OFF`
  }
}

const getAppliesToLabel = (coupon: Discount) => {
  switch (coupon.appliesTo) {
    case 'ALL_PRODUCTS':
      return 'Todos los productos'
    case 'SPECIFIC_PRODUCTS':
      return `${coupon.productIds?.length ?? 0} productos específicos`
    case 'COLLECTIONS':
      return `${coupon.collectionIds?.length ?? 0} colecciones`
    default:
      return 'Desconocido'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: 'code',
    cell: ({ row }) => {
      const coupon = row.original
      const couponId = coupon.id.split('/').pop() ?? coupon.id
      return (
        <Link
          href={replaceRouteParams(ROUTES.INVENTORY.COUPONS.DETAIL.PATH, {
            id: couponId,
          })}
          className='font-medium hover:underline'
        >
          {coupon.code}
        </Link>
      )
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Código
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'title',
    cell: ({ row }) => {
      const title = row.original.title
      return <span className='text-sm'>{title || '-'}</span>
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Título
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'discount',
    accessorFn: (row) => row.value,
    cell: ({ row }) => {
      return (
        <Badge variant='destructive' className='text-sm'>
          {getDiscountLabel(row.original)}
        </Badge>
      )
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Descuento
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'appliesTo',
    accessorFn: (row) => getAppliesToLabel(row),
    cell: ({ row }) => {
      return (
        <span className='text-sm text-muted-foreground'>{getAppliesToLabel(row.original)}</span>
      )
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Aplicable a
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'startsAt',
    cell: ({ row }) => {
      return <span className='text-sm'>{formatDate(row.original.startsAt)}</span>
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Inicio
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'endsAt',
    cell: ({ row }) => {
      const endsAt = row.original.endsAt
      return <span className='text-sm'>{endsAt ? formatDate(endsAt) : 'Sin fecha'}</span>
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Fin
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    accessorKey: 'status',
    accessorFn: (row) => {
      const now = new Date()
      const startsAt = new Date(row.startsAt)
      const endsAt = row.endsAt ? new Date(row.endsAt) : null

      if (!row.isActive) return 0
      if (endsAt && now > endsAt) return 1
      if (now < startsAt) return 2
      return 3
    },
    cell: ({ row }) => {
      return getStatusBadge(row.original)
    },
    header: ({ column }) => (
      <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Estado
        <ArrowUpDown className='ml-2 size-4' />
      </Button>
    ),
  },
  {
    cell: ({ row, table }) => {
      const coupon = row.original
      const { onRefresh } = table.options.meta ?? {}
      return <ActionsCell coupon={coupon} onRefresh={onRefresh} />
    },
    header: 'Acciones',
    id: 'actions',
  },
]
