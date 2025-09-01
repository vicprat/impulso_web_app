/* eslint-disable @next/next/no-img-element */
'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, MapPin, User, X, ZoomIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { usePostBySlug } from '@/modules/blog/hooks'

// Componente de Modal con Embla Carousel
const ImageModal = ({
  images,
  initialIndex,
  isOpen,
  onClose,
  title
}: {
  images: { url: string; alt: string }[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  title: string
}) => {
  const [ emblaRef, emblaApi ] = useEmblaCarousel({
    loop: true,
    startIndex: initialIndex
  })
  const [ selectedIndex, setSelectedIndex ] = useState(initialIndex)

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [ emblaApi ])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [ emblaApi ])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [ emblaApi ])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [ emblaApi, onSelect ])

  // Actualizar índice cuando cambie initialIndex
  useEffect(() => {
    if (emblaApi && isOpen) {
      emblaApi.scrollTo(initialIndex)
      setSelectedIndex(initialIndex)
    }
  }, [ emblaApi, initialIndex, isOpen ])

  // Manejar teclas del teclado
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === 'ArrowLeft') {
        scrollPrev()
      } else if (event.key === 'ArrowRight') {
        scrollNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [ isOpen, onClose, scrollPrev, scrollNext ])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 bg-black/95 backdrop-blur-sm'>
      {/* Botón de cerrar */}
      <Button
        variant='outline'
        size='sm'
        onClick={onClose}
        className='absolute right-6 top-6 z-20 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20'
      >
        <X className='size-4' />
      </Button>

      {/* Embla Carousel para el modal */}
      <div className='flex h-full items-center justify-center p-4'>
        <div className='relative w-full max-w-6xl'>
          <div className='overflow-hidden' ref={emblaRef}>
            <div className='flex'>
              {images.map((image, index) => (
                <div key={index} className='min-w-0 flex-[0_0_100%]'>
                  <div className='flex h-[80vh] items-center justify-center'>
                    <img
                      src={image.url}
                      alt={image.alt}
                      className='max-h-full max-w-full object-contain'
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de navegación */}
          {images.length > 1 && (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={scrollPrev}
                className='absolute left-4 top-1/2 -translate-y-1/2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20'
              >
                <ChevronLeft className='size-4' />
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={scrollNext}
                className='absolute right-4 top-1/2 -translate-y-1/2 border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20'
              >
                <ChevronRight className='size-4' />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Información de la imagen en la parte inferior */}
      <div className='absolute bottom-6 left-1/2 -translate-x-1/2'>
        <div className='flex flex-col items-center gap-4'>
          {/* Título */}
          <h3 className='max-w-lg text-center text-lg font-semibold text-white/90'>
            {images[ selectedIndex ]?.alt || title}
          </h3>

          {/* Indicador de progreso */}
          {images.length > 1 && (
            <div className='flex items-center gap-2'>
              <span className='rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm'>
                {selectedIndex + 1} de {images.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}



// Componente de Loading Skeleton
const PostDetailSkeleton = () => {
  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-4xl px-4 py-8'>
        <div className='mb-6'>
          <div className='h-10 w-24 animate-pulse rounded-md bg-muted' />
        </div>

        <div className='mb-8'>
          <div className='mb-4 flex gap-2'>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className='h-6 w-20 animate-pulse rounded-full bg-muted' />
            ))}
          </div>
          <div className='mb-4 h-12 w-full animate-pulse rounded bg-muted' />
          <div className='mb-4 h-6 w-3/4 animate-pulse rounded bg-muted' />
          <div className='flex items-center gap-4'>
            <div className='h-5 w-32 animate-pulse rounded bg-muted' />
            <div className='h-5 w-24 animate-pulse rounded bg-muted' />
          </div>
        </div>

        <div className='mb-8'>
          <div className='aspect-[16/9] w-full animate-pulse rounded-lg bg-muted' />
        </div>

        <div className='space-y-4'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <div className='h-4 w-full animate-pulse rounded bg-muted' />
              <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente principal de la página
export function PostDetailPageClient({
  postType,
  slug
}: {
  postType: string
  slug: string
}) {
  const router = useRouter()
  const [ shouldRedirect, setShouldRedirect ] = useState(false)
  const [ selectedImageIndex, setSelectedImageIndex ] = useState<number | null>(null)

  // Validar que el tipo de post sea válido
  const validPostType = postType.toUpperCase()
  const isValidPostType = validPostType === 'BLOG' || validPostType === 'EVENT'

  // Obtener el post - los hooks deben llamarse siempre
  const { data: post, error, isLoading } = usePostBySlug(slug)

  // Redirigir si el tipo no es válido
  useEffect(() => {
    if (!isValidPostType) {
      setShouldRedirect(true)
    }
  }, [ isValidPostType ])

  // Redirigir si el post no es del tipo correcto
  useEffect(() => {
    if (post) {
      const actualPost = Array.isArray(post) ? post[ 0 ] : post

      if (actualPost && actualPost.postType !== validPostType) {
        setShouldRedirect(true)
      }
    }
  }, [ post, validPostType ])

  // Efecto para manejar la redirección
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/')
    }
  }, [ shouldRedirect, router ])

  if (!isValidPostType || shouldRedirect) {
    return null
  }

  if (isLoading) {
    return <PostDetailSkeleton />
  }

  // Si post es un array, tomar el primer elemento
  const actualPost = Array.isArray(post) ? post[ 0 ] : post

  if (error || !actualPost) {
    return (
      <div className='min-h-screen bg-surface'>
        <div className='mx-auto max-w-4xl px-4 py-8'>
          <Button variant='outline' onClick={() => router.back()} className='mb-6'>
            <ArrowLeft className='mr-2 size-4' />
            Volver
          </Button>
          <Card className='bg-card p-12 text-center shadow-elevation-1'>
            <h1 className='mb-4 text-2xl font-bold text-foreground'>Post no encontrado</h1>
            <p className='text-muted-foreground'>
              El artículo que buscas no existe o ha sido eliminado.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    router.push(`/${postType.toLowerCase()}`)
  }

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'PPP', { locale: es })
    } catch {
      return 'Fecha no disponible'
    }
  }

  // Preparar todas las imágenes para el modal (destacada + adicionales)
  const allImages = [
    ...(actualPost.featuredImageUrl
      ? [ { alt: actualPost.title, url: actualPost.featuredImageUrl } ]
      : []
    ),
    ...(actualPost.additionalImages?.map((url: string, index: number) => ({
      alt: `${actualPost.title} - Imagen ${index + 1 + (actualPost.featuredImageUrl ? 1 : 0)}`,
      url
    })) || [])
  ]

  const openImageModal = (index: number) => {
    // Si tenemos imagen destacada, ajustar índice para las adicionales
    const adjustedIndex = actualPost.featuredImageUrl ? index + 1 : index
    setSelectedImageIndex(adjustedIndex)
  }

  const openFeaturedImageModal = () => {
    setSelectedImageIndex(0)
  }

  const closeImageModal = () => {
    setSelectedImageIndex(null)
  }

  // Preparar imágenes adicionales para la galería
  const additionalImages = actualPost.additionalImages?.map((url: string, index: number) => ({
    alt: `${actualPost.title} - Imagen ${index + 1 + (actualPost.featuredImageUrl ? 1 : 0)}`,
    url
  })) || []

  return (
    <div className='min-h-screen bg-surface'>
      <div className='mx-auto max-w-4xl px-4 py-8'>
        {/* Botón de regreso */}
        <div className='mb-8'>
          <Button variant='outline' onClick={handleBack} className='mb-6 transition-all hover:translate-x-1'>
            <ArrowLeft className='mr-2 size-4' />
            Volver a {postType === 'BLOG' ? 'Blog' : 'Eventos'}
          </Button>
        </div>

        {/* Header del post mejorado */}
        <header className='mb-10'>
          {/* Badges */}
          <div className='mb-6 flex flex-wrap items-center gap-3'>
            {actualPost.featured && (
              <Badge variant='outline' className='border-yellow-500 text-yellow-600'>
                ⭐ Destacado
              </Badge>
            )}
          </div>

          {/* Título */}
          <h1 className='mb-6 text-4xl font-bold leading-tight text-foreground lg:text-5xl'>
            {actualPost.title}
          </h1>

          {/* Resumen */}
          {actualPost.excerpt && (
            <p className='mb-8 text-xl leading-relaxed text-muted-foreground lg:text-2xl'>
              {actualPost.excerpt}
            </p>
          )}

          {/* Metadatos mejorados */}
          <div className='bg-muted/30 rounded-lg p-4'>
            <div className='flex flex-wrap items-center gap-6 text-sm text-muted-foreground'>
              <div className='flex items-center gap-2'>
                <User className='size-4 text-primary' />
                <span className='font-medium'>
                  {actualPost.author.firstName} {actualPost.author.lastName}
                </span>
              </div>

              {actualPost.publishedAt && (
                <div className='flex items-center gap-2'>
                  <Calendar className='size-4 text-primary' />
                  <span>Publicado {formatDate(actualPost.publishedAt)}</span>
                </div>
              )}

              {/* Campos específicos para eventos */}
              {actualPost.postType === 'EVENT' && actualPost.date && (
                <div className='flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1 dark:bg-blue-950'>
                  <Calendar className='size-4 text-blue-600' />
                  <span className='font-medium text-blue-700 dark:text-blue-300'>
                    Evento: {formatDate(actualPost.date)}
                  </span>
                </div>
              )}

              {actualPost.postType === 'EVENT' && actualPost.location && (
                <div className='flex items-center gap-2 rounded-md bg-green-50 px-3 py-1 dark:bg-green-950'>
                  <MapPin className='size-4 text-green-600' />
                  <span className='font-medium text-green-700 dark:text-green-300'>
                    {actualPost.location}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Imagen destacada mejorada */}
        {actualPost.featuredImageUrl && (
          <div className='mb-10'>
            <div
              className='hover:shadow-3xl group relative aspect-[16/9] cursor-pointer overflow-hidden rounded-xl shadow-2xl transition-all'
              onClick={openFeaturedImageModal}
            >
              <img
                src={actualPost.featuredImageUrl}
                alt={actualPost.title}
                className='size-full object-cover transition-transform duration-500 group-hover:scale-105'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />

              {/* Indicador de interactividad */}
              <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                <div className='rounded-full bg-white/90 p-4 shadow-lg transition-transform group-hover:scale-110'>
                  <ZoomIn className='size-6 text-gray-800' />
                </div>
              </div>

              {/* Badge indicativo */}
              <div className='absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                <div className='rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm'>
                  <span className='text-xs font-medium text-white'>Click para ampliar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer con taxonomías mejorado */}
        {(actualPost.categories.length > 0 || actualPost.tags.length > 0) && (
          <Card className='mb-10 bg-card shadow-elevation-1'>
            <CardContent className='p-6'>
              <div className='space-y-6'>
                {/* Categorías */}
                {actualPost.categories.length > 0 && (
                  <div>
                    <h3 className='mb-3 flex items-center text-lg font-semibold text-foreground'>
                      <div className='mr-2 size-2 rounded-full bg-primary'></div>
                      Categorías
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {actualPost.categories.map(({ category }: { category: { id: string; name: string } }) => (
                        <Badge key={category.id} variant='outline' className='transition-colors hover:bg-primary hover:text-primary-foreground'>
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {actualPost.tags.length > 0 && (
                  <div>
                    <h3 className='mb-3 flex items-center text-lg font-semibold text-foreground'>
                      <div className='mr-2 size-2 rounded-full bg-secondary'></div>
                      Tags
                    </h3>
                    <div className='flex flex-wrap gap-2'>
                      {actualPost.tags.map(({ tag }: { tag: { id: string; name: string } }) => (
                        <Badge key={tag.id} variant='secondary' className='hover:bg-secondary/80 transition-colors'>
                          #{tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenido */}
        <Card className='mb-10 bg-card shadow-elevation-1'>
          <CardContent className='p-8 lg:p-12'>
            <div
              className='prose-blockquote:bg-muted/50 prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary prose-blockquote:border-l-primary prose-blockquote:pl-6 prose-strong:text-foreground'
              dangerouslySetInnerHTML={{ __html: actualPost.content }}
            />
          </CardContent>
        </Card>

        {/* Galería de imágenes con bento grid mejorado */}
        {actualPost.additionalImages && actualPost.additionalImages.length > 0 && (
          <div className='relative'>
            {/* Decoración de fondo */}
            <div className='from-primary/5 to-secondary/5 absolute -inset-4 rounded-3xl bg-gradient-to-br via-transparent blur-3xl' />

            <Card className='bg-card/80 relative border-0 shadow-2xl backdrop-blur-sm'>
              <CardContent className='p-0'>
                {/* Header de la galería rediseñado */}
                <div className='from-primary/10 via-primary/5 to-secondary/10 relative overflow-hidden rounded-t-lg bg-gradient-to-r p-8'>
                  <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]' />

                  <div className='relative flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='flex items-center gap-3'>
                        <div className='relative'>
                          <div className='size-12 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5'>
                            <div className='flex size-full items-center justify-center rounded-full bg-card'>
                              <div className='size-6 rounded-sm bg-gradient-to-br from-primary to-secondary' />
                            </div>
                          </div>
                          <div className='from-primary/20 to-secondary/20 absolute -inset-1 rounded-full bg-gradient-to-br blur-md' />
                        </div>

                        <div>
                          <h3 className='text-2xl font-bold text-foreground lg:text-3xl'>
                            Galería de imágenes
                          </h3>
                          <p className='text-sm text-muted-foreground'>
                            Explora la colección visual completa
                          </p>
                        </div>
                      </div>


                    </div>
                  </div>

                  {/* Elementos decorativos */}
                  <div className='from-primary/10 absolute -right-20 -top-20 size-40 rounded-full bg-gradient-to-br to-transparent blur-3xl' />
                  <div className='from-secondary/10 absolute -bottom-20 -left-20 size-40 rounded-full bg-gradient-to-br to-transparent blur-3xl' />
                </div>

                {/* Bento Grid Responsive Mejorado */}
                <div className='p-4 sm:p-6 lg:p-8'>
                  {/* Una sola imagen */}
                  {actualPost.additionalImages.length === 1 && (
                    <div
                      className='hover:shadow-3xl group relative mx-auto max-w-3xl cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-2xl transition-all duration-500 dark:from-slate-800 dark:to-slate-900'
                      onClick={() => openImageModal(0)}
                    >
                      <div className='aspect-[16/10] md:aspect-[21/9]'>
                        <img
                          src={actualPost.additionalImages[ 0 ]}
                          alt={`${actualPost.title} - Imagen 1`}
                          className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                        />
                      </div>

                      {/* Overlay gradiente */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                      {/* Efecto de brillo */}
                      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                      {/* Icono centrado */}
                      <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                        <div className='rounded-full bg-white/95 p-5 shadow-2xl transition-all duration-300 group-hover:scale-110'>
                          <ZoomIn className='size-7 text-slate-700' />
                        </div>
                      </div>

                      {/* Badge inferior */}
                      <div className='absolute bottom-4 left-4 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                        <div className='rounded-lg bg-black/80 px-3 py-2 backdrop-blur-sm'>
                          <span className='text-sm font-medium text-white'>Click para ampliar</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dos imágenes */}
                  {actualPost.additionalImages.length === 2 && (
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6'>
                      {actualPost.additionalImages.map((imageUrl: string, index: number) => (
                        <div
                          key={index}
                          className='group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900'
                          onClick={() => openImageModal(index)}
                        >
                          <div className='aspect-[4/3] md:aspect-square'>
                            <img
                              src={imageUrl}
                              alt={`${actualPost.title} - Imagen ${index + 1}`}
                              className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                            />
                          </div>

                          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-full bg-white/95 p-4 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                              <ZoomIn className='size-6 text-slate-700' />
                            </div>
                          </div>

                          <div className='absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white'>
                              {index + 1}/{actualPost.additionalImages.length}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tres imágenes */}
                  {actualPost.additionalImages.length === 3 && (
                    <div className='grid grid-cols-2 grid-rows-3 gap-3 md:grid-cols-3 md:grid-rows-2 md:gap-4 lg:gap-6'>
                      {/* Imagen principal - mobile: ocupa toda la primera fila, desktop: 2x2 */}
                      <div
                        className='group relative col-span-2 row-span-2 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900 md:row-span-2'
                        onClick={() => openImageModal(0)}
                      >
                        <img
                          src={actualPost.additionalImages[ 0 ]}
                          alt={`${actualPost.title} - Imagen 1`}
                          className='size-full object-cover transition-all duration-700 group-hover:scale-105'
                        />

                        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                          <div className='rounded-full bg-white/95 p-5 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                            <ZoomIn className='size-7 text-slate-700' />
                          </div>
                        </div>

                        <div className='absolute left-4 top-4 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                          <div className='rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 text-xs font-medium text-white'>
                            Principal
                          </div>
                        </div>
                      </div>

                      {/* Imágenes secundarias */}
                      {actualPost.additionalImages.slice(1).map((imageUrl: string, index: number) => (
                        <div
                          key={index + 1}
                          className='group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900'
                          onClick={() => openImageModal(index + 1)}
                        >
                          <div className='aspect-square'>
                            <img
                              src={imageUrl}
                              alt={`${actualPost.title} - Imagen ${index + 2}`}
                              className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                            />
                          </div>

                          <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${index === 0 ? 'bg-gradient-to-br from-teal-500/20 to-green-500/20' :
                            'bg-gradient-to-br from-orange-500/20 to-red-500/20'
                            }`} />

                          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-full bg-white/95 p-3 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                              <ZoomIn className='size-5 text-slate-700' />
                            </div>
                          </div>

                          <div className='absolute bottom-2 right-2 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white'>
                              {index + 2}/{actualPost.additionalImages.length}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cuatro imágenes */}
                  {actualPost.additionalImages.length === 4 && (
                    <div className='grid grid-cols-2 gap-3 md:gap-4 lg:gap-6'>
                      {actualPost.additionalImages.map((imageUrl: string, index: number) => (
                        <div
                          key={index}
                          className='group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900'
                          onClick={() => openImageModal(index)}
                        >
                          <div className='aspect-square'>
                            <img
                              src={imageUrl}
                              alt={`${actualPost.title} - Imagen ${index + 1}`}
                              className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                            />
                          </div>

                          <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${index % 4 === 0 ? 'bg-gradient-to-br from-purple-500/15 to-blue-500/15' :
                            index % 4 === 1 ? 'bg-gradient-to-br from-blue-500/15 to-teal-500/15' :
                              index % 4 === 2 ? 'bg-gradient-to-br from-teal-500/15 to-green-500/15' :
                                'bg-gradient-to-br from-orange-500/15 to-red-500/15'
                            }`} />

                          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-full bg-white/95 p-4 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                              <ZoomIn className='size-6 text-slate-700' />
                            </div>
                          </div>

                          <div className='absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white'>
                              {index + 1}/{actualPost.additionalImages.length}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cinco o más imágenes */}
                  {actualPost.additionalImages.length >= 5 && (
                    <div className='grid auto-rows-[200px] grid-cols-2 gap-3 md:auto-rows-[250px] md:grid-cols-4 md:gap-4 lg:auto-rows-[280px] lg:gap-6'>
                      {/* Imagen principal - desktop: 2x2, mobile: 2x1 */}
                      <div
                        className='group relative col-span-2 row-span-2 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900 md:row-span-2'
                        onClick={() => openImageModal(0)}
                      >
                        <img
                          src={actualPost.additionalImages[ 0 ]}
                          alt={`${actualPost.title} - Imagen 1`}
                          className='size-full object-cover transition-all duration-700 group-hover:scale-105'
                        />

                        <div className='absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                        <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                          <div className='rounded-full bg-white/95 p-5 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                            <ZoomIn className='size-7 text-slate-700' />
                          </div>
                        </div>

                        <div className='absolute left-4 top-4 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                          <div className='rounded-full bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 text-xs font-medium text-white'>
                            Principal
                          </div>
                        </div>

                        <div className='absolute bottom-4 right-4 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                          <div className='rounded-lg bg-black/80 px-3 py-2 text-sm font-medium text-white'>
                            1/{actualPost.additionalImages.length}
                          </div>
                        </div>
                      </div>

                      {/* Segunda imagen - horizontal */}
                      {actualPost.additionalImages[ 1 ] && (
                        <div
                          className='group relative col-span-2 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900'
                          onClick={() => openImageModal(1)}
                        >
                          <img
                            src={actualPost.additionalImages[ 1 ]}
                            alt={`${actualPost.title} - Imagen 2`}
                            className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                          />

                          <div className='absolute inset-0 bg-gradient-to-r from-blue-500/15 to-teal-500/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-full bg-white/95 p-4 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                              <ZoomIn className='size-6 text-slate-700' />
                            </div>
                          </div>

                          <div className='absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white'>
                              2/{actualPost.additionalImages.length}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tercera y cuarta imagen - cuadradas pequeñas */}
                      {actualPost.additionalImages.slice(2, 4).map((imageUrl: string, index: number) => (
                        <div
                          key={index + 2}
                          className='group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900'
                          onClick={() => openImageModal(index + 2)}
                        >
                          <img
                            src={imageUrl}
                            alt={`${actualPost.title} - Imagen ${index + 3}`}
                            className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                          />

                          <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${index === 0 ? 'bg-gradient-to-br from-teal-500/20 to-green-500/20' :
                            'bg-gradient-to-br from-green-500/20 to-orange-500/20'
                            }`} />

                          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-full bg-white/95 p-3 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                              <ZoomIn className='size-5 text-slate-700' />
                            </div>
                          </div>

                          <div className='absolute bottom-2 right-2 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white'>
                              {index + 3}/{actualPost.additionalImages.length}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Quinta imagen con overlay de "más imágenes" */}
                      {actualPost.additionalImages[ 4 ] && (
                        <div
                          className='group relative col-span-2 cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-xl transition-all duration-500 hover:shadow-2xl dark:from-slate-800 dark:to-slate-900'
                          onClick={() => openImageModal(4)}
                        >
                          <img
                            src={actualPost.additionalImages[ 4 ]}
                            alt={`${actualPost.title} - Imagen 5`}
                            className='size-full object-cover transition-all duration-700 group-hover:scale-110'
                          />

                          {/* Overlay especial si hay más imágenes */}
                          {actualPost.additionalImages.length > 5 && (
                            <div className='absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]'>
                              <div className='text-center text-white'>
                                <div className='mb-2 text-3xl font-bold'>+{actualPost.additionalImages.length - 5}</div>
                                <div className='text-sm font-medium'>más imágenes</div>
                              </div>
                            </div>
                          )}

                          <div className='absolute inset-0 bg-gradient-to-br from-orange-500/15 to-red-500/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />

                          <div className='absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-full bg-white/95 p-4 shadow-xl transition-transform duration-300 group-hover:scale-110'>
                              <ZoomIn className='size-6 text-slate-700' />
                            </div>
                          </div>

                          <div className='absolute bottom-3 right-3 opacity-0 transition-all duration-300 group-hover:opacity-100'>
                            <div className='rounded-lg bg-black/80 px-2 py-1 text-xs font-medium text-white'>
                              5/{actualPost.additionalImages.length}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Call to action mejorado */}
                  {actualPost.additionalImages.length > 6 && (
                    <div className='mt-8 text-center'>
                      <div className='from-primary/5 via-secondary/5 to-primary/5 mx-auto max-w-md rounded-2xl bg-gradient-to-r p-6 backdrop-blur-sm'>
                        <div className='mb-3 flex items-center justify-center gap-2'>
                          <div className='size-2 animate-pulse rounded-full bg-primary' />
                          <div className='size-2 animate-pulse rounded-full bg-secondary delay-75' />
                          <div className='size-2 animate-pulse rounded-full bg-primary delay-150' />
                        </div>
                        <p className='mb-2 text-sm font-semibold text-foreground'>
                          {actualPost.additionalImages.length} imágenes disponibles
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Haz clic en cualquier imagen para explorar la galería completa
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de imagen con Embla */}
        {selectedImageIndex !== null && allImages.length > 0 && (
          <ImageModal
            images={allImages}
            initialIndex={selectedImageIndex}
            isOpen={selectedImageIndex !== null}
            onClose={closeImageModal}
            title={actualPost.title}
          />
        )}
      </div>
    </div>
  )
}