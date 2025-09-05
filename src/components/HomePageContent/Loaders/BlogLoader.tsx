import { Sparkles } from 'lucide-react'

import { Landing } from '@/components/Landing'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/src/config/routes'

const BlogSkeleton = () => (
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

export function BlogLoader() {
  return (
    <Landing.Section
      icon={Sparkles}
      title='Últimos Artículos'
      subtitle='Explora las historias más recientes del mundo del arte y nuestra comunidad creativa'
      actionText='Ver todo el Blog'
      actionHref={ROUTES.PUBLIC.POSTS.DYNAMIC.MAIN.PATH.replace(':postType', 'blog')}
      paddingY='py-12 lg:py-16'
    >
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <BlogSkeleton />
          </div>
        ))}
      </div>
    </Landing.Section>
  )
}
