import { Suspense } from 'react'

import { StoreLayoutContent } from './StoreLayoutContent'

import { Footer } from '@/components/Footer'
import { StoreLayoutAutoUpdate } from '@/components/StoreLayoutAutoUpdate'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <StoreLayoutAutoUpdate>
      <Suspense fallback={<></>}>
        <StoreLayoutContent>{children}</StoreLayoutContent>
      </Suspense>
      <Footer />
    </StoreLayoutAutoUpdate>
  )
}
