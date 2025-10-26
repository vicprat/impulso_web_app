export interface CustomerUpdateInput {
  firstName?: string
  lastName?: string
}

export interface CustomerAddressInput {
  firstName?: string
  lastName?: string
  company?: string
  address1?: string
  address2?: string
  city?: string
  zip?: string
  territoryCode?: string
  zoneCode?: string
  phoneNumber?: string
}

export interface ShopifyCustomerProfile {
  id: string
  firstName?: string
  lastName?: string
  displayName?: string
  creationDate: string
  emailAddress: {
    emailAddress: string
  }
  phoneNumber?: {
    phoneNumber: string
  }
  imageUrl?: string
  tags: string[]
  defaultAddress?: CustomerAddress
}

export interface UserProfile {
  id: string
  shopifyCustomerId?: string
  email: string
  firstName?: string
  lastName?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  roles: string[]
  permissions: string[]

  postgresData?: {
    lastLoginAt?: Date
    preferences?: UserPreferences
  }

  shopifyData?: {
    displayName?: string
    imageUrl?: string
    phoneNumber?: string
    tags: string[]
    defaultAddress?: CustomerAddress
    addresses: CustomerAddress[]
    orderCount: number
  }

  syncStatus: {
    shopifyLoading: boolean
    postgresLoading: boolean
    hasShopifyData: boolean
    hasPostgresData: boolean
    shopifyError: unknown
    postgresError: unknown
  }

  needsShopifySync?: boolean
}

export interface UserPreferences {
  language?: string
  timezone?: string
  notifications?: {
    email: boolean
    sms: boolean
    push: boolean
  }
  theme?: 'light' | 'dark' | 'system'
}

export interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  hasNext: boolean
  hasPrev: boolean
}

export interface SyncOperation {
  id: string
  timestamp: Date
  status: 'success' | 'error' | 'pending'
  changes: string[]
  direction: 'local_to_shopify' | 'shopify_to_local'
  error?: string
}

export interface MoneyAmount {
  amount: string
  currencyCode: string
}

export interface ShopMoney {
  amount: string
  currencyCode: string
}

export interface PriceSet {
  shopMoney: ShopMoney
}

export interface LineItem {
  id: string
  title: string
  quantity: number
  price: MoneyAmount
}

export interface Fulfillment {
  id: string
  status: string
  updatedAt: string
}

export interface CustomerOrder {
  id: string
  name: string
  processedAt: string
  createdAt: string
  updatedAt: string
  totalPrice: MoneyAmount
  fulfillmentStatus: string
  financialStatus: string
  currencyCode: string
  email: string
  cancelledAt?: string | null
  cancelReason?: string | null
  confirmationNumber: string
  edited: boolean
  requiresShipping: boolean
  statusPageUrl?: string
  subtotal: MoneyAmount
  totalRefunded: MoneyAmount
  totalShipping: MoneyAmount
  totalTax: MoneyAmount
  lineItems: {
    edges: {
      node: LineItem
    }[]
  }
  shippingAddress?: CustomerAddress
  billingAddress?: CustomerAddress
  fulfillments: {
    edges: {
      node: Fulfillment
    }[]
  }
}

export interface AdminOrder {
  id: string
  name: string
  processedAt: string
  createdAt: string
  updatedAt: string
  displayFulfillmentStatus: string
  displayFinancialStatus: string
  currencyCode: string
  requiresShipping: boolean
  shippingLine?: {
    title: string
    code?: string
  } | null
  totalPriceSet?: PriceSet
  currentTotalPriceSet?: PriceSet
  customer: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  shippingAddress?: {
    firstName?: string
    lastName?: string
    address1?: string
    city?: string
    province?: string
    country?: string
    zip?: string
  }
  lineItems: {
    edges: {
      node: {
        id: string
        title: string
        quantity: number
        currentQuantity: number
        originalUnitPriceSet?: PriceSet
        discountedUnitPriceSet?: PriceSet
      }
    }[]
  }
  fulfillments: {
    id: string
    status: string
  }[]
}

export interface Order {
  id: string
  name: string
  processedAt: string
  displayFinancialStatus?: string
  displayFulfillmentStatus?: string
  fulfillmentStatus?: string
  totalPrice: {
    amount: string
    currencyCode: string
  }
  customer?: {
    id: string
    firstName?: string
    lastName?: string
    email: string
  }
  lineItemsCount: number
  requiresShipping?: boolean
  shippingLine?: {
    title: string
    code?: string
  }
  source?: 'shopify' | 'local'
  hasLocalData?: boolean
  tickets?: {
    id: string
    eventId: string
    qrCode: string
    status: string
    quantity: number
  }[]
}

export interface CustomerAddress {
  id: string
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  zip: string
  country: string
  province?: string
  phone?: string
}

export interface CustomerBasicInfo {
  id: string
  displayName?: string
  emailAddress: {
    emailAddress: string
  }
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string | null
  endCursor?: string | null
}

export interface CustomerOrderResult {
  data: {
    order: CustomerOrder
  }
  extensions?: {
    cost: {
      requestedQueryCost: number
      actualQueryCost: number
      throttleStatus: {
        maximumAvailable: number
        currentlyAvailable: number
        restoreRate: number
      }
    }
  }
}

export interface CustomerOrdersResult {
  customer?: {
    orders?: {
      edges: { node: CustomerOrder }[]
      pageInfo: PageInfo
    }
  }
}

export interface CustomerAddressesResult {
  customer: {
    addresses: {
      edges: { node: CustomerAddress }[]
    }
  }
}

export type FulfillmentStatus = 'FULFILLED' | 'UNFULFILLED' | 'PARTIALLY_FULFILLED' | 'RESTOCKED'

export type FinancialStatus =
  | 'AUTHORIZED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'PARTIALLY_REFUNDED'
  | 'PENDING'
  | 'REFUNDED'
  | 'VOIDED'

export type FulfillmentStatusType = 'SUCCESS' | 'CANCELLED' | 'ERROR' | 'FAILURE'

export interface CustomerOrderSummary {
  id: string
  name: string
  processedAt: string
  totalPrice: MoneyAmount
  fulfillmentStatus: FulfillmentStatus
  financialStatus: FinancialStatus
}

export interface OrderFilters {
  status?: FulfillmentStatus
  financialStatus?: FinancialStatus
  dateFrom?: string
  dateTo?: string
  first?: number
  after?: string
  before?: string
  last?: number
}

export interface AllOrdersResult {
  orders: {
    edges: { node: AdminOrder }[]
    pageInfo: PageInfo
  }
}
