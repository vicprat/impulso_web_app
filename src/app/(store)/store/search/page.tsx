import { Suspense } from 'react'

import { Client } from './Client'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className='flex h-64 items-center justify-center'>
          <div className='size-12 animate-spin rounded-full border-y-2 border-blue-600'></div>
        </div>
      }
    >
      <Client />
    </Suspense>
  )
}
