import type { Metadata } from 'next'

import { HomePageContent } from '@/components/HomePageContent'
import { routeMetadata } from '@/lib/metadata'

export const metadata: Metadata = routeMetadata['/']

export default function Page() {
  return <HomePageContent />
}
