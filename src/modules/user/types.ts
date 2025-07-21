import { type CustomerAddress } from '../auth/types'

export interface UserProfile {
  // Datos básicos del usuario
  id: string
  shopifyCustomerId: string
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

  // Estado de sincronización
  needsShopifySync?: boolean

  // Datos extendidos de Shopify
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

  // Control de acceso - mantener como arrays para compatibilidad
  roles: string[]
  permissions: string[]

  // Metadatos adicionales
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

// ✅ NUEVO: Tipo para los datos crudos de la base de datos con UserRole
export interface UserWithUserRole {
  id: string
  shopifyCustomerId: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date

  // Relación UserRole de la base de datos
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
  // Estado del usuario actual
  currentUser: UserProfile | null
  isLoading: boolean
  error: string | null

  // Gestión de usuarios (para admins)
  users: UserProfile[]
  usersLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }

  // Acciones del usuario actual
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  syncWithShopify: () => Promise<void>
  updatePreferences: (preferences: UserProfile['preferences']) => Promise<void>

  // Acciones administrativas
  getAllUsers: (filters?: UserFilters) => Promise<void>
  getUserById: (id: string) => Promise<UserProfile | null>

  // ✅ ACTUALIZADO: Un solo rol en lugar de array
  updateUserRole: (userId: string, role: string) => Promise<void>

  deactivateUser: (userId: string) => Promise<void>
  reactivateUser: (userId: string) => Promise<void>

  // Control de acceso
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  canManageUser: (targetUserId: string) => boolean
}

export interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
  isPublic?: boolean // ✅ NUEVO: Filtro para visibilidad pública del perfil
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'firstName'
  sortOrder?: 'asc' | 'desc'
}

// ✅ NUEVO: Tipos para operaciones de roles
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

// ✅ NUEVO: Tipo para crear/actualizar usuarios
export interface UserCreateInput {
  shopifyCustomerId: string
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

// ✅ ACTUALIZADO: Inputs para perfil y links
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

// ✅ NUEVO: Tipos para transformar datos de DB a frontend
export interface UserTransformer {
  /**
   * Convierte un usuario con UserRole de la DB a UserProfile para el frontend
   */
  fromUserWithUserRole(user: UserWithUserRole): UserProfile

  /**
   * Extrae roles de UserRole array
   */
  extractRoles(userRoles: UserWithUserRole['UserRole']): string[]

  /**
   * Extrae permisos de UserRole array
   */
  extractPermissions(userRoles: UserWithUserRole['UserRole']): string[]
}

export type PublicArtist = {
  id: string
  name: string
  biography: string | null
  profile_image_url: string | null
  background_image_url: string | null
}
