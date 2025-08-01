import { routeMetadata } from '@/lib/metadata'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata['/membership']

export default function MembershipLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 