'use client'

import { Suspense, use } from 'react'

import { PrivateRoomDetail } from './PrivateRoomDetail'

export const dynamic = 'force-dynamic'

interface PrivateRoomPageProps {
  params: Promise<{ id: string }>
}

export default function PrivateRoomPage({ params }: PrivateRoomPageProps) {
  const { id } = use(params)

  return (
    <Suspense>
      <PrivateRoomDetail roomId={id} />
    </Suspense>
  )
}
