
import { storeClient } from "@/lib/shopify";
import {
  Product,
  Collection,
  ProductSearchParams,
  CollectionSearchParams,
  ShopInfoResponse,
  ProductResponse,
  ProductsResponse,
  CollectionResponse,
  CollectionsResponse
} from "./types";


const SHOP_INFO_QUERY = `
  query ShopInfo {
    shop {
      name
      primaryDomain {
        host
        url
      }
      paymentSettings {
        currencyCode
        acceptedCardBrands
        enabledPresentmentCurrencies
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products($first: Int!, $after: String, $query: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, query: $query, sortKey: $sortKey, reverse: $reverse) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          availableForSale
          productType
          vendor
          createdAt
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                sku
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      availableForSale
      productType
      vendor
      createdAt
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
            width
            height
          }
        }
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
            compareAtPrice {
              amount
              currencyCode
            }
            sku
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `
  query Collections($first: Int!, $after: String, $query: String) {
    collections(first: $first, after: $after, query: $query) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          image {
            id
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

const COLLECTION_BY_HANDLE_QUERY = `
  query CollectionByHandle($handle: String!, $productsFirst: Int!) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      image {
        id
        url
        altText
        width
        height
      }
      products(first: $productsFirst) {
        edges {
          node {
            id
            title
            handle
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Helper para transformar la estructura de datos de GraphQL
const transformProductData = (product: any): Product => {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    availableForSale: product.availableForSale,
    productType: product.productType,
    vendor: product.vendor,
    createdAt: product.createdAt,
    priceRange: product.priceRange,
    images: product.images.edges.map((edge: any) => edge.node),
    variants: product.variants.edges.map((edge: any) => edge.node)
  };
};

const transformCollectionData = (collection: any): Collection => {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    description: collection.description,
    descriptionHtml: collection.descriptionHtml,
    image: collection.image,
    products: collection.products?.edges.map((edge: any) => transformProductData(edge.node)) || []
  };
};

export const shopifyApi = {
  getShopInfo: async (): Promise<ShopInfoResponse> => {
    try {
      const { data, errors } = await storeClient.request(SHOP_INFO_QUERY);
      
      if (errors) {
        throw new Error(errors[0].message);
      }
      
      return {
        data: data.shop,
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching shop info:", error);
      throw error;
    }
  },
  
  getProducts: async (params: ProductSearchParams = {}): Promise<ProductsResponse> => {
    const { first = 12, after = null, query = "", sortKey = "BEST_SELLING", reverse = false } = params;
    
    try {
      const { data, errors } = await storeClient.request(PRODUCTS_QUERY, {
        variables: {
          first,
          after,
          query,
          sortKey,
          reverse
        }
      });
      
      if (errors) {
        throw new Error(errors[0].message);
      }
      
      return {
        data: {
          products: data.products.edges.map((edge: any) => transformProductData(edge.node)),
          pageInfo: data.products.pageInfo
        },
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
  
  getProductByHandle: async (handle: string): Promise<ProductResponse> => {
    try {
      const { data, errors } = await storeClient.request(PRODUCT_BY_HANDLE_QUERY, {
        variables: {
          handle
        }
      });
      
      if (errors) {
        throw new Error(errors[0].message);
      }
      
      if (!data.product) {
        throw new Error(`Product with handle "${handle}" not found`);
      }
      
      return {
        data: transformProductData(data.product),
        statusCode: 200
      };
    } catch (error) {
      console.error(`Error fetching product with handle "${handle}":`, error);
      throw error;
    }
  },
  
  getCollections: async (params: CollectionSearchParams = {}): Promise<CollectionsResponse> => {
    const { first = 10, after = null, query = "" } = params;
    
    try {
      const { data, errors } = await storeClient.request(COLLECTIONS_QUERY, {
        variables: {
          first,
          after,
          query
        }
      });
      
      if (errors) {
        throw new Error(errors[0].message);
      }
      
      return {
        data: {
          collections: data.collections.edges.map((edge: any) => transformCollectionData(edge.node)),
          pageInfo: data.collections.pageInfo
        },
        statusCode: 200
      };
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw error;
    }
  },
  
  getCollectionByHandle: async (handle: string, productsFirst = 12): Promise<CollectionResponse> => {
    try {
      const { data, errors } = await storeClient.request(COLLECTION_BY_HANDLE_QUERY, {
        variables: {
          handle,
          productsFirst
        }
      });
      
      if (errors) {
        throw new Error(errors[0].message);
      }
      
      if (!data.collection) {
        throw new Error(`Collection with handle "${handle}" not found`);
      }
      
      return {
        data: transformCollectionData(data.collection),
        statusCode: 200
      };
    } catch (error) {
      console.error(`Error fetching collection with handle "${handle}":`, error);
      throw error;
    }
  }
};