import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import { prisma } from '@/lib/prisma';
import { 
  GET_ARTIST_PRODUCTS_QUERY,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  ADD_PRODUCT_MEDIA_MUTATION,
  UPDATE_VARIANT_PRICE_MUTATION,
  GET_SINGLE_PRODUCT_QUERY,
  GET_PUBLICATIONS_QUERY,
  PUBLISH_PRODUCT_MUTATION
} from './queries';
import { 
  GetArtistProductsResponse,
  ArtistProduct,
  CreateProductPayload,
  UpdateProductResponse,
  DeleteProductResponse,
  PaginatedProductsResponse,
  GetArtistProductsParams,
  GraphQLQueryVariables,
  ShopifyUserError,
  ProductCreateResponse,
  ProductCreateMediaResponse,
  ProductVariantsBulkUpdateResponse,
  UpdateProductPayload,
  PublicationsResponse,
  PublishResponse
} from './types';
import { getServerSession } from '@/modules/auth/server/server';


async function getArtistVendorName() {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { artist: true },
  });

  const vendorName = user?.artist?.name; 

  if (!vendorName) {
    throw new Error('User is not an artist or vendor name is missing');
  }

  return vendorName;
}

async function getSalesChannelIds(): Promise<string[]> {
    try {

        const response = await makeAdminApiRequest<PublicationsResponse>(GET_PUBLICATIONS_QUERY, {});
        
        if (!response || !response.publications || !response.publications.edges) {
            return [];
        }

        const salesChannelIds = response.publications.edges.map(edge => edge.node.id);
        return salesChannelIds;

    } catch{
        return [];
    }
}

async function updateVariantWithRestAPI(variantData: { id: string; sku?: string; title?: string }) {
    const session = await getServerSession();
    if (!session?.user?.id) {
        throw new Error('User not authenticated');
    }

    const variantId = variantData.id.split('/').pop();
    if (!variantId) {
        throw new Error('Invalid variant ID');
    }

    const updatePayload: Record<string, string | undefined> = {};
    if (variantData.sku !== undefined) updatePayload.sku = variantData.sku;
    if (variantData.title !== undefined) updatePayload.title = variantData.title;

    const restApiUrl = `${process.env.NEXT_PUBLIC_SHOPIFY_STORE}/admin/api/${process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION}/variants/${variantId}.json`;
    const response = await fetch(restApiUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({
            variant: updatePayload
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`REST API error: ${response.status} - ${errorText}`);
    }
}

export async function getArtistProducts(params: GetArtistProductsParams = {}): Promise<PaginatedProductsResponse> {
  try {
    const vendorName = await getArtistVendorName();
    
    let shopifyQuery = `vendor:'${vendorName}'`;
    if (params.search && params.search.trim()) {
      shopifyQuery = `vendor:'${vendorName}' AND (title:*${params.search}* OR product_type:*${params.search}* OR tag:*${params.search}*)`;
    }
    
    const variables: GraphQLQueryVariables = {
      vendor: shopifyQuery,
      first: params.limit || 10,
    };
    
    if (params.cursor) {
      variables.after = params.cursor;
    }
    
    const response = await makeAdminApiRequest<GetArtistProductsResponse>(GET_ARTIST_PRODUCTS_QUERY, variables);
    
    if (!response || !response.products || !response.products.edges) {
      return {
        products: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null
        },
        totalItems: 0,
        currentPage: params.page || 1
      };
    }
    
    const products = response.products.edges.map(edge => edge.node);
    
    const currentPage = params.page || 1;
    const pageSize = params.limit || 10;
    let estimatedTotal = products.length;
    
    if (response.products.pageInfo.hasNextPage) {
      estimatedTotal = currentPage * pageSize + 1; 
    } else {
      estimatedTotal = (currentPage - 1) * pageSize + products.length;
    }
    
    return {
      products,
      pageInfo: response.products.pageInfo,
      totalItems: estimatedTotal,
      currentPage
    };

  } catch (error) {
    throw error; 
  }
}

