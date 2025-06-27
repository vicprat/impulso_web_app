import { Suspense } from 'react'

import { Client } from './Client'

export default function StorePage() {
  return (
    <Suspense>
      <Client />
    </Suspense>
  )
}
