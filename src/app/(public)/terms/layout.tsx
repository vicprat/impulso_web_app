import { routeMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata['/terms']

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 