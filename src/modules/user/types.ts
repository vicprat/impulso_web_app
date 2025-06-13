import { CustomerAddress } from "../auth/types";

export interface UserProfile {
  // Datos básicos del usuario
  id: string;
  shopifyCustomerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Estado de sincronización
  needsShopifySync?: boolean;
  
  // Datos extendidos de Shopify
  shopifyData?: {
    displayName: string;
    imageUrl: string;
    phoneNumber?: string;
    tags: string[];
    defaultAddress?: CustomerAddress;
    addresses: CustomerAddress[];
    orderCount?: number;
    totalSpent?: {
      amount: string;
      currencyCode: string;
    };
  };
  
  // Control de acceso
  roles: string[];
  permissions: string[];
  
  // Metadatos adicionales
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
}

export interface UserManagementContextType {
  // Estado del usuario actual
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  
  // Gestión de usuarios (para admins)
  users: UserProfile[];
  usersLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  
  // Acciones del usuario actual
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  syncWithShopify: () => Promise<void>;
  updatePreferences: (preferences: UserProfile['preferences']) => Promise<void>;
  
  // Acciones administrativas
  getAllUsers: (filters?: UserFilters) => Promise<void>;
  getUserById: (id: string) => Promise<UserProfile | null>;
  updateUserRole: (userId: string, roles: string[]) => Promise<void>;
  deactivateUser: (userId: string) => Promise<void>;
  reactivateUser: (userId: string) => Promise<void>;
  
  // Control de acceso
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canManageUser: (targetUserId: string) => boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'lastLoginAt' | 'email' | 'firstName';
  sortOrder?: 'asc' | 'desc';
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
