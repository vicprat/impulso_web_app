import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import type { Product } from '@/modules/shopify/types';
import { prisma } from '@/lib/prisma';

const GET_ARTIST_PRODUCTS_DETAILS_QUERY = `
  query getArtistProducts($query: String!, $first: Int!) {
    products(query: $query, first: $first) {
      edges {
        node {
          id
          title
          handle
          tags
          description
          descriptionHtml
          productType
          vendor
          createdAt
          status
          priceRangeV2 { 
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
                price
                compareAtPrice
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

const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productCreate(input: $input, media: $media) {
      product {
        id
        title
        handle
        tags
        description
        descriptionHtml
        productType
        vendor
        createdAt
        status
        priceRangeV2 {
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
              price
              compareAtPrice
              sku
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_VARIANT_PRICE_MUTATION = `
  mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
    productVariantsBulkUpdate(productId: $productId, variants: $variants) {
      product {
        id
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
              sku
            }
          }
        }
      }
      productVariants {
        id
        price
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const ADD_PRODUCT_MEDIA_MUTATION = `
  mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
    productCreateMedia(productId: $productId, media: $media) {
      media {
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
      }
      mediaUserErrors {
        field
        message
      }
      userErrors {
        field
        message
      }
    }
  }
`;

interface ShopifyImageNode {
    id: string;
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
}

interface ShopifyVariantNode {
    id: string;
    title: string;
    price: string;
    compareAtPrice: string | null;
    sku: string | null;
    selectedOptions: { name: string; value: string }[];
}

interface ShopifyProductNode {
    id: string;
    title: string;
    handle: string;
    tags: string[];
    description: string;
    descriptionHtml: string;
    productType: string;
    vendor: string;
    createdAt: string;
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    priceRange?: {
        minVariantPrice: { amount: string; currencyCode: string };
        maxVariantPrice: { amount: string; currencyCode: string };
    };
    priceRangeV2?: {
        minVariantPrice: { amount: string; currencyCode: string };
        maxVariantPrice: { amount: string; currencyCode: string };
    };
    images?: { edges: { node: ShopifyImageNode }[] };
    variants?: { edges: { node: ShopifyVariantNode }[] };
}

interface CreateMediaInput {
    originalSource: string;
    alt: string;
    mediaContentType: 'IMAGE';
}

interface ProductInput {
    title: string;
    descriptionHtml: string;
    status: 'ACTIVE' | 'DRAFT';
    price: string;
    images?: { mediaContentType: string; originalSource: string }[];
}

type ShopifyProductsResponse = {
    products: {
        edges: { node: ShopifyProductNode }[];
    };
};

type ProductCreateResponse = {
    productCreate: {
        product: ShopifyProductNode | null;
        userErrors: { field: string[]; message: string }[];
    };
};

type MediaCreateResponse = {
    productCreateMedia: {
        media: unknown[];
        mediaUserErrors: { field: string[]; message: string }[];
        userErrors: { field: string[]; message: string }[];
    };
};

type VariantsUpdateResponse = {
    productVariantsBulkUpdate: {
        product: ShopifyProductNode | null;
        userErrors: { field: string[]; message: string }[];
    };
};

function transformShopifyData(node: ShopifyProductNode): Product {
    const priceRange = node.priceRange || node.priceRangeV2;
    const currencyCode = priceRange?.minVariantPrice?.currencyCode || 'MXN';
    
    const processedImages = node.images?.edges ? node.images.edges.map(edge => ({
        ...edge.node,
        width: edge.node.width ?? 0,
        height: edge.node.height ?? 0,
    })) : [];

    const processedVariants = node.variants?.edges ? node.variants.edges.map(variantEdge => ({
        ...variantEdge.node,
        availableForSale: node.status === 'ACTIVE', 
        price: {
            amount: variantEdge.node.price || '0.00',
            currencyCode: currencyCode,
        },
        compareAtPrice: variantEdge.node.compareAtPrice
            ? {
                amount: variantEdge.node.compareAtPrice,
                currencyCode: currencyCode,
            }
            : null,
        selectedOptions: variantEdge.node.selectedOptions || [],
        sku: variantEdge.node.sku ?? '', 
    })) : [];

    const transformedProduct = {
        ...node,
        availableForSale: node.status === 'ACTIVE', 
        priceRange: priceRange || {
            minVariantPrice: { amount: '0.00', currencyCode },
            maxVariantPrice: { amount: '0.00', currencyCode }
        },
        images: processedImages,
        variants: processedVariants,
    };

    return transformedProduct;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};

export async function GET() {
    try {
        const session = await requirePermission('manage_own_products');
        const artist = await prisma.artist.findFirst({ where: { user: { id: session.user.id } } });

        if (!artist) {
            return NextResponse.json({ error: 'Perfil de artista no encontrado.' }, { status: 404 });
        }

        const query = `vendor:'${artist.name}'`;
        
        const data = await makeAdminApiRequest(GET_ARTIST_PRODUCTS_DETAILS_QUERY, {
            query: query,
            first: 50
        }) as ShopifyProductsResponse;

        const productEdges = data?.products?.edges;
        if (!productEdges) {
            console.error("Respuesta inesperada de Shopify:", data);
            return NextResponse.json([]); 
        }

        if (productEdges.length === 0) {
            return NextResponse.json([]);
        }
        
        const standardizedProducts = productEdges.map((edge: { node: ShopifyProductNode }) => transformShopifyData(edge.node));

        return NextResponse.json(standardizedProducts);

    } catch (error: unknown) {
        const err = error as Error;
        if (err.message.includes('No tienes permiso')) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
        }
        console.error("Error fetching artist products:", error);
        return NextResponse.json({ error: 'Error interno del servidor al obtener los productos.' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await requirePermission('manage_own_products');
        const artist = await prisma.artist.findFirst({ where: { user: { id: session.user.id } } });

        if (!artist) {
            return NextResponse.json({ error: 'Perfil de artista no encontrado para asignar el producto.' }, { status: 404 });
        }

        let rawBody: string;
        try {
            rawBody = await request.text();
        } catch {
            return NextResponse.json({ error: 'Error leyendo el cuerpo del request.' }, { status: 400 });
        }

        let body: ProductInput;
        try {
            if (!rawBody.trim()) {
                return NextResponse.json({ error: 'Request body está vacío.' }, { status: 400 });
            }
            
            body = JSON.parse(rawBody) as ProductInput;
        } catch (parseError) {
            return NextResponse.json({ 
                error: 'JSON inválido en el request body.',
                details: parseError instanceof Error ? parseError.message : 'Error desconocido'
            }, { status: 400 });
        }

        const validatedMedia: CreateMediaInput[] = [];
        if (body.images && body.images.length > 0) {
            for (let i = 0; i < body.images.length; i++) {
                const image = body.images[i];
                
                if (!image.originalSource || !image.originalSource.startsWith('http')) {
                    continue;
                }

                await delay(2000);

                await validateImageUrl(image.originalSource);
                
                validatedMedia.push({
                    originalSource: image.originalSource,
                    alt: `Imagen ${i + 1}`,
                    mediaContentType: 'IMAGE'
                });
            }
        }

        const input = {
            title: body.title,
            descriptionHtml: body.descriptionHtml, 
            status: body.status, 
            vendor: artist.name, 
            productType: 'Pintura', 
        };

        const productData = await makeAdminApiRequest(CREATE_PRODUCT_MUTATION, { 
            input: input,
        }) as ProductCreateResponse;

        const userErrors = productData.productCreate?.userErrors;
        if (userErrors && userErrors.length > 0) {
            return NextResponse.json({ errors: userErrors }, { status: 400 });
        }

        let newProduct = productData.productCreate?.product;
        if (!newProduct) {
             return NextResponse.json({ error: 'Error al procesar la respuesta de Shopify.' }, { status: 502 });
        }

        if (validatedMedia.length > 0 && newProduct) {
            try {
                const mediaResult = await makeAdminApiRequest(ADD_PRODUCT_MEDIA_MUTATION, {
                    productId: newProduct.id,
                    media: validatedMedia
                }) as MediaCreateResponse;

                const mediaErrors = mediaResult.productCreateMedia?.mediaUserErrors || [];
                const generalErrors = mediaResult.productCreateMedia?.userErrors || [];
                
                if (mediaErrors.length > 0 || generalErrors.length > 0) {
                    console.error('Error agregando imágenes:', [...mediaErrors, ...generalErrors]);
                }

                if (mediaResult.productCreateMedia?.media && mediaResult.productCreateMedia.media.length > 0) {
                    const updatedProductData = await makeAdminApiRequest(GET_ARTIST_PRODUCTS_DETAILS_QUERY, {
                        query: `id:${newProduct.id}`,
                        first: 1
                    }) as ShopifyProductsResponse;
                    
                    if (updatedProductData?.products?.edges?.[0]?.node) {
                        newProduct = updatedProductData.products.edges[0].node;
                    }
                }

            } catch (mediaError) {
                console.error('Error agregando imágenes:', mediaError);
            }
        }

        if (body.price && newProduct?.variants?.edges && newProduct.variants.edges.length > 0) {
            const defaultVariantId = newProduct.variants.edges[0].node.id;
            
            const variants = [{
                id: defaultVariantId,
                price: body.price
            }];

            try {
                const variantsData = await makeAdminApiRequest(UPDATE_VARIANT_PRICE_MUTATION, {
                    productId: newProduct.id,
                    variants: variants
                }) as VariantsUpdateResponse;

                const variantErrors = variantsData.productVariantsBulkUpdate?.userErrors;
                if (variantErrors && variantErrors.length > 0) {
                    console.error('Error actualizando precio de variante:', variantErrors);
                }

                const finalProduct = variantsData.productVariantsBulkUpdate?.product || newProduct;
                if (finalProduct) {
                    const standardizedProduct = transformShopifyData(finalProduct);
                    return NextResponse.json(standardizedProduct, { status: 201 });
                }

            } catch (variantError) {
                console.error('Error estableciendo precio de variante:', variantError);
                if (newProduct) {
                    const standardizedProduct = transformShopifyData(newProduct);
                    return NextResponse.json({
                        ...standardizedProduct,
                        warning: 'Producto creado pero no se pudo establecer el precio'
                    }, { status: 201 });
                }
            }
        }

        if (newProduct) {
            const standardizedProduct = transformShopifyData(newProduct);
            return NextResponse.json(standardizedProduct, { status: 201 });
        }

        return NextResponse.json({ error: 'Error procesando el producto.' }, { status: 500 });

    } catch (error: unknown) {
        const err = error as Error;
        if (err.message.includes('No tienes permiso')) {
            return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
        }
        console.error("Error creating product:", error);
        return NextResponse.json({ error: 'Error interno del servidor al crear el producto.' }, { status: 500 });
    }
}