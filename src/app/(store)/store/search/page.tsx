import type { Metadata } from 'next'

import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/store/search']

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Buscar</h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Encuentra las obras de arte perfectas para tu colección.
      </p>
    </div>
  )
}
