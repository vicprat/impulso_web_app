import type { Metadata } from 'next'


import { routeMetadata } from '@/lib/metadata'
import { StorePageContent } from '@/src/components/StorePageContent'

export const metadata: Metadata = routeMetadata['/store']

export default function Page() {
  return <StorePageContent />
}
