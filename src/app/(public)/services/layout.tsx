import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata['/services']

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 