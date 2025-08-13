/* eslint-disable @next/next/no-img-element */
'use client'

import { ArrowLeft, CalendarDays, Clock, Eye, Share2, Tag, User } from 'lucide-react'
import { notFound, useParams, useRouter } from 'next/navigation'

import { usePostBySlug } from '@/modules/blog/hooks'

import type { PostWithRelations } from '@/modules/blog/types'

// Componente Badge siguiendo el sistema de diseño
const Badge = ({ children, className = '', variant = 'default' }: {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'category'
  className?: string
}) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors'
  const variants = {
    category: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
    default: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-surface-container text-on-surface'
  }

  return (
    <span className={`${baseClasses} ${variants[ variant ]} ${className}`}>
      {children}
    </span>
  )
}

// Componente Button siguiendo el sistema de diseño
const Button = ({ children, className = '', variant = 'primary', ...props }: {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
  onClick?: () => void
}) => {
  const baseClasses = 'inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20'
  const variants = {
    ghost: 'text-on-surface hover:bg-surface-container',
    outline: 'border border-outline text-on-surface hover:bg-surface-container',
    primary: 'bg-primary text-on-primary hover:bg-primary/90 shadow-elevation-1 hover:shadow-elevation-2'
  }

  return (
    <button className={`${baseClasses} ${variants[ variant ]} ${className}`} {...props}>
      {children}
    </button>
  )
}

// Función para formatear fechas
const formatDate = (dateInput: string | Date) => {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date)
}

// Función para calcular tiempo de lectura estimado
const getReadingTime = (content: string) => {
  const wordsPerMinute = 200
  const textContent = content.replace(/<[^>]*>/g, '') // Remove HTML tags
  const wordCount = textContent.split(/\s+/).length
  const readingTime = Math.ceil(wordCount / wordsPerMinute)
  return readingTime
}

// Componente principal
export default function PublicBlogDetailPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = String(params.slug)
  const { data, error, isLoading } = usePostBySlug(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-6 rounded-lg bg-card p-6 shadow-elevation-1">
            <div className="mb-4 flex items-center gap-3">
              <div className="size-8 animate-pulse rounded-md bg-muted"></div>
              <div className="h-4 w-20 animate-pulse rounded bg-muted"></div>
            </div>
            <div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-muted"></div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
              <div className="h-4 w-32 animate-pulse rounded bg-muted"></div>
            </div>
          </div>

          {/* Image Skeleton */}
          <div className="mb-6 h-64 w-full animate-pulse rounded-lg bg-muted md:h-96"></div>

          {/* Content Skeleton */}
          <div className="rounded-lg bg-card p-6 shadow-elevation-1">
            <div className="space-y-4">
              {[ 1, 2, 3, 4, 5 ].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-4/5 animate-pulse rounded bg-muted"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    notFound()
  }

  const post: PostWithRelations = data
  const readingTime = getReadingTime(post.content)

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header con navegación */}
        <div className="mb-6 rounded-lg bg-card p-6 shadow-elevation-1">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              Volver
            </Button>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-sm">
                <Share2 className="size-4" />
                Compartir
              </Button>
            </div>
          </div>

          {/* Título principal */}
          <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-4xl">
            {post.title}
          </h1>

          {/* Excerpt si existe */}
          {post.excerpt && (
            <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
          )}

          {/* Metadatos del post */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="size-4" />
              <span>{post.author.firstName} {post.author.lastName}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4" />
              <span>{formatDate(post.publishedAt ?? post.createdAt)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span>{readingTime} min de lectura</span>
            </div>
          </div>

          {/* Categorías */}
          {post.categories.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-2">
                {post.categories.map((categoryRelation) => (
                  <Badge
                    key={categoryRelation.id}
                    variant="category"
                    className="hover:shadow-elevation-1"
                  >
                    {categoryRelation.category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Badge de destacado */}
          {post.featured && (
            <div className="mt-4">
              <Badge className="bg-primary text-on-primary">
                <Eye className="mr-1 size-3" />
                Artículo destacado
              </Badge>
            </div>
          )}
        </div>

        {/* Imagen destacada */}
        {post.featuredImageUrl && (
          <div className="mb-6">
            <div >
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="h-64 w-full rounded-md object-cover md:h-96"
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <article className="rounded-lg p-6 shadow-elevation-1 md:p-8">
          <div
            className="prose prose-lg max-w-none
                       dark:prose-invert prose-headings:font-semibold
                       prose-headings:text-foreground prose-p:mb-4 prose-p:leading-relaxed
                       prose-p:text-on-surface prose-a:text-primary
                       prose-a:no-underline hover:prose-a:underline
                       prose-blockquote:rounded-r-md prose-blockquote:border-l-4 prose-blockquote:border-primary
                       prose-blockquote:bg-surface-container prose-blockquote:p-4 
                       prose-strong:font-semibold prose-strong:text-foreground prose-em:italic
                       prose-em:text-on-surface prose-code:rounded
                       prose-code:bg-surface-container
                       prose-code:px-2 prose-code:py-1 prose-pre:rounded-lg prose-pre:bg-surface-container
                       prose-pre:p-4 prose-ol:text-on-surface prose-ul:text-on-surface
                       prose-li:mb-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Imágenes adicionales */}
        {post.additionalImages.length > 0 && (
          <div className="mt-6">
            <div className="rounded-lg bg-card p-6 shadow-elevation-1">
              <h3 className="mb-4 text-lg font-semibold text-foreground">Galería adicional</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {post.additionalImages.map((imageUrl, index) => (
                  <div key={index} className="overflow-hidden rounded-lg bg-muted">
                    <img
                      src={imageUrl}
                      alt={`Imagen adicional ${index + 1}`}
                      className="h-48 w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags si existen */}
        {post.tags.length > 0 && (
          <div className="mt-6">
            <div className="rounded-lg bg-card p-6 shadow-elevation-1">
              <h3 className="mb-3 text-lg font-semibold text-foreground">Etiquetas</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tagRelation) => (
                  <Badge key={tagRelation.id} variant="secondary">
                    #{tagRelation.tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer del artículo */}
        <div className="mt-8 rounded-lg bg-card p-6 shadow-elevation-1">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary">
                <User className="size-6 text-on-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {post.author.firstName} {post.author.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{post.author.email}</p>
              </div>
            </div>

            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Ver más artículos
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}