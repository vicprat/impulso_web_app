'use client'

import { Suspense } from 'react'

import { CouponCreateForm } from './CouponCreateForm'

export const dynamic = 'force-dynamic'

export default function CouponCreatePage() {
  return (
    <Suspense>
      <CouponCreateForm />
    </Suspense>
  )
}

