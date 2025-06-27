import { type Money, type Image } from '@/modules/shopify/types'

export interface CartLineInput {
  merchandiseId: string
  quantity: number
  attributes?: {
    key: string
    value: string
  }[]
}

export interface CartLineUpdateInput {
  id: string
  quantity: number
  attributes?: {
    key: string
    value: string
  }[]
}

export interface CartInput {
  lines?: CartLineInput[]
  attributes?: {
    key: string
    value: string
  }[]
  discountCodes?: string[]
  buyerIdentity?: {
    email?: string
    phone?: string
    countryCode?: string
    deliveryAddressPreferences?: string[]
  }
}

export interface CartLine {
  id: string
  quantity: number
  cost: {
    totalAmount: Money
  }
  merchandise: {
    id: string
    title: string
    product: {
      id: string
      title: string
      handle: string
      featuredImage?: Image
    }
    image?: Image
    price: Money
    compareAtPrice?: Money
    selectedOptions: {
      name: string
      value: string
    }[]
    availableForSale: boolean
  }
  attributes: {
    key: string
    value: string
  }[]
}

export interface DiscountCode {
  applicable: boolean
  code: string
}

export interface DiscountAllocation {
  discountedAmount: Money
  title?: string
  code?: string
}

export interface Cart {
  id: string
  createdAt: string
  updatedAt: string
  totalQuantity: number
  cost: {
    totalAmount: Money
    subtotalAmount: Money
    totalTaxAmount?: Money
    totalDutyAmount?: Money
  }
  lines: {
    edges: {
      node: CartLine
    }[]
  }
  attributes: {
    key: string
    value: string
  }[]
  discountCodes: DiscountCode[]
  discountAllocations: DiscountAllocation[]
}

export interface CartResponse {
  cart: Cart
  userErrors?: {
    field: string[]
    message: string
    code: string
  }[]
}
