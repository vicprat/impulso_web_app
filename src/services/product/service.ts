import { Product } from '@/models/Product';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/modules/auth/server/server';
import {
  GET_PRODUCTS_QUERY,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  GET_SINGLE_PRODUCT_QUERY,
  GET_PUBLICATIONS_QUERY,
  PUBLISH_PRODUCT_MUTATION,
  INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
  GET_INVENTORY_ITEM_QUERY,
  PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
  PRODUCT_CREATE_MEDIA_MUTATION
} from './queries';
import {
  GetProductsParams,
  PaginatedProductsResponse,
  CreateProductPayload,
  UpdateProductPayload,
  ShopifyProductData,
  ProductMutationResponse,
  DeleteMutationResponse,
  GetProductsApiResponse,
  GetPublicationsApiResponse,
  ShopifyUserError,
  GetInventoryItemResponse,
  InventorySetOnHandQuantitiesResponse,
  ProductCreateMediaResponse
} from './types';
import { AuthSession } from '@/modules/auth/service';

type ValidatedSession = NonNullable<AuthSession>;

type ProductVariantsBulkUpdateResponse = {
  productVariantsBulkUpdate: {
    productVariants: { id: string }[];
    userErrors: ShopifyUserError[];
  };
};

let primaryLocationId: string | null = null;

function validateSession(session: AuthSession): asserts session is ValidatedSession {
    if (!session?.user?.id) {
        throw new Error("Sesión no válida o usuario no autenticado.");
    }
}

async function getPrimaryLocationId(): Promise<string> {
    if (primaryLocationId) return primaryLocationId;

    const response = await makeAdminApiRequest<{ locations: { edges: { node: { id: string } }[] } }>(
        `query { locations(first: 1, query: "is_active:true") { edges { node { id name } } } }`, {}
    );

    const locationId = response.locations?.edges[0]?.node?.id;
    if (!locationId) {
        throw new Error('No se pudo encontrar una ubicación de Shopify para gestionar el inventario.');
    }
    
    primaryLocationId = locationId;
    return primaryLocationId;
}

async function getProducts(params: GetProductsParams, session: AuthSession): Promise<PaginatedProductsResponse> {
    validateSession(session);
    
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { artist: true, roles: { include: { role: true } } }
    });
    if (!user) throw new Error("Usuario no encontrado.");

    const userRoles = user.roles.map(r => r.role.name);
    let shopifyQuery = "";

    if (userRoles.includes('admin') || userRoles.includes('manager')) {
        if (params.search?.trim()) {
            shopifyQuery = `(title:*${params.search}* OR product_type:*${params.search}* OR vendor:*${params.search}*)`;
        }
    } else if (userRoles.includes('artist')) {
        const vendorName = user.artist?.name;
        if (!vendorName) throw new Error("Perfil de artista incompleto.");
        shopifyQuery = `vendor:'${vendorName}'`;
        if (params.search?.trim()) {
            shopifyQuery += ` AND (title:*${params.search}* OR product_type:*${params.search}*)`;
        }
    } else {
        throw new Error("Permiso denegado para ver productos.");
    }

    const variables = {
        query: shopifyQuery,
        first: params.limit ? parseInt(String(params.limit), 10) : 10,
        after: params.cursor,
    };

    const response = await makeAdminApiRequest<GetProductsApiResponse>(GET_PRODUCTS_QUERY, variables);

    const locationId = await getPrimaryLocationId();
    const products = response.products.edges.map(edge => new Product(edge.node, locationId));

    return { products, pageInfo: response.products.pageInfo };
}

async function getProductById(id: string, session: AuthSession): Promise<Product | null> {
    validateSession(session);
    
    const response = await makeAdminApiRequest<{ product: ShopifyProductData | null }>(GET_SINGLE_PRODUCT_QUERY, { id });
    if (!response.product) return null;

    const user = await prisma.user.findUnique({ 
        where: { id: session.user.id }, 
        include: { artist: true, roles: { include: { role: true } } } 
    });
    const userRoles = user?.roles.map(r => r.role.name) || [];

    if (!userRoles.includes('admin') && !userRoles.includes('manager') && userRoles.includes('artist')) {
        if (response.product.vendor !== user?.artist?.name) {
            throw new Error("Permiso denegado para ver este producto.");
        }
    }

    const locationId = await getPrimaryLocationId();
    return new Product(response.product, locationId);
}


