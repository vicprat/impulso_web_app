import { NextRequest, NextResponse } from 'next/server';
import { customerApi } from '@/modules/customer/api';
import { getServerSession } from '@/modules/auth/server/server';

export async function GET() {
   try {
      const session = await getServerSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

    const result = await customerApi.getAddresses(session.tokens.accessToken);
    return NextResponse.json(
      { addresses: result.data },
      { status: result.statusCode }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch addresses',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
 try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const addressInput = await request.json();
    const result = await customerApi.createAddress(addressInput, session.tokens.accessToken);
    return NextResponse.json(
      { address: result.data },
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
        error: 'Failed to create address',
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

    const { id, address } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const result = await customerApi.updateAddress(id, address, session.tokens.accessToken);
    return NextResponse.json(
      { address: result.data },
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
        error: 'Failed to update address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const result = await customerApi.deleteAddress(id, session.tokens.accessToken);
    return NextResponse.json(
      { deletedId: result.data.deletedId },
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
        error: 'Failed to delete address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}