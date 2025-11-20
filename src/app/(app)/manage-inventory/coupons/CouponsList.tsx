'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit, ExternalLink, PlusCircle, RefreshCw, Tag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { Confirm } from '@/components/Dialog/Confirm'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeleteDiscount, useGetDiscounts } from '@/services/product/queries'
import { type Discount } from '@/services/product/types'
import { ROUTES, replaceRouteParams } from '@/src/config/routes'

export function CouponsList() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [couponToDelete, setCouponToDelete] = useState<Discount | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()

  const { data: coupons = [], error, isLoading } = useGetDiscounts()

  const deleteDiscountMutation = useDeleteDiscount({
    onError: (error) => {
      toast.error(`Error al eliminar cupón: ${error.message}`)
      setCouponToDelete(null)
      setIsDeleteDialogOpen(false)
    },
    onSuccess: () => {
      toast.success('Cupón eliminado exitosamente')
      setCouponToDelete(null)
      setIsDeleteDialogOpen(false)
    },
  })

  const handleDeleteClick = (coupon: Discount) => {
    setCouponToDelete(coupon)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return
    await deleteDiscountMutation.mutateAsync(couponToDelete.id)
  }

  const handleLoadCoupons = () => {
    void queryClient.invalidateQueries({ queryKey: ['discounts'] })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getCouponId = (coupon: Discount) => {
    return coupon.id.split('/').pop() ?? coupon.id
  }

  return (
    <>
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
            <p className='text-muted-foreground'>
              {isLoading ? <Skeleton className='h-4 w-32' /> : `${coupons.length} cupones`}
            </p>
          </div>
          <div className='flex space-x-2'>
            <Button onClick={handleLoadCoupons} variant='outline' disabled={isLoading}>
              <RefreshCw className={`mr-2 size-4 ${isLoading ? 'animate-spin' : ''}`} />
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

        {isLoading ? (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className='h-6 w-32' />
                  <Skeleton className='h-4 w-24' />
                </CardHeader>
                <CardContent>
                  <Skeleton className='h-20 w-full' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className='py-8 text-center'>
              <p className='text-red-600'>Error al cargar los cupones</p>
              <Button onClick={handleLoadCoupons} variant='outline' className='mt-2'>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className='flex flex-col items-center justify-center py-12'>
              <Tag className='mb-4 size-12 text-muted-foreground' />
              <h3 className='mb-2 text-lg font-semibold'>No hay cupones creados</h3>
              <p className='mb-4 text-center text-muted-foreground'>
                Los cupones que crees aparecerán aquí para que puedas gestionarlos.
              </p>
              <Link href={ROUTES.INVENTORY.COUPONS.CREATE.PATH}>
                <Button>
                  <PlusCircle className='mr-2 size-4' />
                  Crear Primer Cupón
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {coupons.map((coupon: Discount) => {
              const couponId = getCouponId(coupon)
              return (
                <Card key={coupon.id} className='cursor-pointer transition-shadow hover:shadow-md'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <Link
                        href={replaceRouteParams(ROUTES.INVENTORY.COUPONS.DETAIL.PATH, {
                          id: couponId,
                        })}
                        className='flex-1'
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className='flex items-center gap-2'>
                          <Tag className='size-5 text-blue-500' />
                          <div>
                            <CardTitle className='text-lg transition-colors group-hover:text-primary'>
                              {coupon.code}
                              <ExternalLink className='ml-1 inline size-4 opacity-0 transition-opacity group-hover:opacity-100' />
                            </CardTitle>
                            <p className='text-sm text-muted-foreground'>
                              {getAppliesToLabel(coupon)}
                            </p>
                          </div>
                        </div>
                      </Link>
                      <div className='flex items-center gap-2'>
                        {getStatusBadge(coupon)}
                        <Button
                          variant='ghost'
                          size='sm'
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={replaceRouteParams(ROUTES.INVENTORY.COUPONS.DETAIL.PATH, {
                              id: couponId,
                            })}
                          >
                            <Edit className='size-4' />
                          </Link>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteClick(coupon)
                          }}
                          className='text-destructive hover:text-destructive'
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <Link
                    href={replaceRouteParams(ROUTES.INVENTORY.COUPONS.DETAIL.PATH, {
                      id: couponId,
                    })}
                  >
                    <CardContent className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Descuento:</span>
                        <Badge variant='destructive' className='text-sm'>
                          {getDiscountLabel(coupon)}
                        </Badge>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Aplicable a:</span>
                        <span className='text-sm text-muted-foreground'>
                          {getAppliesToLabel(coupon)}
                        </span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>Inicio:</span>
                        <span className='text-sm text-muted-foreground'>
                          {formatDate(coupon.startsAt)}
                        </span>
                      </div>

                      {coupon.endsAt && (
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>Fin:</span>
                          <span className='text-sm text-muted-foreground'>
                            {formatDate(coupon.endsAt)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Confirm
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setCouponToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
        title='Confirmar Eliminación'
        message={`¿Estás seguro de que quieres eliminar el cupón ${couponToDelete?.code}? Esta acción no se puede deshacer.`}
        confirmButtonText='Eliminar'
        variant='destructive'
      />
    </>
  )
}
