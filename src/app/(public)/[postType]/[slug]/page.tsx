import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, MapPin, User } from 'lucide-react'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { Badge } from '@/components/ui/badge'
import { blogService } from '@/modules/blog/service'

import { BackButton } from '../components/BackButton'
import { FeaturedImage } from '../components/FeaturedImage'
import { ImageGallery } from '../components/ImageGallery'
import { Loader } from '../components/Loader'

export const dynamic = 'force-dynamic'
export default async function Page({
  params,
}: {
  params: Promise<{ postType: string; slug: string }>
}) {
  const { postType, slug } = await params

  const normalizedPostType = postType.toUpperCase() === 'EVENTS' ? 'EVENT' : postType.toUpperCase()

  const isValidPostType = normalizedPostType === 'BLOG' || normalizedPostType === 'EVENT'

  if (!isValidPostType) {
    notFound()
  }

  const post = await blogService.getPostBySlug(slug)

  if (!post || post.postType !== normalizedPostType) {
    notFound()
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'PPP', { locale: es })
    } catch {
      return 'Fecha no disponible'
    }
  }

  const getImageUrls = () => {
    const images = []
    if (post.featuredImageUrl) {
      images.push({ alt: post.title, url: post.featuredImageUrl })
    }
    if (post.additionalImages) {
      post.additionalImages.forEach((url, index) => {
        images.push({ alt: `Imagen ${index + 1}`, url })
      })
    }
    return images
  }

  const imageUrls = getImageUrls()

  return (
    <Suspense fallback={<Loader.Detail />}>
      <div className='min-h-screen'>
        <div>
          <div className='mx-auto max-w-4xl px-4 py-6'>
            <BackButton postType={postType} />

            <div className='space-y-4'>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='secondary' className='bg-primary/10 text-primary'>
                  {post.postType === 'BLOG' ? 'Artículo' : 'Evento'}
                </Badge>
                {post.featured && (
                  <Badge variant='outline' className='border-warning text-warning'>
                    Destacado
                  </Badge>
                )}
                {post.categories && post.categories.length > 0 && (
                  <Badge variant='outline'>{post.categories[0].category.name}</Badge>
                )}
              </div>

              <h1 className='text-3xl font-bold text-on-surface lg:text-4xl xl:text-5xl'>
                {post.title}
              </h1>

              <div className='flex flex-wrap items-center gap-4 text-sm text-on-surface-variant'>
                <div className='flex items-center gap-2'>
                  <User className='size-4' />
                  <span>
                    {post.author.firstName} {post.author.lastName}
                  </span>
                </div>

                <div className='flex items-center gap-2'>
                  <Calendar className='size-4' />
                  <span>
                    {post.publishedAt ? formatDate(post.publishedAt) : 'Fecha no disponible'}
                  </span>
                </div>

                {post.postType === 'EVENT' && post.date && (
                  <div className='flex items-center gap-2'>
                    <Calendar className='size-4' />
                    <span>Evento: {post.date ? formatDate(post.date) : 'Fecha no disponible'}</span>
                  </div>
                )}

                {post.postType === 'EVENT' && post.location && (
                  <div className='flex items-center gap-2'>
                    <MapPin className='size-4' />
                    <span>{post.location}</span>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className='mt-12'>
                    <h3 className='mb-4 text-xl font-semibold text-on-surface'>Etiquetas</h3>
                    <div className='flex flex-wrap gap-2'>
                      {post.tags.map((tag) => (
                        <Badge key={tag.tag.id} variant='outline'>
                          {tag.tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {post.excerpt && (
                <p className='text-lg text-on-surface-variant lg:text-xl'>{post.excerpt}</p>
              )}
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-4xl px-4 py-8'>
          {post.featuredImageUrl && (
            <FeaturedImage
              imageUrl={post.featuredImageUrl}
              title={post.title}
              imageUrls={imageUrls}
            />
          )}

          <div className='prose prose-lg max-w-none dark:prose-invert xl:prose-xl 2xl:prose-2xl [&>*]:text-on-surface-variant [&_h1]:text-on-surface [&_h2]:text-on-surface [&_h3]:text-on-surface [&_strong]:text-on-surface'>
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </div>

          {post.additionalImages && post.additionalImages.length > 0 && (
            <ImageGallery
              images={post.additionalImages}
              post={post}
              imageUrls={imageUrls}
              featuredImageExists={!!post.featuredImageUrl}
            />
          )}
        </div>
      </div>
    </Suspense>
  )
}
