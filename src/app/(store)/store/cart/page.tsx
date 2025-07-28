import type { Metadata } from 'next'

import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/store/cart']

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Carrito de Compras</h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Tu carrito está vacío. Explora nuestra galería para encontrar obras únicas.
      </p>
    </div>
  )
}
