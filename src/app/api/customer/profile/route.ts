import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { customerApi } from '@/modules/customer/api';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const result = await customerApi.getProfile(session.tokens.accessToken);
    return NextResponse.json(result.data, { status: result.statusCode });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
   try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const customerInput = await request.json();
    const result = await customerApi.updateProfile(customerInput, session.tokens.accessToken);
    return NextResponse.json(result.data, { status: result.statusCode });
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
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}