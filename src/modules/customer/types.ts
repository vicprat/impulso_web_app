export type CustomerUpdateInput = {
  firstName?: string;
  lastName?: string;
}

export type CustomerAddressInput = {
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

export type ShopifyCustomerProfile = {
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


export type UserProfile = {
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
  
  postgresData?:  {
    lastLoginAt?: Date;
    preferences?: UserPreferences;
  };
  
  shopifyData?: {
    displayName?: string;
    imageUrl?: string;
    phoneNumber?: string;
    tags: string[];
    defaultAddress?: CustomerAddress;
    addresses: CustomerAddress[];
    orderCount: number;
  };
  
  syncStatus:  {
    shopifyLoading: boolean;
    postgresLoading: boolean;
    hasShopifyData: boolean;
    hasPostgresData: boolean;
    shopifyError: unknown;
    postgresError: unknown;
  };
  
  needsShopifySync?: boolean;
}

export type UserPreferences = {
  language?: string;
  timezone?: string;
  notifications?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export type UserFilters = {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type SyncOperation = {
  id: string;
  timestamp: Date;
  status: 'success' | 'error' | 'pending';
  changes: string[];
  direction: 'local_to_shopify' | 'shopify_to_local';
  error?: string;
}


export type CustomerOrder = {
  id: string;
  name: string;
  processedAt: string;
  totalPrice: {
    amount: string;
    currencyCode: string;
  };
  fulfillmentStatus: string;
  financialStatus: string;
}

export type CustomerAddress= {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
}


export type CustomerBasicInfo = {
  id: string;
  displayName?: string;
  emailAddress: {
    emailAddress: string;
  };
}

// Tipo para PageInfo de GraphQL
export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string | null;
  endCursor?: string | null;
}

// Tipo para el resultado de órdenes
export type CustomerOrdersResult = {
  customer: {
    orders: {
      edges: Array<{ node: CustomerOrder }>;
      pageInfo: PageInfo;
    };
  };
}

// Tipo para el resultado de direcciones  
export type CustomerAddressesResult = {
  customer: {
    addresses: {
      edges: Array<{ node: CustomerAddress }>;
    };
  };
}