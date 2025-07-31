

import { routeMetadata } from '@/lib/metadata'
import { StorePageContent } from '@/src/components/StorePageContent'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata[ '/store' ]

// Hacer la página dinámica para que se actualice cuando cambien los productos
export const dynamic = 'force-dynamic'

export default function Page() {
  return <StorePageContent />
}
