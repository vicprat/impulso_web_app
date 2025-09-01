
import { HomePageContent } from '@/components/HomePageContent'
import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata[ '/' ]

export default function Page() {
  return <HomePageContent />
}
