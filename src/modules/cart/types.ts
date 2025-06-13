import { Money, Image } from '@/modules/shopify/types';

export type CartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export type CartLineUpdateInput = {
  id: string;
  quantity: number;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
}

export type CartInput = {
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

export type CartLine = {
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

export type DiscountCode = {
  applicable: boolean;
  code: string;
}

export type DiscountAllocation = {
  discountedAmount: Money;
  title?: string;
  code?: string;
}

export type Cart = {
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

export type CartResponse= {
  cart: Cart;
  userErrors?: Array<{
    field: string[];
    message: string;
    code: string;
  }>;
}

