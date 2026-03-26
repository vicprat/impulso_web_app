'use client'

import { Eye, FolderOpen, Layers } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES, replaceRouteParams } from '@/config/routes'

import type { Collection } from '@/services/collection/types'

interface Props {
  collection: Collection
}

const formatProductCount = (count: number) => {
  if (count === 0) return 'Sin productos'
  if (count === 1) return '1 producto'
  return `${count} productos`
}

export { CollectionCard as Collection }

export const CollectionCard: React.FC<Props> = ({ collection }) => {
  const displayImage = collection.productImage ?? collection.image

  return (
    <Card className='focus-within:ring-primary/20 group relative overflow-hidden border bg-card shadow-elevation-1 transition-all duration-300 focus-within:shadow-elevation-4 focus-within:ring-2 hover:shadow-elevation-3'>
      <div className='absolute inset-x-3 top-3 z-20 flex items-start justify-between'>
        <div className='inline-flex items-center gap-1.5 rounded-full bg-primary-container px-2.5 py-0.5 text-xs font-medium text-on-primary shadow-elevation-2 backdrop-blur-sm dark:text-white'>
          <FolderOpen className='size-3 dark:text-white' />
          <span>Colección</span>
        </div>
      </div>

      <Link
        href={replaceRouteParams(ROUTES.COLLECTIONS.DETAIL.PATH, {
          collection: collection.handle,
        })}
        className='block focus:outline-none'
        aria-label={`Ver colección: ${collection.title}`}
      >
        <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
          {displayImage ? (
            <>
              <img
                src={displayImage.url}
                alt={displayImage.altText ?? collection.title}
                className='size-full object-cover transition-all duration-500 group-focus-within:scale-105 group-hover:scale-110'
                loading='lazy'
                decoding='async'
                fetchPriority='low'
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </>
          ) : (
            <div className='group-hover:bg-muted/80 flex size-full items-center justify-center bg-muted transition-colors duration-300'>
              <Logo className='opacity-40' />
            </div>
          )}

          <div className='absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0'>
            <div className='bg-card/90 border-t border-border p-3 backdrop-blur-sm'>
              <p className='flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground'>
                <Eye className='size-3' />
                Ver colección
              </p>
            </div>
          </div>
        </div>
      </Link>

      <CardContent className='space-y-3 bg-card p-4'>
        <div className='space-y-2'>
          <Link
            href={replaceRouteParams(ROUTES.COLLECTIONS.DETAIL.PATH, {
              collection: collection.handle,
            })}
            className='block'
          >
            <h3 className='line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors duration-200 hover:text-primary focus:text-primary focus:outline-none'>
              {collection.title}
            </h3>
          </Link>
        </div>

        <div className='flex items-center justify-between border-t border-border pt-3'>
          <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
            <Layers className='size-3.5' />
            <span>{formatProductCount(collection.productsCount)}</span>
          </div>

          <Link
            href={replaceRouteParams(ROUTES.COLLECTIONS.DETAIL.PATH, {
              collection: collection.handle,
            })}
            className='hover:text-primary/80 text-xs font-medium text-primary transition-colors'
          >
            Explorar →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
