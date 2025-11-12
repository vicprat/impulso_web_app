'use client'

import { ArrowLeft, Package, Sparkles, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Card } from '@/components/Card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card as ShadcnCard } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePrivateRoom, usePrivateRoomProducts } from '@/modules/rooms/hooks'
import { ROUTES } from '@/src/config/routes'

import type { Product } from '@/src/modules/shopify/types'

export default function PrivateRoomDetailPage() {
  const params = useParams()
  const roomId = params.id as string

  const {
    data: privateRoom,
    error: roomError,
    isLoading: isLoadingRoom,
  } = usePrivateRoom(roomId)

  const productIds = privateRoom?.products.map((p) => p.productId) ?? []
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
  } = usePrivateRoomProducts(productIds)

  const products = productsData?.products ?? []
  const isLoading = isLoadingRoom || isLoadingProducts

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-7xl p-6'>
        <div className='space-y-6'>
          <Skeleton className='h-8 w-32' />
          <div className='space-y-3'>
            <Skeleton className='h-10 w-80' />
            <Skeleton className='h-4 w-96' />
          </div>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className='h-96' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (roomError || productsError) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <Alert variant='destructive'>
          <AlertDescription>
            Error loading private room: {roomError?.message ?? productsError?.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!privateRoom) {
    return (
      <div className='container mx-auto max-w-4xl p-6'>
        <div className='space-y-6 py-12 text-center'>
          <div className='mx-auto flex size-24 items-center justify-center rounded-full bg-muted'>
            <Package className='size-12 text-muted-foreground' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl font-bold'>Private Room Not Found</h1>
            <p className='text-muted-foreground'>
              The private room you're looking for doesn't exist or you don't have access to it.
            </p>
          </div>
          <Button asChild>
            <Link href={ROUTES.ADMIN.PRIVATE_ROOMS.ACCESS.PATH}>Back to Private Rooms</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto max-w-7xl p-6'>
      <div className='space-y-8'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link href={ROUTES.ADMIN.PRIVATE_ROOMS.ACCESS.PATH}>
              <ArrowLeft className='mr-2 size-4' />
              Volver
            </Link>
          </Button>
        </div>

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
              <span>{products.length} Productos Seleccionados</span>
            </div>
            <div className='flex items-center gap-1'>
              <Star className='size-4' />
              <span>Exclusivamente para Ti</span>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Tu Colección Personalizada</h2>
            {products.length > 0 && <Badge variant='outline'>{products.length} items</Badge>}
          </div>

          {privateRoom.products.length === 0 ? (
            <ShadcnCard className='p-12'>
              <div className='space-y-4 text-center'>
                <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-muted'>
                  <Package className='size-8 text-muted-foreground' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>No hay productos aún</h3>
                  <p className='text-muted-foreground'>
                    Tu colección personalizada está siendo preparada. Vuelve pronto para ver los
                    productos exclusivos seleccionados para ti.
                  </p>
                </div>
              </div>
            </ShadcnCard>
          ) : products.length === 0 ? (
            <ShadcnCard className='p-12'>
              <div className='space-y-4 text-center'>
                <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-yellow-100'>
                  <Package className='size-8 text-yellow-600' />
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold'>Productos no encontrados</h3>
                  <p className='text-muted-foreground'>
                    Encontramos {privateRoom.products.length} productos en tu sala pero no pudimos
                    cargar sus detalles. Esto podría ser un problema temporal.
                  </p>
                  <Button onClick={() => window.location.reload()} variant='outline' size='sm'>
                    Intentar de Nuevo
                  </Button>
                </div>
              </div>
            </ShadcnCard>
          ) : (
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {products.map((product: Product) => (
                <Card.Product product={product} key={product.id} />
              ))}
            </div>
          )}
        </div>

        {products.length > 0 && (
          <ShadcnCard className='border-primary/20 p-8'>
            <div className='space-y-4 text-center'>
              <h3 className='text-xl font-semibold'>¿Listo para comprar?</h3>
              <p className='text-muted-foreground'>
                Explora tu colección personalizada y descubre productos seleccionados exclusivamente
                para tus preferencias.
              </p>
              <Button variant='outline' asChild>
                <Link href='/contact'>¿Necesitas ayuda?</Link>
              </Button>
            </div>
          </ShadcnCard>
        )}
      </div>
    </div>
  )
}

