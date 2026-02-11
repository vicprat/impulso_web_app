'use client'

import { useState } from 'react'

import { useAuth } from '@/modules/auth/context/useAuth'

export function AuthDebugger() {
  const { logout, refresh, simulateExpireIn, user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className='fixed bottom-4 left-4 z-50 font-mono text-xs'>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className='rounded bg-black px-2 py-1 text-white shadow transition-colors hover:bg-gray-800'
      >
        {isVisible ? 'Hide Auth Debug' : 'Auth Debug'}
      </button>

      {isVisible && (
        <div className='mt-2 w-64 rounded border border-gray-200 bg-white p-4 text-black shadow-lg'>
          <div className='mb-2'>
            <span className='font-bold'>User:</span> {user ? user.email : 'Not Logged In'}
          </div>

          <div className='mt-4 flex flex-col gap-2'>
            <button
              onClick={() => refresh()}
              className='rounded bg-blue-500 px-3 py-1 text-white transition-colors hover:bg-blue-600'
            >
              Force Refresh Token
            </button>

            <button
              onClick={() => logout()}
              className='rounded bg-red-500 px-3 py-1 text-white transition-colors hover:bg-red-600'
            >
              Force Logout
            </button>

            <button
              onClick={() => {
                simulateExpireIn(125)
              }}
              className='rounded bg-purple-500 px-3 py-1 text-white transition-colors hover:bg-purple-600'
            >
              Test Auto-Refresh (in 5s)
            </button>
          </div>

          <div className='mt-4 text-[10px] text-gray-500'>
            Check console for detailed "[AuthProvider]" logs.
          </div>
        </div>
      )}
    </div>
  )
}
