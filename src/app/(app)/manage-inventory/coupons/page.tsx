'use client'

import { Suspense } from 'react'

import { CouponsList } from './CouponsList'

export const dynamic = 'force-dynamic'

export default function CouponsPage() {
  return (
    <Suspense>
      <CouponsList />
    </Suspense>
  )
}

