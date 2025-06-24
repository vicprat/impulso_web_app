import { NextResponse } from 'next/server';
import { getArtistProducts, createArtistProduct } from '@/modules/user/artists/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const search = searchParams.get('search');
    const cursor = searchParams.get('cursor');
    
    if (!page && !limit && !search && !cursor) {
      const result = await getArtistProducts({ limit: 50 });
      return NextResponse.json({ products: result.products });
    }
    
    const result = await getArtistProducts({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : 10,
      search: search || undefined,
      cursor: cursor || undefined
    });
    
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = "Error al obtener los productos del artista.";
    let errorMessage = "";
    let stack: string | undefined = undefined;

    if (error instanceof Error) {
      errorMessage = error.message;
      stack = process.env.NODE_ENV === 'development' ? error.stack : undefined;
    } else {
      errorMessage = String(error);
    }

    return NextResponse.json(
      { 
        message,
        error: errorMessage,
        stack
      }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = await createArtistProduct(body);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: unknown) {
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    return NextResponse.json({ error: errorMessage }, { status: 400 }); 
  }
}