import { ApiResponse } from "@/types";

export type Money = {
  amount: string;
  currencyCode: string;
};

export type CustomerAddress = {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
};

export type CustomerAddressInput = {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone?: string;
};

export type EmailAddress = {
  emailAddress: string;
};

export type PhoneNumber = {
  phoneNumber: string;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  emailAddress: EmailAddress;
  phoneNumber?: PhoneNumber;
  createdAt: string;
  updatedAt: string;
  acceptsMarketing: boolean;
  defaultAddress?: CustomerAddress;
};

export type CustomerUpdateInput = {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  acceptsMarketing?: boolean;
};

export type OrderLineItemVariant = {
  id: string;
  title: string;
  image?: {
    url: string;
    altText: string | null;
  };
  price: Money;
};

export type OrderLineItem = {
  title: string;
  quantity: number;
  variant?: OrderLineItemVariant;
};

export type OrderShippingAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  zip: string;
  country: string;
};

export type Order = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  currentTotalPrice: Money;
  lineItems: OrderLineItem[];
  shippingAddress?: OrderShippingAddress;
};

export type OrdersPageInfo = {
  hasNextPage: boolean;
  endCursor: string | null;
};

export type UserError = {
  field: string[];
  message: string;
};

export type GraphQLError = {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: Record<string, unknown>;
};
export type CustomerProfileResponse = ApiResponse<Customer>;
export type CustomerAddressesResponse = ApiResponse<CustomerAddress[]>;
export type CustomerAddressResponse = ApiResponse<CustomerAddress>;
export type CustomerOrdersResponse = ApiResponse<{
  orders: Order[];
  pageInfo: OrdersPageInfo;
}>;
export type CustomerUpdateResponse = ApiResponse<Customer>;

export type OrdersSearchParams = {
  first?: number;
  after?: string | null;
};

export type RawOrderLineItem = {
  title: string;
  quantity: number;
  variant: {
    id: string;
    title: string;
    image: {
      url: string;
      altText: string | null;
    } | null;
    price: Money;
  } | null;
};

export type RawOrder = {
  id: string;
  name: string;
  processedAt: string;
  fulfillmentStatus: string;
  financialStatus: string;
  currentTotalPrice: Money;
  lineItems: {
    edges: Array<{
      node: RawOrderLineItem;
    }>;
  };
  shippingAddress: OrderShippingAddress | null;
};

export type CustomerAddressCreateResult = {
  customerAddress: CustomerAddress;
  userErrors: UserError[];
};

export type CustomerUpdateResult = {
  customer: Customer;
  userErrors: UserError[];
};