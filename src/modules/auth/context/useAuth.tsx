'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { type Cart } from '@/modules/cart/types'

import { type AuthContextType, type AuthMeResponse, type User } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
          setUser(data.user)
          setCart(data.cart)
        } else {
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
    }
  }, [])

  const login = useCallback(() => {
    window.location.href = '/api/auth/login'
  }, [])

  const logout = useCallback(async () => {
    try {
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
      } else {
        setUser(null)
        setCart(null)
      }
    } catch {
      setUser(null)
      setCart(null)
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
