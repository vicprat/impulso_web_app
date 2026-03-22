'use client'

import { ProductSelectionModal } from '@/components/Modals/ProductSelectionModal'

export function ProductSelectorModal({
  confirmButtonText = 'Confirmar Selección',
  description = 'Busca y selecciona productos de tu inventario',
  initialSelectedIds = [],
  isOpen,
  onClose,
  onConfirm,
  title = 'Seleccionar Productos',
}: {
  isOpen: boolean
  onClose: () => void
  initialSelectedIds?: string[]
  onConfirm: (selectedItemIds: string[]) => void
  title?: string
  description?: string
  confirmButtonText?: string
}) {
  return (
    <ProductSelectionModal
      confirmButtonText={confirmButtonText}
      description={description}
      initialSelectedIds={initialSelectedIds}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
    />
  )
}
