'use client'

import { Sparkles } from 'lucide-react'

import { BlogCard } from '@/components/Card/Blog'
import { Card, CardContent } from '@/components/ui/card'
import { type PaginatedResult, type PostWithRelations } from '@/modules/blog/types'

interface BlogSectionProps {
  blogData: PaginatedResult<PostWithRelations>
  isLoading?: boolean
}

export const BlogSkeleton = () => (
  <Card className='bg-card shadow-elevation-1'>
    <div className='aspect-[4/3] animate-pulse bg-muted' />
    <CardContent className='space-y-3 p-4'>
      <div className='flex gap-2'>
        <div className='h-5 w-16 animate-pulse rounded-full bg-muted' />
        <div className='h-5 w-20 animate-pulse rounded-full bg-muted' />
      </div>
      <div className='space-y-2'>
        <div className='h-6 w-full animate-pulse rounded bg-muted' />
        <div className='h-6 w-3/4 animate-pulse rounded bg-muted' />
      </div>
      <div className='space-y-2'>
        {[ 1, 2, 3 ].map((i) => (
          <div key={i} className='h-4 w-full animate-pulse rounded bg-muted' />
        ))}
      </div>
      <div className='flex justify-between pt-2'>
        <div className='h-4 w-24 animate-pulse rounded bg-muted' />
        <div className='h-4 w-16 animate-pulse rounded bg-muted' />
      </div>
    </CardContent>
  </Card>
)

export function Blog({ blogData, }: BlogSectionProps) {
  return (
    <>

      {blogData.items.length > 0 && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {blogData.items.map((post, index) => (
            <div
              key={post.id}
              className='animate-fade-in-up'
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <BlogCard post={post} />
            </div>
          ))}
        </div>
      )}

      {!blogData.items && (
        <div className='py-16 text-center animate-fade-in-up'>
          <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted animate-scale-in' style={{ animationDelay: '0.2s' }}>
            <Sparkles className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 text-xl font-semibold text-foreground animate-fade-in-up' style={{ animationDelay: '0.3s' }}>Próximamente</h3>
          <p className='text-muted-foreground animate-fade-in-up' style={{ animationDelay: '0.4s' }}>
            Estamos preparando contenido increíble para ti
          </p>
        </div>
      )}
    </>
  )
}
