'use client'

import { Suspense } from 'react'

import { Client } from './Client'
export const dynamic = 'force-dynamic'

export default function ManageInventoryPage() {
  return (
    <Suspense>
      <Client />
    </Suspense>
  )
}