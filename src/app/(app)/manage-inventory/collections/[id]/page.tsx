'use client'

import { Suspense, use } from 'react'

import { CollectionDetail } from './CollectionDetail'

export const dynamic = 'force-dynamic'

export default function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Suspense>
      <CollectionDetail collectionId={id} />
    </Suspense>
  )
}
