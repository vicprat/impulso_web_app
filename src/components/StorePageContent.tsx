'use client'

import { Suspense } from 'react'

import { Client } from '@/app/(store)/store/Client'

export function StorePageContent() {
  return (
    <Suspense>
      <Client />
    </Suspense>
  )
} 