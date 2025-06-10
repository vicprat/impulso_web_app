// src/modules/customer/cart-types.ts
import { Money, Image } from '@/modules/shopify/types';

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface CartLineUpdateInput {
  id: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface CartInput {
  lines?: CartLineInput[];
  attributes?: Array<{
    key: string;
    value: string;
  }>;
  discountCodes?: string[];
  buyerIdentity?: {
    email?: string;
    phone?: string;
    countryCode?: string;
    deliveryAddressPreferences?: string[];
  };
}

export interface CartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: Image;
    };
    image?: Image;
    price: Money;
    compareAtPrice?: Money;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    availableForSale: boolean;
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
}

export interface DiscountCode {
  applicable: boolean;
  code: string;
}

export interface DiscountAllocation {
  discountedAmount: Money;
  title?: string;
  code?: string;
}

export interface Cart {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalQuantity: number;
  cost: {
    totalAmount: Money;
    subtotalAmount: Money;
    totalTaxAmount?: Money;
    totalDutyAmount?: Money;
  };
  lines: {
    edges: Array<{
      node: CartLine;
    }>;
  };
  attributes: Array<{
    key: string;
    value: string;
  }>;
  discountCodes: DiscountCode[];
  discountAllocations: DiscountAllocation[];
}

export interface CartResponse {
  cart: Cart;
  userErrors?: Array<{
    field: string[];
    message: string;
    code: string;
  }>;
}

// Checkout types
export interface CheckoutInput {
  email?: string;
  shippingAddress?: {
    address1?: string;
    address2?: string;
    city?: string;
    company?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    province?: string;
    zip?: string;
  };
  allowPartialAddresses?: boolean;
  customAttributes?: Array<{
    key: string;
    value: string;
  }>;
}

export interface Checkout {
  id: string;
  webUrl: string;
  totalPrice: Money;
  subtotalPrice: Money;
  totalTax: Money;
  currencyCode: string;
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        quantity: number;
        variant: {
          id: string;
          title: string;
          price: Money;
          product: {
            handle: string;
          };
        };
      };
    }>;
  };
  shippingAddress?: {
    id: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
    phone?: string;
  };
  shippingLine?: {
    handle: string;
    price: Money;
    title: string;
  };
  availableShippingRates?: {
    ready: boolean;
    shippingRates: Array<{
      handle: string;
      price: Money;
      title: string;
    }>;
  };
  paymentDue: Money;
  requiresShipping: boolean;
  ready: boolean;
  completedAt?: string;
  note?: string;
}

export interface CheckoutResponse {
  checkout: Checkout;
  checkoutUserErrors?: Array<{
    field: string[];
    message: string;
    code: string;
  }>;
  userErrors?: Array<{
    field: string[];
    message: string;
    code: string;
  }>;
}