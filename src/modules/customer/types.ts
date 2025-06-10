export interface CustomerUpdateInput {
  firstName?: string;
  lastName?: string;
}

export interface CustomerAddressInput {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
  territoryCode?: string;
  zoneCode?: string;
  phoneNumber?: string;
}

export interface CustomerAddress {
  id: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
  country?: string;
  province?: string;
  phoneNumber?: string;
  territoryCode?: string;
  zoneCode?: string;
  formattedArea?: string;
}

export interface CustomerOrder {
  id: string;
  name: string;
  processedAt: string;
  createdAt: string;
  updatedAt: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  fulfillmentStatus: string;
  financialStatus: string;
  currencyCode: string;
  email: string;
  cancelledAt?: string;
  cancelReason?: string;
  confirmationNumber: string;
  edited: boolean;
  requiresShipping: boolean;
  statusPageUrl: string;
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        quantity: number;
        price: {
          amount: string;
          currencyCode: string;
        };
      };
    }>;
  };
  shippingAddress?: CustomerAddress;
  billingAddress?: CustomerAddress;
  subtotal: {
    amount: string;
    currencyCode: string;
  };
  totalRefunded: {
    amount: string;
    currencyCode: string;
  };
  totalShipping: {
    amount: string;
    currencyCode: string;
  };
  totalTax: {
    amount: string;
    currencyCode: string;
  };
  fulfillments?: {
    edges: Array<{
      node: {
        id: string;
        status: string;
        trackingCompany?: string;
        trackingNumbers: string[];
        updatedAt: string;
      };
    }>;
  };
}

export interface ShopifyCustomerProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  creationDate: string;
  emailAddress: {
    emailAddress: string;
  };
  phoneNumber?: {
    phoneNumber: string;
  };
  imageUrl?: string;
  tags: string[];
  defaultAddress?: CustomerAddress;
}


export interface UserProfile {
  id: string;
  shopifyCustomerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: string[];
  permissions: string[];
  
  // Datos extendidos de Postgres
  postgresData?: {
    lastLoginAt?: Date;
    preferences?: UserPreferences;
    // Agregar más campos custom aquí
  };
  
  // Datos de Shopify
  shopifyData?: {
    displayName?: string;
    imageUrl?: string;
    phoneNumber?: string;
    tags: string[];
    defaultAddress?: CustomerAddress;
    addresses: CustomerAddress[];
    orderCount: number;
  };
  
  // Estados de sincronización
  syncStatus: {
    shopifyLoading: boolean;
    postgresLoading: boolean;
    hasShopifyData: boolean;
    hasPostgresData: boolean;
    shopifyError: any;
    postgresError: any;
  };
  
  // Flag para cambios pendientes
  needsShopifySync?: boolean;
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
  // Agregar más preferencias custom aquí
}

export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// /types/sync.ts - Types para sincronización
export interface SyncOperation {
  id: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  changes: string[];
  direction: 'local_to_shopify' | 'shopify_to_local';
  error?: string;
}

export interface SyncDifference {
  field: string;
  local: any;
  shopify: any;
  type: 'update' | 'create' | 'delete';
}