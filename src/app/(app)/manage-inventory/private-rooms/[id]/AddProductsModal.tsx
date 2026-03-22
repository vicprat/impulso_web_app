'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import { ProductSelectionModal } from '@/components/Modals/ProductSelectionModal'
import type { Product } from '@/models/Product'

interface AddProductsModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  roomTitle: string
  existingProductIds: Set<string>
  onSuccess: () => void
  onProductsSelected?: (productIds: string[], selectedProducts?: Product[]) => void
}

export function AddProductsModal({
  existingProductIds,
  isOpen,
  onClose,
  onProductsSelected,
  onSuccess,
  roomId,
  roomTitle,
}: AddProductsModalProps) {
  const handleProductsSelected = useCallback(
    async (productIds: string[], selectedProducts?: Product[]) => {
      if (onProductsSelected) {
        onProductsSelected(productIds, selectedProducts)
        onSuccess()
        return
      }

      if (!roomId) {
        toast.error('ID de sala no válido')
        return
      }

      try {
        const response = await fetch(`/api/private-rooms/${roomId}`, {
          body: JSON.stringify({
            productIds: Array.from(new Set([...existingProductIds, ...productIds])),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'PUT',
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error ?? 'Error al agregar productos')
        }

        toast.success(
          `${productIds.length} producto${productIds.length > 1 ? 's' : ''} agregado${productIds.length > 1 ? 's' : ''} a la sala exitosamente`
        )
        onSuccess()
        onClose()
      } catch (error) {
        console.error('Error adding products:', error)
        toast.error(
          `Error al agregar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`
        )
      }
    },
    [roomId, existingProductIds, onProductsSelected, onSuccess, onClose]
  )

  return (
    <ProductSelectionModal
      confirmButtonText='Agregar a Sala'
      description={`Selecciona productos para agregar a "${roomTitle}"`}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleProductsSelected}
      returnFullProducts={!!onProductsSelected}
      title='Agregar Productos'
    />
  )
}
