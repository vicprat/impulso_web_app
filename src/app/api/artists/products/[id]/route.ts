import { NextResponse } from 'next/server';
import {
  getArtistProductById,
  updateArtistProduct,
  deleteArtistProduct,
} from '@/modules/user/artists/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params antes de usar
    const gid = `gid://shopify/Product/${id}`; 
    const product = await getArtistProductById(gid);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(product);
  } catch (error: unknown) {
    console.error('Error getting product:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params antes de usar
    const body = await request.json();
    const gid = `gid://shopify/Product/${id}`; 
    
    const updatedProduct = await updateArtistProduct({ id: gid, ...body });
    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    console.error('Error updating product:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params antes de usar
    const gid = `gid://shopify/Product/${id}`; 
    await deleteArtistProduct(gid);
    return NextResponse.json({ message: 'Producto eliminado exitosamente' });
  } catch (error: unknown) {
    console.error('Error deleting product:', error);
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}