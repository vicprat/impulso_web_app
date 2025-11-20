'use client'

import { Suspense } from 'react'

import { CreatePrivateRoom } from './CreatePrivateRoom'

export const dynamic = 'force-dynamic'

export default function CreatePrivateRoomPage() {
  return (
    <Suspense>
      <CreatePrivateRoom />
    </Suspense>
  )
}
