import { NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { getOrCreateCartForUser } from '@/modules/cart/server';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    if (!session.user.id || !session.user.email) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 500 });
    }

    const cart = await getOrCreateCartForUser(session.user.id, session.user.email);
    return NextResponse.json(cart);

  } catch (error) {
    return NextResponse.json({ error: 'Failed to get cart', details: (error as Error).message }, { status: 500 });
  }
}