'use client'

import { Plus, Tag } from 'lucide-react'
import { useState } from 'react'

import { CouponCreator } from '@/components/Forms/CouponCreator'
import { CouponList } from '@/components/Forms/CouponList'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { type CreateDiscountInput, type Discount, type UpdateDiscountInput } from '@/services/product/types'

interface CouponManagerModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProducts: { id: string; title: string }[]
  coupons: Discount[]
  isLoading?: boolean
  onCouponCreated: (coupon: CreateDiscountInput) => void
  onCouponUpdated: (coupon: UpdateDiscountInput) => void
  onCouponDeleted: (couponId: string) => void
}

export function CouponManagerModal({
  coupons,
  isLoading = false,
  isOpen,
  onClose,
  onCouponCreated,
  onCouponDeleted,
  onCouponUpdated,
  selectedProducts,
}: CouponManagerModalProps) {
  const [ activeTab, setActiveTab ] = useState('list')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="size-6 text-blue-500" />
            Gestión de Cupones de Descuento
          </DialogTitle>

        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Tag className="size-4" />
              Cupones Existentes ({coupons.length})
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="size-4" />
              Crear Nuevo Cupón
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cupones de Descuento</h3>
                <Button
                  onClick={() => setActiveTab('create')}
                  className="flex items-center gap-2"
                >
                  <Plus className="size-4" />
                  Crear Cupón
                </Button>
              </div>
              <CouponList
                coupons={coupons}
                isLoading={isLoading}
                onCouponUpdated={onCouponUpdated}
                onCouponDeleted={onCouponDeleted}
              />
            </div>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Crear Nuevo Cupón</h3>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('list')}
                >
                  Ver Cupones Existentes
                </Button>
              </div>
              <CouponCreator
                selectedProducts={selectedProducts}
                onCouponCreated={(coupon) => {
                  onCouponCreated(coupon)
                  setActiveTab('list')
                }}
                onClose={() => setActiveTab('list')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
