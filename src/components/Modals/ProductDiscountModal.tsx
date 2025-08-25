'use client'


import { ProductDiscount } from '@/components/Forms/ProductDiscount'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { type CreateProductDiscountInput, type ProductDiscount as ProductDiscountType } from '@/services/product/types'

interface ProductDiscountModalProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productTitle: string
  currentPrice: string
  existingDiscount?: ProductDiscountType | null
  onDiscountChange: (discount: CreateProductDiscountInput | null) => void
}

export function ProductDiscountModal({
  currentPrice,
  existingDiscount,
  isOpen,
  onClose,
  onDiscountChange,
  productId,
  productTitle,
}: ProductDiscountModalProps) {
  const handleDiscountChange = (discount: CreateProductDiscountInput | null) => {
    onDiscountChange(discount)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Editar Descuento - {productTitle}</span>
          </DialogTitle>
        </DialogHeader>
        <ProductDiscount
          productId={productId}
          productTitle={productTitle}
          currentPrice={currentPrice}
          onDiscountChange={handleDiscountChange}
          existingDiscount={existingDiscount}
        />
      </DialogContent>
    </Dialog>
  )
}
