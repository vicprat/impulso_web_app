'use client'

import { Suspense } from 'react'

import { StoreLayoutAutoUpdate } from '@/components/StoreLayoutAutoUpdate'

import { StoreLayoutContent } from './StoreLayoutContent'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreLayoutAutoUpdate>
      <Suspense fallback={<></>}>
        <StoreLayoutContent>{children}</StoreLayoutContent>
      </Suspense>
    </StoreLayoutAutoUpdate>
  )
}
