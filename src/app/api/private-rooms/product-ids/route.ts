
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const privateRoomProducts = await prisma.privateRoomProduct.findMany({
      select: {
        productId: true,
      },
    });

    const productIds = privateRoomProducts.map(p => p.productId);

    return NextResponse.json(productIds);
  } catch (error) {
    console.error('Error fetching private room product IDs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
