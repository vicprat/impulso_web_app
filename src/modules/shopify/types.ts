import { ApiResponse } from "@/types";

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  id: string;
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type SelectedOption = {
  name: string;
  value: string;
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  compareAtPrice: Money | null;
  sku: string;
  selectedOptions: SelectedOption[];
};

export type Product = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  createdAt: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  images: Image[];
  variants: Variant[];
  tags?: string[];
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; 
}
export type Collection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  products: Product[];
};

export type RawProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  createdAt: string;
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  images?: {
    edges: Array<{
      node: Image;
    }>;
  };
  variants?: {
    edges: Array<{
      node: Variant;
    }>;
  };
};

export type RawCollection = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  image: Image | null;
  products?: {
    edges: Array<{
      node: RawProduct;
    }>;
  };
};

export type ShopInfo = {
  name: string;
  primaryDomain: {
    host: string;
    url: string;
  };
  paymentSettings: {
    currencyCode: string;
    acceptedCardBrands: string[];
    enabledPresentmentCurrencies: string[];
  };
};

export type Edge<T> = {
  node: T;
};
export type ProductSearchParams = {
  first?: number;
  after?: string | null;
  sortKey?: string;
  reverse?: boolean;
  filters?: ProductSearchFilters;
};


export type CollectionSearchParams = {
  first?: number;
  after?: string | null;
  query?: string;
};

export type ShopInfoResponse = ApiResponse<ShopInfo>;
export type ProductResponse = ApiResponse<Product>;

export type ShopifyFilterValue = {
  id: string;
  label: string;
  count: number;
  input: string; 
};

export type ShopifyFilter = {
  id: string;
  label: string;
  type: string;
  values: ShopifyFilterValue[];
};

export type ProductsResponse = ApiResponse<{
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}>;

export type CollectionResponse = ApiResponse<Collection>;
export type CollectionsResponse = ApiResponse<{
  collections: Collection[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}>;

export type FilterValue = {
  input: string;
  label: string;
  count: number;
};

export type EnrichedFilterOptions = {
  artists: FilterValue[];
  productTypes: FilterValue[];
  price: { min: number; max: number };
  techniques: FilterValue[];
  formats: FilterValue[];
  locations: FilterValue[];
  years: FilterValue[];
  series: FilterValue[]; 
  otherTags: FilterValue[];
};


export type PriceFilter = {
  price: {
    min?: number;
    max?: number;
  };
};
export interface ProductSearchFilters {
  query?: string;
  tags?: string[];
  vendor?: string[];
  productType?: string[];
  collections?: string[];
  available?: boolean;   
  price?: {
    min?: number;
    max?: number;
  };
}