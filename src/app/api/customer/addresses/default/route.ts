import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/modules/customer/api';
import { getServerSession } from '@/modules/auth/server/server';

export async function PUT(request: NextRequest) {
 try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }
    
    const result = await api.setDefaultAddress(id);
    return NextResponse.json(
      { customer: result.data },
      { status: result.statusCode }
    );
  } catch (error) {
    if (error instanceof Error && error.message.includes('Validation errors')) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.message
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to set default address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}