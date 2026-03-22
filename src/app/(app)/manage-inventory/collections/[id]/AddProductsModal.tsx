'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'

import { ProductSelectionModal } from '@/components/Modals/ProductSelectionModal'
import { useAddProductsToCollection } from '@/services/collection/hooks'

interface AddProductsModalProps {
  isOpen: boolean
  onClose: () => void
  collectionId: string
  collectionTitle: string
  existingProductIds: Set<string>
  onSuccess: () => void
  isSmartCollection?: boolean
}

export function AddProductsModal({
  collectionId,
  collectionTitle,
  isOpen,
  isSmartCollection = false,
  onClose,
  onSuccess,
}: AddProductsModalProps) {
  const addProductsMutation = useAddProductsToCollection({
    onError: (error: Error & { details?: { message?: string }[] }) => {
      if (
        error?.details?.some((detail) =>
          detail.message?.includes("Can't manually add products to a smart collection")
        )
      ) {
        toast.error(
          'Esta es una colección inteligente. Los productos se agregan automáticamente según las reglas definidas.'
        )
      } else {
        toast.error(`Error al agregar productos: ${error.message}`)
      }
    },
    onSuccess: () => {
      toast.success('Productos agregados a la colección exitosamente')
      onSuccess()
      onClose()
    },
  })

  const handleProductsSelected = useCallback(
    (productIds: string[]) => {
      addProductsMutation.mutate({
        collectionId: collectionId.split('/').pop() ?? '',
        productIds,
      })
    },
    [addProductsMutation, collectionId]
  )

  if (isSmartCollection) {
    return null
  }

  return (
    <ProductSelectionModal
      confirmButtonText='Agregar a Colección'
      description={`Selecciona productos para agregar a "${collectionTitle}"`}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleProductsSelected}
      title='Agregar Productos'
    />
  )
}
