import { type CustomerAddress } from '../auth/types'

export interface UserProfile {
  id: string
  shopifyCustomerId?: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date

  isPublic: boolean
  bio?: string | null
  profileImage?: string | null

  artist?: {
    id: string
    name: string
    bio?: string | null
    portfolioUrl?: string | null
    artistType?: 'IMPULSO' | 'COLLECTIVE'
  } | null

  needsShopifySync?: boolean

  shopifyData?: {
    displayName: string
    imageUrl: string
    phoneNumber?: string
    tags: string[]
    defaultAddress?: CustomerAddress
    addresses: CustomerAddress[]
    orderCount?: number
    totalSpent?: {
      amount: string
      currencyCode: string
    }
  }

  roles: string[]
  permissions: string[]

  preferences?: {
    language?: string
    timezone?: string
    notifications?: {
      email: boolean
      sms: boolean
      push: boolean
    }
  }
}

export interface UserWithUserRole {
  id: string
  shopifyCustomerId?: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date

  UserRole: {
    id: string
    userId: string
    roleId: string
    assignedAt: Date
    assignedBy?: string
    role: {
      id: string
      name: string
      description?: string
      permissions: {
        id: string
        roleId: string
        permissionId: string
        permission: {
          id: string
          name: string
          description?: string
          resource?: string
          action?: string
        }
      }[]
    }
  }[]
}

export interface UserManagementContextType {
  currentUser: UserProfile | null
  isLoading: boolean
  error: string | null

  users: UserProfile[]
  usersLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }

  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  syncWithShopify: () => Promise<void>
  updatePreferences: (preferences: UserProfile['preferences']) => Promise<void>

  getAllUsers: (filters?: UserFilters) => Promise<void>
  getUserById: (id: string) => Promise<UserProfile | null>

  updateUserRole: (userId: string, role: string) => Promise<void>

  deactivateUser: (userId: string) => Promise<void>
  reactivateUser: (userId: string) => Promise<void>

  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canManageUser: (targetUserId: string) => boolean
}

export interface UserFilters {
  search?: string
  role?: string | string[]
  isActive?: boolean
  isPublic?: boolean
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'firstName'
  sortOrder?: 'asc' | 'desc'
}

export interface RoleAssignment {
  userId: string
  roleName: string
  assignedBy?: string
}

export interface UserRoleInfo {
  id: string
  name: string
  description?: string
  assignedAt: Date
  assignedBy?: string
}

export interface UserCreateInput {
  shopifyCustomerId?: string
  email: string
  firstName?: string
  lastName?: string
  roleId?: string
}

export interface UserUpdateInput {
  email?: string
  firstName?: string
  lastName?: string
  isActive?: boolean
}

export interface ProfileUpdateInput {
  occupation?: string | null
  description?: string | null
  bio?: string | null
}

export interface LinkCreateInput {
  platform: string
  url: string
  order?: number
  isPrimary?: boolean
}

export interface LinkUpdateInput {
  platform?: string
  url?: string
  order?: number
  isPrimary?: boolean
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthorizationError'
  }
}

export interface UserTransformer {
  fromUserWithUserRole(user: UserWithUserRole): UserProfile

  extractRoles(userRoles: UserWithUserRole['UserRole']): string[]

  extractPermissions(userRoles: UserWithUserRole['UserRole']): string[]
}

export interface PublicArtist {
  id: string
  firstName: string
  lastName: string
  email: string
  profile: {
    avatarUrl: string | null
    backgroundImageUrl: string | null
    bio: string | null
    occupation: string | null
  }
}
