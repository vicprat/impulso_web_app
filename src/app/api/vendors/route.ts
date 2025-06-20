import { NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'; // Importa tu nuevo helper

// Define la consulta GraphQL para obtener los vendors
const GET_PRODUCT_VENDORS_QUERY = `
  query getProductVendors {
    shop {
      productVendors(first: 250) {
        edges {
          node
        }
      }
    }
  }
`;

// Define el tipo de la respuesta de Shopify para mayor claridad
type ShopifyVendorsResponse = {
  shop: {
    productVendors: {
      edges: { node: string }[];
    };
  };
};

/**
 * @description Obtiene una lista única de todos los vendors de productos desde Shopify.
 * Requiere permisos de administrador.
 */
export async function GET() {
  try {
    await requirePermission('manage_users'); // Protegemos el endpoint

    const response = await makeAdminApiRequest<ShopifyVendorsResponse>(
      GET_PRODUCT_VENDORS_QUERY
    );

    // Extraemos y aplanamos la lista de vendors
    const vendors = response.shop.productVendors.edges.map(edge => edge.node);

    return NextResponse.json(vendors);

  } catch (error) {
    console.error("Error al obtener los vendors de Shopify:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}