import { storeClient } from "@/lib/shopify";
import {
  ProductSearchParams,
  CollectionSearchParams,
  ShopInfoResponse,
  ProductResponse,
  ProductsResponse,
  CollectionResponse,
  CollectionsResponse,
  Edge,
  RawProduct,
  RawCollection,
  Collection,
  Product,
} from "./types";
import { 
  SHOP_INFO_QUERY, 
  COLLECTIONS_QUERY, 
  COLLECTION_BY_HANDLE_QUERY, 
  PRODUCTS_QUERY, 
  PRODUCT_BY_HANDLE_QUERY, 
  HOMEPAGE_QUERY
} from "./queries";
import { transformCollectionData, transformProductData } from "./helpers";
import { handleGraphQLErrors } from "@/lib/graphql";
export const api = {
  getShopInfo: async (): Promise<ShopInfoResponse> => {
    try {
      const { data, errors } = await storeClient.request(SHOP_INFO_QUERY);
      
      if (errors) {
        handleGraphQLErrors(errors);
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
        handleGraphQLErrors(errors);
      }
      
      return {
        data: {
          products: data.products.edges.map((edge: Edge<RawProduct>) => 
            transformProductData(edge.node)
          ),
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
        handleGraphQLErrors(errors);
      }
      
      if (!data.product) {
        throw new Error(`Product with handle "${handle}" not found`);
      }
      
      return {
        data: transformProductData(data.product as RawProduct),
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
        handleGraphQLErrors(errors);
      }
      
      return {
        data: {
          collections: data.collections.edges.map((edge: Edge<RawCollection>) => 
            transformCollectionData(edge.node)
          ),
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
        handleGraphQLErrors(errors);
      }
      
      if (!data.collection) {
        throw new Error(`Collection with handle "${handle}" not found`);
      }
      
      return {
        data: transformCollectionData(data.collection as RawCollection),
        statusCode: 200
      };
    } catch (error) {
      console.error(`Error fetching collection with handle "${handle}":`, error);
      throw error;
    }
  },

  getHomepageData: async (): Promise<{
    data: {
      collections: Collection[];
      featuredProducts: Product[];
    };
    statusCode: number;
  }> => {
    try {
      const { data, errors } = await storeClient.request(HOMEPAGE_QUERY);
      
      if (errors) {
        handleGraphQLErrors(errors);
      }
      
      const collections: Collection[] = data.collections.edges.map((edge: Edge<RawCollection>) => {
        const rawCollection: RawCollection = {
          ...edge.node,
          products: undefined 
        };
        return transformCollectionData(rawCollection);
      });

      const featuredProducts: Product[] = data.products.edges.map((edge: Edge<RawProduct>) => 
        transformProductData(edge.node)
      );

      return {
        data: {
          collections,
          featuredProducts
        },
        statusCode: 200
      };
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw error;
    }
  },

getFilterOptions: async (): Promise<{
  productTypes: string[];
  vendors: string[];
  tags: string[];
}> => {
  console.log('🔍 API getFilterOptions - Iniciando la obtención de todos los filtros...');

  const query = `
    query AllProductsForFilters($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            productType
            vendor
            tags
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  try {
    let allProducts: { productType: string, vendor: string, tags: string[] }[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    while (hasNextPage) {
      const { data, errors } = await storeClient.request(query, {
        variables: {
          first: 250, 
          after: cursor
        }
      });

      if (errors) {
        handleGraphQLErrors(errors);
      }
      
      const productsPage = data.products.edges.map((edge: Edge<RawProduct>) => edge.node);
      allProducts = [...allProducts, ...productsPage];

      hasNextPage = data.products.pageInfo.hasNextPage;
      cursor = data.products.pageInfo.endCursor;
      
      if(hasNextPage) {
        console.log(`📑 Obtenida una página de productos, buscando la siguiente...`);
      }
    }
    
    console.log(`✅ Se encontraron un total de ${allProducts.length} productos para analizar.`);

    const productTypes = new Set<string>();
    const vendors = new Set<string>();
    const tags = new Set<string>();

    allProducts.forEach((product) => {
      if (product.productType) productTypes.add(product.productType);
      if (product.vendor) vendors.add(product.vendor);
      if (product.tags && product.tags.length > 0) {
        product.tags.forEach(tag => tags.add(tag));
      }
    });
    
    const filterOptions = {
      productTypes: [...productTypes].sort(),
      vendors: [...vendors].sort(),
      tags: [...tags].sort()
    };
    
    console.log('✅ API getFilterOptions - Opciones de filtro finales encontradas:', filterOptions);

    return filterOptions;

  } catch (error) {
    console.error("Error fetching filter options:", error);
    throw error;
  }
},

};