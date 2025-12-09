'use client'

import { useQueryClient } from '@tanstack/react-query'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ArrowLeft, PlusCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDiscounts } from '@/services/product/queries'
import { Table } from '@/src/components/Table'
import { ROUTES } from '@/src/config/routes'

import { columns } from './columns'

interface Coupon {
  isActive: boolean
  startsAt: string
  endsAt?: string | null
}

export function Client() {
  const queryClient = useQueryClient()
  const { data: coupons = [], error, isFetching, isLoading } = useGetDiscounts()

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['discounts'] })
  }

  const now = new Date()
  const activeCoupons = coupons.filter((coupon: Coupon) => {
    if (!coupon.isActive) return false
    const startsAt = new Date(coupon.startsAt)
    const endsAt = coupon.endsAt ? new Date(coupon.endsAt) : null
    return now >= startsAt && (!endsAt || now <= endsAt)
  })

  const table = useReactTable({
    columns,
    data: coupons,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      onRefresh: handleRefresh,
    },
  })

  if (isLoading) {
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
            <h3 className='text-lg font-semibold text-red-600'>Error al cargar cupones</h3>
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
        <div>
          <div className='mb-2 flex items-center space-x-2'>
            <Link href={ROUTES.INVENTORY.MAIN.PATH}>
              <Button variant='ghost' size='sm'>
                <ArrowLeft className='mr-2 size-4' />
                Volver al Inventario
              </Button>
            </Link>
          </div>
          <h1 className='text-2xl font-bold'>Gestión de Cupones</h1>
          <p className='text-muted-foreground'>Administra tus cupones y descuentos</p>
        </div>
        <div className='flex items-center space-x-2'>
          <Button variant='outline' onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 size-4 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Link href={ROUTES.INVENTORY.COUPONS.CREATE.PATH}>
            <Button>
              <PlusCircle className='mr-2 size-4' />
              Nuevo Cupón
            </Button>
          </Link>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Total</p>
            <Badge variant='outline'>{coupons.length}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Activos</p>
            <Badge variant='default'>{activeCoupons.length}</Badge>
          </div>
        </div>
        <div className='rounded-lg border p-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium text-muted-foreground'>Inactivos</p>
            <Badge variant='secondary'>{coupons.length - activeCoupons.length}</Badge>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Table.Loader />
      ) : (
        <div className='w-full min-w-0 max-w-full overflow-x-auto pb-2'>
          <Table.Data
            table={table}
            className='min-w-[900px]'
            emptyMessage='No se encontraron cupones.'
          />
        </div>
      )}

      {coupons.length > 0 && (
        <div className='text-center text-sm text-muted-foreground'>
          Mostrando {coupons.length} cupones
        </div>
      )}
    </div>
  )
}
