'use client'

import { Suspense } from 'react'

import { StoreLayoutContent } from './StoreLayoutContent'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<></>}>
      <StoreLayoutContent>{children}</StoreLayoutContent>
    </Suspense>
  )
}
