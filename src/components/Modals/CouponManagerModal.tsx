'use client'

import { Tag } from 'lucide-react'

import { CouponList } from '@/components/Forms/CouponList'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  onCouponDeleted,
  onCouponUpdated,
}: CouponManagerModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="size-6 text-blue-500" />
            Gestión de Cupones de Descuento
          </DialogTitle>

        </DialogHeader>


        <div className="space-y-4">
          <CouponList
            coupons={coupons}
            isLoading={isLoading}
            onCouponUpdated={onCouponUpdated}
            onCouponDeleted={onCouponDeleted}
          />
        </div>


      </DialogContent>
    </Dialog>
  )
}
