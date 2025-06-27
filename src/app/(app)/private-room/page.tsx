'use client'

import { ShoppingBag, Star, Package, Sparkles } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import { Card } from '@/components/Card.tsx'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/modules/auth/context/useAuth'
import { useUserPrivateRoom } from '@/modules/rooms/hooks'
import { useProductsByIds } from '@/modules/shopify/hooks' // Nuevo hook

export default function PrivateRoomPage() {
  const { user } = useAuth()
  const userId = user?.id

  const {
    data: privateRoom,
    error: roomError,
    isLoading: isLoadingRoom,
  } = useUserPrivateRoom(userId ?? '')

  const productIds = privateRoom?.products?.map((p) => p.productId) || []
  const {
    data,
    error: productsError,
    isLoading: isLoadingProducts,
  } = useProductsByIds(productIds, {
    enabled: productIds.length > 0,
  })

  const products = data?.products || []
  const isLoading = isLoadingRoom || isLoadingProducts

  console.log('Private Room Data:', privateRoom)
  console.log('Product IDs being searched:', productIds)
  console.log('Products Data:', products)

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-6xl p-6'>
        <div className='space-y-6'>
          <div className='space-y-3'>
            <Skeleton className='h-8 w-80' />
            <Skeleton className='h-4 w-96' />
          </div>
          <Card.Loader />
        </div>
      </div>
    )
  }

  // Error State
  if (roomError || productsError) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <Alert variant='destructive'>
          <AlertDescription>
            Error loading your private room: {roomError?.message || productsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // No Room State
  if (!privateRoom) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='space-y-6 py-12 text-center'>
          <div className='mx-auto flex size-24 items-center justify-center rounded-full bg-muted'>
            <ShoppingBag className='size-12 text-muted-foreground' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>No Private Room Available</h1>
            <p className='text-muted-foreground'>
              You don't have a private room assigned yet. Contact us to set up your personalized
              shopping experience.
            </p>
          </div>
          <Button asChild>
            <Link href='/contact'>Contact Support</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='space-y-4 text-center'>
          <div className='mb-2 flex items-center justify-center gap-2'>
            <Sparkles className='size-6 text-primary' />
            <Badge variant='secondary' className='text-sm'>
              VIP Experience
            </Badge>
          </div>
          <h1 className='text-4xl font-bold tracking-tight'>{privateRoom.name}</h1>
          {privateRoom.description && (
            <p className='mx-auto max-w-2xl text-xl text-muted-foreground'>
              {privateRoom.description}
            </p>
          )}
          <div className='flex items-center justify-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <Package className='size-4' />
              <span>{products.length} Curated Products</span>
            </div>
            <div className='flex items-center gap-1'>
              <Star className='size-4' />
              <span>Exclusively for You</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Your Curated Collection</h2>
            {products.length > 0 && <Badge variant='outline'>{products.length} items</Badge>}
          </div>

          {privateRoom.products?.length === 0 ? (
            <ShadcnCard className='p-12'>
              <div className='space-y-4 text-center'>
                <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-muted'>
                  <Package className='size-8 text-muted-foreground' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>No Products Yet</h3>
                  <p className='text-muted-foreground'>
                    Your curated collection is being prepared. Check back soon for exclusive
                    products selected just for you.
                  </p>
                </div>
              </div>
            </ShadcnCard>
          ) : products.length === 0 && !isLoading ? (
            <ShadcnCard className='p-12'>
              <div className='space-y-4 text-center'>
                <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-yellow-100'>
                  <Package className='size-8 text-yellow-600' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>Products Not Found</h3>
                  <p className='text-muted-foreground'>
                    We found {privateRoom.products?.length} products in your room but couldn't load
                    their details. This might be a temporary issue.
                  </p>
                  <Button onClick={() => window.location.reload()} variant='outline' size='sm'>
                    Try Again
                  </Button>
                </div>
              </div>
            </ShadcnCard>
          ) : (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {products.map((product) => (
                <Card.Product product={product} key={product.id} />
              ))}
            </div>
          )}
        </div>

        {/* Call to Action */}
        {products.length > 0 && (
          <ShadcnCard className='border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 p-8'>
            <div className='space-y-4 text-center'>
              <h3 className='text-xl font-semibold'>Ready to Shop?</h3>
              <p className='text-muted-foreground'>
                Explore your curated collection and discover products selected exclusively for your
                preferences.
              </p>
              <div className='flex justify-center gap-3'>
                <Button size='lg'>
                  Start Shopping
                  <ShoppingBag className='ml-2 size-4' />
                </Button>
                <Button variant='outline' size='lg' asChild>
                  <Link href='/contact'>Need Help?</Link>
                </Button>
              </div>
            </div>
          </ShadcnCard>
        )}
      </div>
    </div>
  )
}
