import { NextResponse } from 'next/server';
import { getServerSession } from '@/modules/auth/server/server';
import { makeStorefrontRequest } from '@/lib/shopify';
import {  CartLineInput } from '@/modules/cart/types';
import { handleGraphQLErrors } from '@/lib/graphql';
import { getOrCreateCartForUser } from '@/modules/cart/server';

export async function POST(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const lines = (await request.json()) as CartLineInput[];

        if (!lines || !Array.isArray(lines) || lines.length === 0) {
            return NextResponse.json({ error: 'Cart lines are required' }, { status: 400 });
        }

        const cart = await getOrCreateCartForUser(session.user.id, session.user.email);

        const { cartLinesAdd } = await makeStorefrontRequest(
            `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
              cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart { ...Cart }
                userErrors { field message code }
              }
            }
            fragment Cart on Cart {
              id
              totalQuantity
              cost { totalAmount { amount currencyCode } }
              lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title product { title handle } image { url altText } } } cost { totalAmount { amount currencyCode } } } } }
            }`,
            { cartId: cart.id, lines }
        );
        
        handleGraphQLErrors(cartLinesAdd.userErrors);

        return NextResponse.json(cartLinesAdd.cart);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to add items to cart', details: (error as Error).message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const { lineIds } = await request.json();
        if (!lineIds || !Array.isArray(lineIds) || lineIds.length === 0) {
            return NextResponse.json({ error: 'Line IDs are required' }, { status: 400 });
        }

        const cart = await getOrCreateCartForUser(session.user.id, session.user.email);

        const { cartLinesRemove } = await makeStorefrontRequest(
            `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
              cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
                cart { ...Cart }
                userErrors { field message code }
              }
            }
            fragment Cart on Cart {
              id
              totalQuantity
              cost { totalAmount { amount currencyCode } }
              lines(first: 100) { edges { node { id quantity merchandise { ... on ProductVariant { id title product { title handle } image { url altText } } } cost { totalAmount { amount currencyCode } } } } }
            }`,
            { cartId: cart.id, lineIds }
        );

        handleGraphQLErrors(cartLinesRemove.userErrors);

        return NextResponse.json(cartLinesRemove.cart);

    } catch (error) {
        return NextResponse.json({ error: 'Failed to remove items from cart', details: (error as Error).message }, { status: 500 });
    }
}