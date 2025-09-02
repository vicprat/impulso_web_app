'use client'

import { CheckCircle, Edit, Tag, Trash2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { CouponCreatorModal } from '@/components/Modals/CouponCreatorModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type Discount, type UpdateDiscountInput } from '@/services/product/types'

interface CouponListProps {
  coupons: Discount[]
  isLoading?: boolean
  onCouponUpdated: (coupon: UpdateDiscountInput) => void
  onCouponDeleted: (couponId: string) => void
}

export function CouponList({ coupons, isLoading = false, onCouponDeleted, onCouponUpdated }: CouponListProps) {
  const [ editingCoupon, setEditingCoupon ] = useState<Discount | null>(null)
  const [ isEditModalOpen, setIsEditModalOpen ] = useState(false)
  const [ isDeleteModalOpen, setIsDeleteModalOpen ] = useState(false)
  const [ couponToDelete, setCouponToDelete ] = useState<Discount | null>(null)

  const handleEditCoupon = (coupon: Discount) => {
    setEditingCoupon(coupon)
    setIsEditModalOpen(true)
  }

  const handleDeleteCoupon = (coupon: Discount) => {
    setCouponToDelete(coupon)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (couponToDelete) {
      onCouponDeleted(couponToDelete.id)
      setIsDeleteModalOpen(false)
      setCouponToDelete(null)
      toast.success('Cupón eliminado exitosamente')
    }
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
      return <Badge variant="secondary">Inactivo</Badge>
    }

    if (now < startsAt) {
      return <Badge variant="outline">Pendiente</Badge>
    }

    if (endsAt && now > endsAt) {
      return <Badge variant="destructive">Expirado</Badge>
    }

    return <Badge variant="default">Activo</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 size-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <h3 className="mb-2 text-lg font-semibold">Cargando cupones...</h3>
          <p className="text-center text-muted-foreground">
            Obteniendo información de cupones de descuento.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (coupons.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Tag className="mb-4 size-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No hay cupones creados</h3>
          <p className="text-center text-muted-foreground">
            Los cupones que crees aparecerán aquí para que puedas gestionarlos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="size-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{coupon.code}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {getAppliesToLabel(coupon)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(coupon)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCoupon(coupon)}
                  >
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCoupon(coupon)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Descuento:</span>
                <Badge variant="destructive" className="text-sm">
                  {getDiscountLabel(coupon)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Aplicable a:</span>
                <span className="text-sm text-muted-foreground">
                  {getAppliesToLabel(coupon)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inicio:</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(coupon.startsAt)}
                </span>
              </div>

              {coupon.endsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fin:</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(coupon.endsAt)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estado:</span>
                <div className="flex items-center gap-1">
                  {coupon.isActive ? (
                    <CheckCircle className="size-4 text-green-500" />
                  ) : (
                    <XCircle className="size-4 text-red-500" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {coupon.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edición Unificado */}
      <CouponCreatorModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCoupon(null)
        }}
        selectedProducts={editingCoupon?.productIds?.map(id => ({
          id,
          title: `Producto ${id.split('/').pop()}` // Título temporal basado en el ID
        })) ?? []}
        mode="edit"
        couponToEdit={editingCoupon ?? undefined}
        onCouponUpdated={(updatedCoupon) => {
          onCouponUpdated(updatedCoupon)
          setIsEditModalOpen(false)
          setEditingCoupon(null)
        }}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              ¿Estás seguro de que quieres eliminar el cupón{' '}
              <strong>{couponToDelete?.code}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="flex-1"
              >
                Eliminar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


