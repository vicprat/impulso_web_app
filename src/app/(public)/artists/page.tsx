
import { ArtistsPageContent } from '@/components/ArtistsPageContent'
import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata['/artists']

export default function Page() {
  return <ArtistsPageContent />
}