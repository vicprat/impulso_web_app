'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

import { type AuthContextType, type AuthMeResponse, type User } from '../types'

import { type Cart } from '@/modules/cart/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const REFRESH_BEFORE_EXPIRY_MS = 2 * 60 * 1000

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleTokenRefresh = useCallback((expiresAt: Date) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const now = Date.now()
    const expiryTime = new Date(expiresAt).getTime()
    const timeUntilRefresh = expiryTime - now - REFRESH_BEFORE_EXPIRY_MS

    if (timeUntilRefresh > 0) {
      console.log(`[AuthProvider] Scheduling refresh in ${timeUntilRefresh / 1000}s`)
      refreshTimeoutRef.current = setTimeout(async () => {
        console.log('[AuthProvider] Triggering scheduled refresh...')
        try {
          const response = await fetch('/api/auth/refresh', {
            credentials: 'include',
            method: 'POST',
          })
          if (response.ok) {
            console.log('[AuthProvider] Scheduled refresh successful')
            const data: AuthMeResponse = await response.json()
            setUser(data.user)
            setCart(data.cart)

            const nextExpiresAt = new Date(data.expiresAt)
            scheduleTokenRefresh(nextExpiresAt)
          } else {
            console.log('[AuthProvider] Scheduled refresh failed')
            setUser(null)
            setCart(null)
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current)
            }
          }
        } catch (e) {
          console.error('[AuthProvider] Scheduled refresh error:', e)
          setUser(null)
          setCart(null)
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
          }
        }
      }, timeUntilRefresh)
    } else {
      void (async () => {
        try {
          const response = await fetch('/api/auth/refresh', {
            credentials: 'include',
            method: 'POST',
          })
          if (response.ok) {
            const data: AuthMeResponse = await response.json()
            setUser(data.user)
            setCart(data.cart)

            const nextExpiresAt = new Date(data.expiresAt)
            scheduleTokenRefresh(nextExpiresAt)
          } else {
            setUser(null)
            setCart(null)
            if (refreshTimeoutRef.current) {
              clearTimeout(refreshTimeoutRef.current)
            }
          }
        } catch {
          setUser(null)
          setCart(null)
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current)
          }
        }
      })()
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        credentials: 'include',
        method: 'POST',
      })
      if (response.ok) {
        const data: AuthMeResponse = await response.json()
        setUser(data.user)
        setCart(data.cart)

        const expiresAt = new Date(data.expiresAt)
        scheduleTokenRefresh(expiresAt)
      } else {
        setUser(null)
        setCart(null)
        if (refreshTimeoutRef.current) {
          clearTimeout(refreshTimeoutRef.current)
        }
      }
    } catch {
      setUser(null)
      setCart(null)
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [scheduleTokenRefresh])

  useEffect(() => {
    const controller = new AbortController()

    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          signal: controller.signal,
        })

        if (response.ok) {
          const data: AuthMeResponse = await response.json()
          console.log('[AuthProvider] Initial check success. User:', data.user.email)
          setUser(data.user)
          setCart(data.cart)

          const expiresAt = new Date(data.expiresAt)
          console.log('[AuthProvider] Token expires at:', expiresAt)
          scheduleTokenRefresh(expiresAt)
        } else {
          console.log('[AuthProvider] Initial check failed:', response.status)
          setUser(null)
          setCart(null)
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setUser(null)
          setCart(null)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void checkAuth()

    return () => {
      controller.abort()
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [scheduleTokenRefresh])

  const login = useCallback(() => {
    window.location.href = '/api/auth/login'
  }, [])

  const logout = useCallback(async () => {
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }

      const response = await fetch('/api/auth/logout', {
        credentials: 'include',
        method: 'POST',
      })
      const data = await response.json()
      setUser(null)
      setCart(null)

      if (data.shopifyLogoutUrl) {
        window.location.href = data.shopifyLogoutUrl
      } else {
        window.location.href = '/'
      }
    } catch {
      setUser(null)
      setCart(null)
      window.location.href = '/'
    }
  }, [])

  const updateCart = useCallback((updatedCart: Cart) => {
    setCart(updatedCart)
  }, [])

  const hasPermission = useCallback(
    (permission: string) => {
      if (!user?.permissions) return false
      const permissionsSet = new Set(user.permissions)
      return permissionsSet.has(permission)
    },
    [user]
  )

  const hasRole = useCallback(
    (role: string) => {
      if (!user?.roles) return false
      const rolesSet = new Set(user.roles)
      return rolesSet.has(role)
    },
    [user]
  )

  const value: AuthContextType = {
    cart,
    hasPermission,
    hasRole,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refresh,
    simulateExpireIn: (seconds: number) => {
      const now = Date.now()
      const fakeExpiresAt = new Date(now + seconds * 1000)
      scheduleTokenRefresh(fakeExpiresAt)
    },
    updateCart,
    user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