async function getProductsFromRequest(request: Request, session: AuthSession): Promise<PaginatedProductsResponse> {
    const { searchParams } = new URL(request.url);
    
    const params: GetProductsParams = {
        search: searchParams.get('search') || undefined,
        cursor: searchParams.get('cursor') || undefined,
        limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    if (params.limit && (params.limit < 1 || params.limit > 100)) {
        throw new Error('El límite debe estar entre 1 y 100');
    }

    return getProducts(params, session);
}


async function createProduct(payload: CreateProductPayload, session: AuthSession): Promise<Product> {
    validateSession(session);
    await requirePermission('manage_own_products');
    
    const user = await prisma.user.findUnique({ 
        where: { id: session.user.id }, 
        include: { artist: true, roles: { include: { role: true } } }
    });
    
    if (user?.roles.some(r => r.role.name === 'artist') && !user.roles.some(r => r.role.name === 'admin')) {
        payload.vendor = user?.artist?.name;
    }
    
    if (!payload.vendor) {
        throw new Error("El campo 'vendor' es requerido.");
    }

    const createInput = {
        title: payload.title,
        descriptionHtml: payload.description ? `<p>${payload.description}</p>` : '',
        vendor: payload.vendor,
        productType: payload.productType || '',
        tags: payload.tags || [],
        status: payload.status,
    };

    const response = await makeAdminApiRequest<ProductMutationResponse<'productCreate'>>(
        CREATE_PRODUCT_MUTATION, 
        { input: createInput }
    );
    
    if (response.productCreate.userErrors.length > 0) {
        throw new Error(response.productCreate.userErrors.map(e => e.message).join(', '));
    }

    const newProductData = response.productCreate.product;

    if (payload.images && payload.images.length > 0) {
        try {
            await addImagesToProduct(newProductData.id, payload.images);
        } catch (imageError) {
            console.error('Error al agregar imágenes al producto:', imageError);
        }
    }

    if (payload.price && parseFloat(payload.price) > 0) {
        const defaultVariant = newProductData.variants?.edges[0]?.node;
        if (defaultVariant) {
            try {
                const variantUpdatePayload = {
                    productId: newProductData.id,
                    variants: [{
                        id: defaultVariant.id,
                        price: payload.price
                    }]
                };
                
                await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
                    PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
                    variantUpdatePayload
                );
            } catch (variantError) {
                console.error('Error al actualizar el precio del producto:', variantError);
            }
        }
    }

    if (payload.inventoryQuantity && payload.inventoryQuantity > 0) {
        const defaultVariant = newProductData.variants?.edges[0]?.node;
        if (defaultVariant) {
            try {
                const locationId = await getPrimaryLocationId();
                
                const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
                    GET_INVENTORY_ITEM_QUERY,
                    { variantId: defaultVariant.id }
                );
                
                if (inventoryItemResponse.productVariant?.inventoryItem?.id) {
                    const inventoryItemId = inventoryItemResponse.productVariant.inventoryItem.id;
                    
                    const inventoryUpdatePayload = {
                        input: {
                            reason: "correction",
                            setQuantities: [{
                                inventoryItemId: inventoryItemId,
                                locationId: locationId,
                                quantity: payload.inventoryQuantity
                            }]
                        }
                    };
                    
                    await makeAdminApiRequest<InventorySetOnHandQuantitiesResponse>(
                        INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
                        inventoryUpdatePayload
                    );
                }
            } catch (inventoryError) {
                console.error('Error al actualizar la cantidad de inventario del producto:', inventoryError);
            }
        }
    }

    try {
        const publications = await makeAdminApiRequest<GetPublicationsApiResponse>(GET_PUBLICATIONS_QUERY, {});
        const publicationInputs = publications.publications.edges.map(edge => ({ publicationId: edge.node.id }));
        
        if (publicationInputs.length > 0) {
            await makeAdminApiRequest(PUBLISH_PRODUCT_MUTATION, { id: newProductData.id, input: publicationInputs });
        }
    } catch (publishError) {
        console.error('Error al publicar el producto:', publishError);
    }

    const finalProduct = await getProductById(newProductData.id, session);
    if (!finalProduct) {
        throw new Error('Error al obtener el producto creado');
    }

    return finalProduct;
}

async function addImagesToProduct(productId: string, images: { mediaContentType: 'IMAGE'; originalSource: string }[]) {
    const mediaInput = images.map(img => ({
        mediaContentType: img.mediaContentType,
        originalSource: img.originalSource
    }));

    const response = await makeAdminApiRequest<ProductCreateMediaResponse>(PRODUCT_CREATE_MEDIA_MUTATION, {
        productId: productId,
        media: mediaInput
    });

    if (response.productCreateMedia?.mediaUserErrors?.length > 0) {
        throw new Error(response.productCreateMedia.mediaUserErrors.map((e: ShopifyUserError) => e.message).join(', '));
    }

    if (response.productCreateMedia?.userErrors?.length > 0) {
        throw new Error(response.productCreateMedia.userErrors.map((e: ShopifyUserError) => e.message).join(', '));
    }

    return response.productCreateMedia.media;
}

