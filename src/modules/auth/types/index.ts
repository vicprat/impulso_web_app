import { type Links, type Profile } from '@prisma/client'

import { type Cart } from '@/modules/cart/types'

export interface User {
  id: string
  shopifyCustomerId?: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  permissions: string[]
  isPublic?: boolean
  profile?: Profile | null
  links?: Links[] | null
}

export interface AuthContextType {
  user: User | null
  cart: Cart | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateCart: (cart: Cart) => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

export interface AuthMeResponse {
  user: User
  expiresAt: string
  refreshed: boolean
  cart: Cart | null
}

export interface UseAuthGuardOptions {
  redirectTo?: string
  requiredPermission?: string
  requiredRole?: string
}

export interface CustomerOrder {
  id: string
  name: string
  processedAt: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
  fulfillmentStatus: string
  financialStatus: string
}

export interface CustomerAddress {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province: string
  zip: string
  country: string
  phone?: string
}
