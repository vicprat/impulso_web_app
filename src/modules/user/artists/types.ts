
type ImageNode = {
  id: string;
  url: string;
  altText?: string;
}

type VariantNode = {
  id: string;
  price: string;
  sku?: string;
  title: string;
}

export type ArtistProduct = {
  id: string; 
  title: string;
  handle: string;
  descriptionHtml: string;
  vendor: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  productType: string;
  tags: string[];
  images: {
    edges: { node: ImageNode }[];
  };
  variants: {
    edges: { node: VariantNode }[];
  };
}

export type GetArtistProductsResponse=  {
  products: {
    edges: { 
      node: ArtistProduct;
      cursor: string; 
    }[];
    pageInfo: PageInfo; 
  };
}

export type CreateProductResponse = {
  productCreate: {
    product: ArtistProduct;
    userErrors: { field: string[]; message: string }[];
  };
}

export type UpdateProductResponse = {
  productUpdate: {
    product: ArtistProduct;
    userErrors: { field: string[]; message: string }[];
  };
}

export type DeleteProductResponse  = {
    productDelete: {
        deletedProductId: string | null;
        userErrors: { field: string[]; message: string }[];
    }
}

export type CreateProductPayload = {
    title: string;
    descriptionHtml?: string;
    status?: 'ACTIVE' | 'DRAFT';
    tags?: string[];
    productType?: string;
    price: string;
    images?: {
        originalSource: string;
        altText?: string;
    }[];
    handle: string;
    
}
export type UpdateProductPayload  = {
  id: string;
  title?: string;
  handle?: string;
  price?: string;
  descriptionHtml?: string;
  productType?: string;
  status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  tags?: string[];
  variantData?: {
    id?: string;
    price?: string;
    sku?: string;
    title?: string;
  };
  images?: Array<{
    mediaContentType: 'IMAGE';
    originalSource: string;
  }>;
}


export type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}



export type GetArtistProductsParams  = {
  page?: number;
  limit?: number;
  search?: string;
  cursor?: string;
}

export type PaginatedProductsResponse = {
  products: ArtistProduct[];
  pageInfo: PageInfo;
  totalItems: number; 
  currentPage: number;
}



export type GraphQLQueryVariables = {
  vendor?: string;
  first?: number;
  after?: string;
  [key: string]: unknown;
};

export type ShopifyUserError = {
  field: string[];
  message: string;
}

export type ProductCreateResponse = {
  productCreate: {
    product: ArtistProduct;
    userErrors: ShopifyUserError[];
  };
}

export type ProductCreateMediaResponse = {
  productCreateMedia: {
    media: Array<{
      id: string;
    }>;
    mediaUserErrors: ShopifyUserError[];
  };
}

export type ProductVariantsBulkUpdateResponse = {
  productVariantsBulkUpdate: {
    product: {
      id: string;
    };
    productVariants: Array<{
      id: string;
      price: string;
    }>;
    userErrors: ShopifyUserError[];
  };
}

export type PublicationsResponse = {
  publications: {
      edges: Array<{ node: { id: string; name: string } }>
  }
};

export  type PublishResponse = {
  publishablePublish: {
    userErrors: ShopifyUserError[];
  }
};