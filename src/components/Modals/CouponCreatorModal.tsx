'use client'


import { CouponCreator } from '@/components/Forms/CouponCreator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type CreateDiscountInput } from '@/services/product/types'

interface CouponCreatorModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProducts: { id: string; title: string }[]
  onCouponCreated: (coupon: CreateDiscountInput) => void
}

export function CouponCreatorModal({
  isOpen,
  onClose,
  onCouponCreated,
  selectedProducts,
}: CouponCreatorModalProps) {
  const handleCouponCreated = (coupon: CreateDiscountInput) => {
    onCouponCreated(coupon)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Crear Cupón de Descuento</span>

          </DialogTitle>
        </DialogHeader>
        <CouponCreator
          selectedProducts={selectedProducts}
          onCouponCreated={handleCouponCreated}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
