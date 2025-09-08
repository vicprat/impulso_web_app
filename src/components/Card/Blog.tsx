'use client'

import { CalendarDays, Clock, Eye, Tag, User } from 'lucide-react'
import Link from 'next/link'

import { Logo } from '@/components/Logo'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/config/routes'

import type { PostWithRelations } from '@/modules/blog/types'

const Badge = ({
  children,
  className = '',
  variant = 'default',
}: {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'category' | 'featured'
  className?: string
}) => {
  const baseClasses =
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors'
  const variants = {
    category: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
    default: 'bg-primary-container text-on-primary-container',
    featured: 'bg-primary text-on-primary shadow-elevation-1',
    secondary: 'bg-surface-container text-on-surface',
  }

  return <span className={`${baseClasses} ${variants[variant]} ${className}`}>{children}</span>
}

const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const getReadingTime = (content: string) => {
  const wordsPerMinute = 200
  const textContent = content.replace(/<[^>]*>/g, '')
  const wordCount = textContent.split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

interface Props {
  post: PostWithRelations
}

export const BlogCard: React.FC<Props> = ({ post }) => {
  const readingTime = getReadingTime(post.content)
  const authorName = `${post.author.firstName} ${post.author.lastName}`.trim()

  return (
    <Card
      className='focus-within:ring-primary/20 group relative overflow-hidden border bg-card shadow-elevation-1 transition-all duration-300 focus-within:shadow-elevation-4 focus-within:ring-2 hover:shadow-elevation-3'
      style={{}}
    >
      <div className='absolute inset-x-3 top-3 z-20 flex items-start justify-between'>
        {post.featured && (
          <Badge variant='featured' className='backdrop-blur-sm'>
            <Eye className='mr-1 size-3' />
            Destacado
          </Badge>
        )}
      </div>

      <Link
        href={ROUTES.PUBLIC.POSTS.DYNAMIC.DETAIL.PATH.replace(
          ':postType',
          post.postType.toLowerCase()
        ).replace(':slug', post.slug)}
        className='block focus:outline-none'
        aria-label={`Leer artículo: ${post.title}`}
      >
        <div className='relative aspect-[4/3] overflow-hidden bg-muted'>
          {post.featuredImageUrl ? (
            <>
              <img
                src={post.featuredImageUrl}
                alt={post.title}
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
              <p className='text-center text-xs text-muted-foreground'>Leer artículo completo</p>
            </div>
          </div>
        </div>
      </Link>

      <CardContent className='space-y-4 bg-card p-4'>
        {post.categories.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {post.categories.slice(0, 2).map((categoryRelation) => (
              <Badge key={categoryRelation.id} variant='category' className='text-xs'>
                {categoryRelation.category.name}
              </Badge>
            ))}
            {post.categories.length > 2 && (
              <Badge variant='secondary' className='text-xs'>
                +{post.categories.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className='space-y-2'>
          <Link
            href={ROUTES.PUBLIC.POSTS.DYNAMIC.DETAIL.PATH.replace(
              ':postType',
              post.postType.toLowerCase()
            ).replace(':slug', post.slug)}
            className='block'
          >
            <h3 className='line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors duration-200 hover:text-primary focus:text-primary focus:outline-none'>
              {post.title}
            </h3>
          </Link>

          {post.excerpt ? (
            <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
              {post.excerpt}
            </p>
          ) : (
            <p className='line-clamp-3 text-sm leading-relaxed text-muted-foreground'>
              {post.content.replace(/(<([^>]+)>)/gi, '').substring(0, 150)}...
            </p>
          )}
        </div>

        <div className='space-y-3 border-t border-border pt-3'>
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <div className='flex items-center gap-1'>
              <User className='size-3' />
              <span>{authorName}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='size-3' />
              <span>{readingTime} min</span>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <CalendarDays className='size-3' />
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            </div>

            {post.tags.length > 0 && (
              <div className='flex items-center gap-1'>
                <Tag className='size-3 text-muted-foreground' />
                <span className='text-xs text-muted-foreground'>
                  {post.tags.length} {post.tags.length === 1 ? 'tag' : 'tags'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
