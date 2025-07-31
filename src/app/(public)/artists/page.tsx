
import { ArtistsPageContent } from '@/components/ArtistsPageContent'
import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata[ '/artists' ]

// Hacer la página dinámica para que se actualice cuando cambien los artistas
export const dynamic = 'force-dynamic'

export default function Page() {
  return <ArtistsPageContent />
}