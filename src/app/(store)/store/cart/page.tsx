import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'


export const metadata: Metadata = routeMetadata['/store/cart']

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Carrito de Compras</h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Tu carrito está vacío. Explora nuestra galería para encontrar obras únicas.
      </p>
    </div>
  )
}
