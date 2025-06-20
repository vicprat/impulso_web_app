import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GET_PRODUCTS_BY_VENDOR_QUERY = `
  query getProductsByVendor($query: String!) {
    products(first: 100, query: $query) {
      edges {
        node {
          id
          title
          handle
          status
          vendor
          featuredImage {
            url
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        vendor
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// OBTENER los productos del artista
export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission('manage_own_products');
    const artist = await prisma.artist.findFirst({ where: { user: { id: session.user.id } } });

    if (!artist) {
      return NextResponse.json({ error: 'Perfil de artista no encontrado' }, { status: 403 });
    }

    const response = await makeAdminApiRequest(GET_PRODUCTS_BY_VENDOR_QUERY, {
      query: `vendor:'${artist.name}'`
    });

    return NextResponse.json(response.products.edges.map((edge: any) => edge.node));
  } catch (error) {
    console.error("Error fetching artist products:", error);
    return NextResponse.json({ error: 'Error al obtener los productos' }, { status: 500 });
  }
}

// CREAR un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const session = await requirePermission('manage_own_products');
    // CORRECCIÓN IMPORTANTE: Se busca el artista por `userId`, no por `id`.
    const artist = await prisma.artist.findFirst({ where: { user: { id: session.user.id } } });

    if (!artist) {
      return NextResponse.json({ error: 'Perfil de artista no encontrado' }, { status: 403 });
    }

    const productData = await request.json();
    
    // Añade el 'vendor' del artista automáticamente
    const input = {
        ...productData,
        vendor: artist.name,
    };

    const data = await makeAdminApiRequest(CREATE_PRODUCT_MUTATION, { input });
    
    if (data.productCreate?.userErrors?.length > 0) {
        return NextResponse.json({ errors: data.productCreate.userErrors }, { status: 400 });
    }

    return NextResponse.json(data.productCreate.product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ error: 'Error al crear el producto en Shopify' }, { status: 500 });
  }
}