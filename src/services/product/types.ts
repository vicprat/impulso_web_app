import { ArtworkDetails, Product } from '@/models/Product';

export type GetProductsParams = {
  limit?: number;
  cursor?: string;
  search?: string;
};


export type CreateProductPayload = {
  title: string;
  description: string;
  productType: string;
  vendor?: string; 
  status: 'ACTIVE' | 'DRAFT';
  tags: string[];
  price: string;
  inventoryQuantity?: number; 
  details?: Partial<ArtworkDetails>; 
  images?: { 
    mediaContentType: 'IMAGE';
    originalSource: string;
  }[];
};

export type UpdateProductPayload = Partial<CreateProductPayload> & { id: string; };

export type PaginatedProductsResponse = {
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor?: string | null;
  };
};

export type ShopifyUserError = {
  field: string;
  message: string;
};



export type ImageNode = {
  id?: string;
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export type VariantNode = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: string; 
    sku: string | null;
  inventoryQuantity: number | null;
  inventoryPolicy: 'DENY' | 'CONTINUE';
  inventoryItem: {
    tracked: boolean;
  };
}

export type ShopifyMetafieldNode = {
  namespace: string;
  key: string;
  value: string;
}

export type ShopifyProductData = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  tags: string[];
  images: { edges: { node: ImageNode }[] };
  variants: { edges: { node: VariantNode }[] };
  metafields: { edges: { node: ShopifyMetafieldNode }[] };
};

export type ProductMutationResponse<T extends string> = {
  [K in T]: {
    product: ShopifyProductData;
    userErrors: ShopifyUserError[];
  };
};

export type DeleteMutationResponse = {
    productDelete: {
        deletedProductId: string | null;
        userErrors: ShopifyUserError[];
    }
};

export type GetProductsApiResponse = {
  products: {
    edges: {
      node: ShopifyProductData;
      cursor: string;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string | null;
    };
  };
};

export type GetPublicationsApiResponse = {
  publications: {
    edges: {
      node: {
        id: string;
        name: string;
      };
    }[];
  };
};

export type InventorySetOnHandQuantitiesResponse = {
  inventorySetOnHandQuantities: {
    inventoryAdjustmentGroup: { id: string } | null;
    userErrors: ShopifyUserError[];
  };
};

export type GetInventoryItemResponse = {
  productVariant: {
    id: string;
    inventoryItem: {
      id: string;
    };
  } | null;
};

export type ProductCreateMediaResponse = {
    productCreateMedia: {
        media: Array<{
            id: string;
            image: {
                url: string;
                altText: string | null;
            };
        }>;
        mediaUserErrors: ShopifyUserError[];
        userErrors: ShopifyUserError[];
    };
};