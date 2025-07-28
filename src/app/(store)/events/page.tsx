import type { Metadata } from 'next'

import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/events']

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Eventos</h1>
      <p className="text-center text-gray-600 dark:text-gray-400">
        Próximamente: Descubre nuestros eventos y exposiciones exclusivas.
      </p>
    </div>
  )
}
