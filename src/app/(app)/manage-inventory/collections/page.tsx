'use client'

import { Suspense } from 'react'

import { CollectionsList } from './CollectionsList'

export const dynamic = 'force-dynamic'

export default function CollectionsPage() {
  return (
    <Suspense>
      <CollectionsList />
    </Suspense>
  )
}
