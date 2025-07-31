
import { HomePageContent } from '@/components/HomePageContent'
import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata[ '/' ]

// Hacer la página dinámica para que se actualice cuando cambien los productos
export const dynamic = 'force-dynamic'

export default function Page() {
  return <HomePageContent />
}
