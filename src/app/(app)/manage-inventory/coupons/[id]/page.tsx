'use client'

import { Suspense, use } from 'react'

import { CouponDetail } from './CouponDetail'

export const dynamic = 'force-dynamic'

export default function CouponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <Suspense>
      <CouponDetail couponId={id} />
    </Suspense>
  )
}

