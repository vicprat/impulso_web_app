import { Suspense } from 'react'

import { ArtistsClient } from './ArtistsClient'

export default function ArtistsPage() {
  return (
    <Suspense>
      <ArtistsClient />
    </Suspense>
  )
}
