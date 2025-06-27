'use client';

import React from 'react';
import { useUserPrivateRoom } from '@/modules/rooms/hooks';
import { useProductsByIds } from '@/modules/shopify/hooks'; // Nuevo hook
import { Card as ShadcnCard } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingBag, Star, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/modules/auth/context/useAuth';
import { Card } from '@/components/Card.tsx';

export default function PrivateRoomPage() {
  const { user } = useAuth();
  const userId = user?.id;

  const { data: privateRoom, isLoading: isLoadingRoom, error: roomError } = useUserPrivateRoom(userId ?? '');

  const productIds = privateRoom?.products?.map(p => p.productId) || [];
  const { data, isLoading: isLoadingProducts, error: productsError } = useProductsByIds(
    productIds,
    {
      enabled: productIds.length > 0
    }
  );

  const products = data?.products || [];
  const isLoading = isLoadingRoom || isLoadingProducts;

  console.log('Private Room Data:', privateRoom);
  console.log('Product IDs being searched:', productIds);
  console.log('Products Data:', products);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-80" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Card.Loader />
        </div>
      </div>
    );
  }

  // Error State
  if (roomError || productsError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive">
          <AlertDescription>
            Error loading your private room: {roomError?.message || productsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No Room State
  if (!privateRoom) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center space-y-6 py-12">
          <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">No Private Room Available</h1>
            <p className="text-muted-foreground">
              You don't have a private room assigned yet. Contact us to set up your personalized shopping experience.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <Badge variant="secondary" className="text-sm">VIP Experience</Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {privateRoom.name}
          </h1>
          {privateRoom.description && (
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {privateRoom.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              <span>{products.length} Curated Products</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Exclusively for You</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Curated Collection</h2>
            {products.length > 0 && (
              <Badge variant="outline">{products.length} items</Badge>
            )}
          </div>

          {privateRoom.products?.length === 0 ? (
            <ShadcnCard className="p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">No Products Yet</h3>
                  <p className="text-muted-foreground">
                    Your curated collection is being prepared. Check back soon for exclusive products selected just for you.
                  </p>
                </div>
              </div>
            </ShadcnCard>
          ) : products.length === 0 && !isLoading ? (
            <ShadcnCard className="p-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-yellow-100 flex items-center justify-center">
                  <Package className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Products Not Found</h3>
                  <p className="text-muted-foreground">
                    We found {privateRoom.products?.length} products in your room but couldn't load their details. This might be a temporary issue.
                  </p>
                  <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                    Try Again
                  </Button>
                </div>
              </div>
            </ShadcnCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card.Product product={product} key={product.id} />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {products.length > 0 && (
          <ShadcnCard className="p-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Ready to Shop?</h3>
              <p className="text-muted-foreground">
                Explore your curated collection and discover products selected exclusively for your preferences.
              </p>
              <div className="flex justify-center gap-3">
                <Button size="lg">
                  Start Shopping
                  <ShoppingBag className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/contact">Need Help?</Link>
                </Button>
              </div>
            </div>
          </ShadcnCard>
        )}
      </div>
    </div>
  );
};