import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { customerApi } from '@/modules/customer/api';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const first = parseInt(searchParams.get('first') || '10');
    const after = searchParams.get('after');

    const result = await customerApi.getOrders(
      { first, after }, 
      session.tokens.accessToken
    );
    
    return NextResponse.json(
      {
        orders: result.data.orders,
        pageInfo: result.data.pageInfo,
      },
      { status: result.statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}