import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'


export const metadata: Metadata = routeMetadata['/store/search']

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Buscar</h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Encuentra las obras de arte perfectas para tu colección.
      </p>
    </div>
  )
}
