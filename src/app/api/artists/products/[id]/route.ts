import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GET_PRODUCT_VENDOR_QUERY = `
  query getProductVendor($id: ID!) {
    product(id: $id) {
      vendor
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation productUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
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

async function verifyOwnership(productId: string, userId: string): Promise<boolean> {
    // --- CORRECCIÓN AQUÍ ---
    const artist = await prisma.artist.findFirst({ where: { user: { id: userId } } });
    if (!artist) return false;

    const response = await makeAdminApiRequest(GET_PRODUCT_VENDOR_QUERY, { id: productId });
    return response.product?.vendor === artist.name;
}

// ACTUALIZAR un producto existente
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requirePermission('manage_own_products');
        const productId = `gid://shopify/Product/${params.id}`;

        if (!await verifyOwnership(productId, session.user.id)) {
            return NextResponse.json({ error: 'No tienes permiso para editar este producto' }, { status: 403 });
        }
        
        const productData = await request.json();
        const input = {
            id: productId,
            ...productData
        };

        const data = await makeAdminApiRequest(UPDATE_PRODUCT_MUTATION, { input });

        if (data.productUpdate?.userErrors?.length > 0) {
            return NextResponse.json({ errors: data.productUpdate.userErrors }, { status: 400 });
        }

        return NextResponse.json(data.productUpdate.product);
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ error: 'Error al actualizar el producto' }, { status: 500 });
    }
}

// ELIMINAR un producto
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await requirePermission('manage_own_products');
        const productId = `gid://shopify/Product/${params.id}`;

        if (!await verifyOwnership(productId, session.user.id)) {
            return NextResponse.json({ error: 'No tienes permiso para eliminar este producto' }, { status: 403 });
        }

        const data = await makeAdminApiRequest(DELETE_PRODUCT_MUTATION, { input: { id: productId } });

        if (data.productDelete?.userErrors?.length > 0) {
            return NextResponse.json({ errors: data.productDelete.userErrors }, { status: 400 });
        }
        
        return NextResponse.json({ deletedId: data.productDelete.deletedProductId });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
    }
}