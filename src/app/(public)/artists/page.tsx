import type { Metadata } from 'next'

import { ArtistsPageContent } from '@/components/ArtistsPageContent'
import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/artists']

export default function Page() {
  return <ArtistsPageContent />
}