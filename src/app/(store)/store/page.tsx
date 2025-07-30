

import { routeMetadata } from '@/lib/metadata'
import { StorePageContent } from '@/src/components/StorePageContent'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata['/store']

export default function Page() {
  return <StorePageContent />
}