export async function createArtistProduct(productData: CreateProductPayload): Promise<ArtistProduct> {
  const vendorName = await getArtistVendorName();

  const initialInput = {
    title: productData.title,
    descriptionHtml: productData.descriptionHtml,
    vendor: vendorName,
    status: productData.status,
    productType: productData.productType || '', 
    tags: productData.tags || [],
  };

  const createResponse = await makeAdminApiRequest<ProductCreateResponse>(CREATE_PRODUCT_MUTATION, {
    input: initialInput,
  });

  if (createResponse.productCreate.userErrors.length > 0) {
    throw new Error(createResponse.productCreate.userErrors.map((e: ShopifyUserError) => e.message).join(', '));
  }

  const product = createResponse.productCreate.product;

  if (productData.images && productData.images.length > 0) {
    const mediaPayload = productData.images.map(img => ({
        mediaContentType: "IMAGE",
        originalSource: img.originalSource
    }));

    await makeAdminApiRequest<ProductCreateMediaResponse>(ADD_PRODUCT_MEDIA_MUTATION, {
      productId: product.id,
      media: mediaPayload,
    });
  }

  const defaultVariantId = product.variants?.edges[0]?.node?.id;
  if (productData.price && defaultVariantId) {
      const variantsPayload = [{
          id: defaultVariantId,
          price: productData.price,
      }];
      
      await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(UPDATE_VARIANT_PRICE_MUTATION, {
          productId: product.id,
          variants: variantsPayload 
      });
  }
  
  try {
    const salesChannelIds = await getSalesChannelIds();

    if (salesChannelIds.length > 0) {
      const publicationsInput = salesChannelIds.map(id => ({
        publicationId: id
      }));



      await makeAdminApiRequest<PublishResponse>(PUBLISH_PRODUCT_MUTATION, {
        id: product.id,
        input: publicationsInput
      });
    }
  } catch {}
  
  return product as ArtistProduct;
}

export async function updateArtistProduct(productData: UpdateProductPayload): Promise<ArtistProduct> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variantData, price, ...productInput } = productData;
    
    const response = await makeAdminApiRequest<UpdateProductResponse>(UPDATE_PRODUCT_MUTATION, { 
        input: productInput 
    });

    if (response.productUpdate.userErrors.length > 0) {
        throw new Error(response.productUpdate.userErrors.map(e => e.message).join(', '));
    }

    if (variantData && variantData.id && variantData.price !== undefined) {
        const variantUpdatePayload = [{
            id: variantData.id,
            price: variantData.price.toString(),
        }];

        await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
            UPDATE_VARIANT_PRICE_MUTATION, 
            {
                productId: response.productUpdate.product.id,
                variants: variantUpdatePayload
            }
        );
    }

    if (
        variantData &&
        typeof variantData.id === 'string' &&
        (variantData.sku !== undefined || variantData.title !== undefined)
    ) {
        try {
            await updateVariantWithRestAPI({
                id: variantData.id,
                sku: variantData.sku,
                title: variantData.title
            });
        } catch {}
    }

    if (productData.images && productData.images.length > 0) {
        const mediaPayload = productData.images.map(img => ({
            mediaContentType: "IMAGE",
            originalSource: img.originalSource
        }));

        await makeAdminApiRequest<ProductCreateMediaResponse>(ADD_PRODUCT_MEDIA_MUTATION, {
            productId: response.productUpdate.product.id,
            media: mediaPayload,
        });
    }
    
    return response.productUpdate.product;
}

export async function deleteArtistProduct(id: string): Promise<string | null> {
    const input = { id };
    const response = await makeAdminApiRequest<DeleteProductResponse>(DELETE_PRODUCT_MUTATION, { input });

    if (response.productDelete.userErrors.length > 0) {
        throw new Error(response.productDelete.userErrors.map(e => e.message).join(', '));
    }

    return response.productDelete.deletedProductId;
}

export async function getArtistProductById(id: string): Promise<ArtistProduct | null> {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { artist: true },
    });

    const vendorName = user?.artist?.name; 

    if (!vendorName) {
      throw new Error('User is not an artist or vendor name is missing');
    }

    const response = await makeAdminApiRequest<{ product: ArtistProduct }>(GET_SINGLE_PRODUCT_QUERY, {
      id: id,
    });
    
    if (!response || !response.product) {
      return null;
    }
    
    if (response.product.vendor !== vendorName) {
      throw new Error('No tienes permisos para acceder a este producto');
    }
    
    return response.product;

  } catch (error) {
    throw error; 
  }
}