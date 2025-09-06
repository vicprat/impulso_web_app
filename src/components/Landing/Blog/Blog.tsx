import { Sparkles } from 'lucide-react'

import { BlogCard } from '@/components/Card/Blog'
import { type PaginatedResult, type PostWithRelations } from '@/modules/blog/types'

interface Props {
  data: PaginatedResult<PostWithRelations>
}



export const Blog: React.FC<Props> = ({ data }) => {
  return (
    <>

      {data.items.length > 0 && (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {data.items.map((post, index) => (
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

      {!data.items && (
        <div className='animate-fade-in-up py-16 text-center'>
          <div className='mx-auto mb-6 flex size-24 animate-scale-in items-center justify-center rounded-full bg-muted' style={{ animationDelay: '0.2s' }}>
            <Sparkles className='size-8 text-muted-foreground' />
          </div>
          <h3 className='mb-2 animate-fade-in-up text-xl font-semibold text-foreground' style={{ animationDelay: '0.3s' }}>Próximamente</h3>
          <p className='animate-fade-in-up text-muted-foreground' style={{ animationDelay: '0.4s' }}>
            Estamos preparando contenido increíble para ti
          </p>
        </div>
      )}
    </>
  )
}
