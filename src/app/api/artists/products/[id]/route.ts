import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import { prisma } from '@/lib/prisma';
import type { Product } from '@/modules/shopify/types';

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
}

interface ShopifyProductNode {
    id: string;
    title: string;
    handle: string;
    tags: string[];
    descriptionHtml: string;
    productType: string;
    vendor: string;
    createdAt: string;
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    priceRangeV2: { 
        minVariantPrice: { amount: string; currencyCode: string };
        maxVariantPrice: { amount: string; currencyCode: string };
    };
    images: { edges: { node: ShopifyImageNode }[] };
    variants: { edges: { node: ShopifyVariantNode }[] };
}

function transformShopifyData(node: ShopifyProductNode): Omit<Product, 'description'> {
    const currencyCode = node.priceRangeV2.minVariantPrice.currencyCode;
    return {
        ...node,
        availableForSale: node.status === 'ACTIVE',
        priceRange: node.priceRangeV2,
        images: node.images.edges.map(edge => ({
            ...edge.node,
            width: edge.node.width ?? 0,
            height: edge.node.height ?? 0,
        })),
        variants: node.variants.edges.map(variantEdge => ({
            ...variantEdge.node,
            sku: variantEdge.node.sku ?? '',
            availableForSale: node.status === 'ACTIVE',
            price: { amount: variantEdge.node.price, currencyCode },
            compareAtPrice: variantEdge.node.compareAtPrice ? { amount: variantEdge.node.compareAtPrice, currencyCode } : null,
            selectedOptions: [], 
        })),
    };
}

const GET_PRODUCT_VENDOR_QUERY = `
  query getProductVendor($id: ID!) {
    product(id: $id) {
      vendor
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation productUpdate($input: ProductInput!, $media: [CreateMediaInput!]) {
    productUpdate(input: $input, media: $media) {
      product {
        id
        title
        handle
        tags
        descriptionHtml
        productType
        vendor
        createdAt
        status
        priceRangeV2 {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
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
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation productDelete($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

async function verifyOwnership(productId: string): Promise<boolean> {
    const session = await requirePermission('manage_own_products');

    const artist = await prisma.artist.findFirst({ where: { user: { id: session.user.id } } });
    if (!artist) return false;

    const response = await makeAdminApiRequest(GET_PRODUCT_VENDOR_QUERY, { id: productId }) as { product?: { vendor?: string } };
    return response.product?.vendor === artist.name;
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        // ✅ FIX 1: Await params antes de usarlo
        const params = await context.params;
        const productId = `gid://shopify/Product/${params.id}`;

        if (!await verifyOwnership(productId)) {
            return NextResponse.json({ error: 'No tienes permiso para editar este producto' }, { status: 403 });
        }
        
        const productData = await request.json();
        
        // ✅ FIX 2: Usar productUpdate con media en lugar de productAppendImages
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images, variants, ...coreProductData } = productData;

        // Preparar input para la mutación
        const input = {
            id: productId,
            ...coreProductData
        };

        // Preparar media si hay imágenes nuevas
        let media: { originalSource: string; alt: string; mediaContentType: 'IMAGE' }[] = [];
        if (images && images.length > 0) {
            type ImageInput = { originalSource?: string; src?: string; url?: string; alt?: string; altText?: string };
            media = images.map((image: ImageInput) => ({
                originalSource: image.originalSource || image.src || image.url || '',
                alt: image.alt || image.altText || '',
                mediaContentType: 'IMAGE'
            }));
        }

        // Ejecutar la mutación con ambos parámetros
        const updateResult = await makeAdminApiRequest(UPDATE_PRODUCT_MUTATION, { 
            input: input,
            media: media.length > 0 ? media : undefined 
        }) as {
            productUpdate?: {
                product?: ShopifyProductNode;
                userErrors?: { field?: string[]; message: string }[];
            }
        };

        const userErrors = updateResult.productUpdate?.userErrors;
        if (userErrors && userErrors.length > 0) {
            return NextResponse.json({ errors: userErrors }, { status: 400 });
        }

        if (!updateResult.productUpdate || !updateResult.productUpdate.product) {
            return NextResponse.json({ error: 'No se pudo actualizar el producto' }, { status: 500 });
        }
        const updatedProduct = updateResult.productUpdate.product;
        const standardizedProduct = transformShopifyData(updatedProduct);

        return NextResponse.json(standardizedProduct);

    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        // ✅ FIX 1: Await params antes de usarlo
        const params = await context.params;
        const productId = `gid://shopify/Product/${params.id}`;

        if (!await verifyOwnership(productId)) {
            return NextResponse.json({ error: 'No tienes permiso para eliminar este producto' }, { status: 403 });
        }

        const data = await makeAdminApiRequest(DELETE_PRODUCT_MUTATION, { input: { id: productId } }) as {
            productDelete?: {
                deletedProductId?: string;
                userErrors?: { field?: string[]; message: string }[];
            }
        };

        const userErrors = data.productDelete?.userErrors;
        if (userErrors && userErrors.length > 0) {
            return NextResponse.json({ errors: userErrors }, { status: 400 });
        }
        
        return NextResponse.json({ deletedId: data.productDelete?.deletedProductId ?? null });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
    }
}