async function createProductFromRequest(request: Request, session: AuthSession): Promise<Product> {
    const body = await request.json();


    if (!body.title?.trim()) {
        throw new Error('El título es requerido');
    }

    if (body.price && isNaN(parseFloat(body.price))) {
        throw new Error('El precio debe ser un número válido');
    }

    if (body.inventoryQuantity && (!Number.isInteger(body.inventoryQuantity) || body.inventoryQuantity < 0)) {
        throw new Error('La cantidad de inventario debe ser un número entero positivo');
    }

    const payload: CreateProductPayload = {
        title: body.title.trim(),
        description: body.description?.trim() || '',
        productType: body.productType?.trim() || '',
        vendor: body.vendor?.trim() || undefined, 
        status: body.status || 'DRAFT',
        tags: Array.isArray(body.tags) ? body.tags.filter((tag: string) => tag?.trim()) : [],
        price: body.price || '0',
        inventoryQuantity: body.inventoryQuantity || 1,
        details: body.details || {},
        images: Array.isArray(body.images) ? body.images : undefined,
    };

    if (payload.status && !['ACTIVE', 'DRAFT', 'ARCHIVED'].includes(payload.status)) {
        throw new Error('El status debe ser ACTIVE, DRAFT o ARCHIVED');
    }

    if (payload.images && payload.images.some(img => !img.originalSource || !img.mediaContentType)) {
        throw new Error('Las imágenes deben tener originalSource y mediaContentType válidos');
    }

    return createProduct(payload, session);
}

async function updateProduct(payload: UpdateProductPayload, session: AuthSession): Promise<Product> {
    validateSession(session);
    await requirePermission('manage_own_products');
    
    const existingProduct = await getProductById(payload.id, session);
    if (!existingProduct) throw new Error("Producto no encontrado o no tienes permiso para editarlo.");

    existingProduct.update(payload);
    
    const { updatePayload } = existingProduct.toShopifyInput();
    const { variants, ...productUpdateInput } = updatePayload.input;

    const productUpdateResponse = await makeAdminApiRequest<ProductMutationResponse<'productUpdate'>>(
        UPDATE_PRODUCT_MUTATION, 
        { input: productUpdateInput }
    );

    if (productUpdateResponse.productUpdate.userErrors.length > 0) {
        throw new Error(productUpdateResponse.productUpdate.userErrors.map(e => e.message).join(', '));
    }

    if (variants && variants.length > 0) {
        const variant = variants[0];
        
        if (payload.price) {
            const priceUpdatePayload = {
                productId: existingProduct.id,
                variants: [{
                    id: variant.id,
                    price: variant.price
                }]
            };

            const variantUpdateResponse = await makeAdminApiRequest<ProductVariantsBulkUpdateResponse>(
                PRODUCT_VARIANTS_BULK_UPDATE_MUTATION,
                priceUpdatePayload
            );

            if (variantUpdateResponse.productVariantsBulkUpdate.userErrors.length > 0) {
                throw new Error(variantUpdateResponse.productVariantsBulkUpdate.userErrors.map(e => e.message).join(', '));
            }
        }

        if (payload.inventoryQuantity !== undefined) {
            try {
                const inventoryItemResponse = await makeAdminApiRequest<GetInventoryItemResponse>(
                    GET_INVENTORY_ITEM_QUERY,
                    { variantId: variant.id }
                );

                if (inventoryItemResponse.productVariant?.inventoryItem?.id) {
                    const inventoryItemId = inventoryItemResponse.productVariant.inventoryItem.id;
                    const locationId = await getPrimaryLocationId();

                    const inventoryUpdatePayload = {
                        input: {
                            reason: "correction",
                            setQuantities: [{
                                inventoryItemId: inventoryItemId,
                                locationId: locationId,
                                quantity: payload.inventoryQuantity
                            }]
                        }
                    };

                    const inventoryResponse = await makeAdminApiRequest<InventorySetOnHandQuantitiesResponse>(
                        INVENTORY_SET_ON_HAND_QUANTITIES_MUTATION,
                        inventoryUpdatePayload
                    );

                    if (inventoryResponse.inventorySetOnHandQuantities.userErrors.length > 0) {
                        throw new Error(inventoryResponse.inventorySetOnHandQuantities.userErrors.map(e => e.message).join(', '));
                    }
                }
            } catch (inventoryError) {
                console.error('Error al actualizar la cantidad de inventario del producto:', inventoryError);
            }
        }
    }

    const locationId = await getPrimaryLocationId();
    return new Product(productUpdateResponse.productUpdate.product, locationId);
}

async function deleteProduct(id: string, session: AuthSession): Promise<string> {
    validateSession(session);
    await requirePermission('manage_own_products');
    
    const productToDelete = await getProductById(id, session);
    if (!productToDelete) throw new Error("Producto no encontrado o no tienes permiso para borrarlo.");

    const response = await makeAdminApiRequest<DeleteMutationResponse>(DELETE_PRODUCT_MUTATION, { input: { id } });

    if (response.productDelete.userErrors.length > 0) {
        throw new Error(response.productDelete.userErrors.map(e => e.message).join(', '));
    }
    return response.productDelete.deletedProductId!;
}

export const productService = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductsFromRequest,
    createProductFromRequest,
};