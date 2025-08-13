/* eslint-disable @next/next/no-img-element */
'use client'

import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ArrowRight, Calendar, ChevronLeft, ChevronRight, Palette, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { BlogCard } from '@/components/Card/Blog'
import { EventCarousel } from '@/components/EventCarousel'
import { Landing } from '@/components/Landing'
import { MembershipSection } from '@/components/MembershipSection'
import { ProductCarousel } from '@/components/ProductCarousel'
import { ServicesSection } from '@/components/ServicesSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useEmblaParallax } from '@/hooks/useEmblaParallax'
import { usePublicEvents } from '@/hooks/usePublicEvents'
import { usePublicProducts } from '@/hooks/usePublicProducts'
import { usePosts } from '@/modules/blog/hooks'
import { Card as ArtistCard } from '@/src/components/Card'
import { ROUTES } from '@/src/config/routes'
import { usePublicArtists } from '@/src/modules/user/hooks/management'
import { type PublicArtist } from '@/src/modules/user/types'

// Interfaces y tipos
interface Slide {
  imageUrl: string
  alt: string
  title: string
  subtitle: string
  parallaxFactor?: number
  actionUrl: string
  actionText: string
}

interface ArrowButtonProps {
  onClick: () => void
  disabled: boolean
  direction: 'prev' | 'next'
}

// Componentes mejorados
const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, disabled, onClick }) => (
  <button
    className={`absolute ${direction === 'prev' ? 'left-4' : 'right-4'} bg-card/90 top-1/2 z-20 flex size-12 -translate-y-1/2 items-center justify-center rounded-full text-foreground shadow-elevation-3 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-card hover:shadow-elevation-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100`}
    onClick={onClick}
    disabled={disabled}
  >
    {direction === 'prev' ? (
      <ChevronLeft className='size-5' />
    ) : (
      <ChevronRight className='size-5' />
    )}
  </button>
)

interface DotButtonProps {
  onClick: () => void
  isSelected: boolean
}

const DotButton: React.FC<DotButtonProps> = ({ isSelected, onClick }) => (
  <button
    className={`size-3 rounded-full transition-all duration-300 ${isSelected
      ? 'scale-125 bg-primary shadow-elevation-2'
      : 'bg-surface-container hover:scale-110 hover:bg-surface-container-high'
      }`}
    onClick={onClick}
  />
)

// Skeleton Components siguiendo el sistema MD3
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

const ArtistSkeleton = () => (
  <Card className='bg-card shadow-elevation-1'>
    <div className='h-28 animate-pulse bg-muted' />
    <div className='relative -mt-12 flex justify-center'>
      <div className='size-24 animate-pulse rounded-full border-4 border-background bg-muted' />
    </div>
    <CardContent className='space-y-3 px-6 pb-6 pt-4 text-center'>
      <div className='mx-auto h-6 w-32 animate-pulse rounded bg-muted' />
      <div className='mx-auto h-4 w-24 animate-pulse rounded bg-muted' />
    </CardContent>
  </Card>
)

const SectionHeader = ({
  actionHref,
  actionText,
  className = '',
  icon: Icon,
  subtitle,
  title
}: {
  icon: React.ElementType
  title: string
  subtitle: string
  actionText?: string
  actionHref?: string
  className?: string
}) => (
  <motion.div
    className={`mb-12 ${className}`}
    variants={fadeIn}
    initial='initial'
    whileInView='animate'
    viewport={{ once: true }}
  >
    <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex items-start gap-4'>
        <div className='flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary-container text-primary shadow-elevation-1'>
          <Icon className='size-6 text-primary-foreground dark:text-white' />
        </div>
        <div>
          <h2 className='text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl'>
            {title}
          </h2>
          <p className='mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground'>
            {subtitle}
          </p>
        </div>
      </div>

      {actionText && actionHref && (
        <motion.div
          variants={slideUp}
          initial='initial'
          whileInView='animate'
          viewport={{ once: true }}
        >
          <Button
            asChild
            size='lg'
            variant='container-success'
          >
            <Link href={actionHref} className='flex items-center gap-2'>
              {actionText}
              <ArrowRight className='size-4' />
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  </motion.div>
)

// Hooks mejorados
const usePrevNextButtons = (emblaApi: EmblaCarouselType | undefined) => {
  const [ prevBtnDisabled, setPrevBtnDisabled ] = useState(true)
  const [ nextBtnDisabled, setNextBtnDisabled ] = useState(true)

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [ emblaApi ])

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [ emblaApi ])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [ emblaApi, onSelect ])

  return {
    nextBtnDisabled,
    onNextButtonClick,
    onPrevButtonClick,
    prevBtnDisabled,
  }
}

const useDotButton = (emblaApi: EmblaCarouselType | undefined) => {
  const [ selectedIndex, setSelectedIndex ] = useState(0)
  const [ scrollSnaps, setScrollSnaps ] = useState<number[]>([])

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [ emblaApi ]
  )

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onInit(emblaApi)
    onSelect(emblaApi)
    emblaApi.on('reInit', onInit)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [ emblaApi, onInit, onSelect ])

  return {
    onDotButtonClick,
    scrollSnaps,
    selectedIndex,
  }
}

// Data
const heroSlides: Slide[] = [
  {
    actionText: 'Explorar la Galería',
    actionUrl: ROUTES.STORE.MAIN.PATH,
    alt: 'Espacio de Impulso Galería',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3378.webp',
    parallaxFactor: 1.2,
    subtitle: 'Descubre obras únicas de artistas emergentes y consagrados.',
    title: 'Explora un Mundo de Arte'
  },
  {
    actionText: 'Ver Eventos',
    actionUrl: ROUTES.STORE.EVENTS.PATH,
    alt: 'Exposición de arte contemporáneo',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3381.webp',
    parallaxFactor: 1.1,
    subtitle: 'Sumérgete en experiencias artísticas inolvidables.',
    title: 'Eventos y Exposiciones Exclusivas'
  },
  {
    actionText: 'Conocer Servicios',
    actionUrl: ROUTES.STORE.SERVICES.PATH,
    alt: 'Detalle de una obra de arte',
    imageUrl: 'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled.webp',
    parallaxFactor: 1.5,
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    title: 'Encuentra la Pieza Perfecta'
  },
]

// Animaciones mejoradas
const fadeIn = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 20 },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 40 },
  transition: { duration: 0.8, ease: 'easeOut' },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Carousel Component
interface ParallaxCarouselProps {
  slides: Slide[]
  options?: EmblaOptionsType
}

const ParallaxHeroCarousel: React.FC<ParallaxCarouselProps> = ({ options, slides }) => {
  const [ emblaRef, emblaApi ] = useEmblaCarousel(
    {
      ...options,
      align: 'center',
      dragFree: false,
      loop: true,
      skipSnaps: false,
    },
    [ Autoplay({ delay: 8000, stopOnInteraction: true }) ]
  )

  useEmblaParallax(emblaApi)

  const { onDotButtonClick, scrollSnaps, selectedIndex } = useDotButton(emblaApi)
  const { nextBtnDisabled, onNextButtonClick, onPrevButtonClick, prevBtnDisabled } =
    usePrevNextButtons(emblaApi)

  return (
    <div className='relative h-[60vh] overflow-hidden lg:h-[70vh]'>
      {/* Contenedor del carousel */}
      <Card className='bg-card/95 mx-4 h-full overflow-hidden shadow-elevation-3 backdrop-blur-sm'>
        <div className='h-full overflow-hidden' ref={emblaRef}>
          <div className='flex h-full'>
            {slides.map((slide, index) => (
              <div
                key={index}
                className='relative min-w-0 flex-[0_0_100%]'
                data-parallax-factor={slide.parallaxFactor ?? 1}
              >
                <motion.div className='relative size-full overflow-hidden'>
                  <div className='absolute inset-0 h-full w-[120%]'>
                    <img
                      src={slide.imageUrl}
                      alt={slide.alt}
                      className='size-full object-cover'
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>

                  {/* Overlay con gradiente mejorado */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent' />

                  {/* Contenido centrado */}
                  <div className='absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center text-white'>
                    <motion.div
                      variants={fadeIn}
                      initial='initial'
                      animate='animate'
                      className='max-w-4xl space-y-6'
                    >
                      <h2 className='text-3xl font-bold leading-tight md:text-5xl lg:text-6xl xl:text-7xl'>
                        {slide.title}
                      </h2>
                      <p className='mx-auto max-w-2xl text-lg leading-relaxed opacity-90 md:text-xl lg:text-2xl'>
                        {slide.subtitle}
                      </p>
                      <motion.div
                        variants={slideUp}
                        initial='initial'
                        animate='animate'
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          asChild
                          size='lg'
                          variant='container-success'
                        >
                          <Link href={slide.actionUrl}>{slide.actionText}</Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Controles mejorados */}
        <ArrowButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} direction='prev' />
        <ArrowButton onClick={onNextButtonClick} disabled={nextBtnDisabled} direction='next' />

        {/* Indicadores mejorados */}
        <div className='bg-card/80 absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-3 rounded-full px-4 py-2 shadow-elevation-2 backdrop-blur-sm'>
          {scrollSnaps.map((_, index) => (
            <DotButton
              key={index}
              onClick={() => onDotButtonClick(index)}
              isSelected={index === selectedIndex}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}

// Función para mapear PublicArtist
const mapPublicArtistToArtist = (publicArtist: PublicArtist) => {
  return {
    email: publicArtist.email,
    firstName: publicArtist.firstName,
    id: publicArtist.id,
    lastName: publicArtist.lastName,
    profile: {
      avatarUrl: publicArtist.profile?.avatarUrl || undefined,
      backgroundImageUrl: publicArtist.profile?.backgroundImageUrl || undefined,
      occupation: publicArtist.profile?.occupation || undefined,
    }
  }
}

// Componente principal mejorado
export function HomePageContent() {
  const { data: artists, isLoading: artistsLoading } = usePublicArtists()
  const { loading: productsLoading, products: publicProducts } = usePublicProducts(8)
  const { events: publicEvents, loading: eventsLoading } = usePublicEvents(6)
  const { data: blogData, isLoading: blogLoading } = usePosts({
    page: 1,
    pageSize: 4,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    status: 'PUBLISHED',
  })

  return (
    <main className='overflow-hidden bg-surface'>
      {/* Hero Principal */}
      <Landing.Hero videoId='j5RAiTZ-w6E' />

      <ParallaxHeroCarousel slides={heroSlides} />

      {/* Sección de Blog mejorada */}
      <div className='py-12 lg:py-16'>
        <div className='container mx-auto px-6'>
          <SectionHeader
            icon={Sparkles}
            title='Últimos Artículos'
            subtitle='Explora las historias más recientes del mundo del arte y nuestra comunidad creativa'
            actionText='Ver todo el Blog'
            actionHref={ROUTES.PUBLIC.BLOG.MAIN.PATH}
          />

          {blogLoading && (
            <motion.div
              className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              variants={staggerContainer}
              initial='initial'
              animate='animate'
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} variants={fadeIn}>
                  <BlogSkeleton />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!blogLoading && blogData?.items && blogData.items.length > 0 && (
            <motion.div
              className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              {blogData.items.map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={fadeIn}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <BlogCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!blogLoading && (!blogData?.items || blogData.items.length === 0) && (
            <motion.div
              className='py-16 text-center'
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted'>
                <Sparkles className='size-8 text-muted-foreground' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-foreground'>
                Próximamente
              </h3>
              <p className='text-muted-foreground'>
                Estamos preparando contenido increíble para ti
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sección de Servicios */}
      <ServicesSection />

      {/* Sección de Eventos mejorada */}
      <div className='py-16 lg:py-24'>
        <div className='container mx-auto px-6'>
          <SectionHeader
            icon={Calendar}
            title='Próximos Eventos'
            subtitle='Sumérgete en experiencias artísticas únicas que transformarán tu perspectiva del arte'
            actionText='Ver Todos los Eventos'
            actionHref={ROUTES.STORE.EVENTS.PATH}
          />

          {eventsLoading && (
            <div className='flex justify-center py-16'>
              <div className='flex flex-col items-center gap-4'>
                <div className='size-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-muted-foreground'>Cargando eventos...</p>
              </div>
            </div>
          )}

          {!eventsLoading && publicEvents.length > 0 && (
            <motion.div
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <EventCarousel
                events={publicEvents.slice(0, 4)}
                title=''
                subtitle=''
              />
            </motion.div>
          )}

          {!eventsLoading && publicEvents.length === 0 && (
            <motion.div
              className='py-16 text-center'
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted'>
                <Calendar className='size-8 text-muted-foreground' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-foreground'>
                Nuevos eventos próximamente
              </h3>
              <p className='text-muted-foreground'>
                Estamos organizando experiencias increíbles para ti
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Sección de Membresía */}
      <MembershipSection />

      {/* Sección de Artistas mejorada */}
      <section className='py-16 lg:py-24'>
        <div className='container mx-auto px-6'>
          <SectionHeader
            icon={Users}
            title='Artistas Destacados'
            subtitle='Conoce el talento excepcional de nuestra comunidad de artistas emergentes y consagrados'
            actionText='Ver Todos los Artistas'
            actionHref={ROUTES.PUBLIC.ARTISTS.PATH}
          />

          {artistsLoading && (
            <motion.div
              className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'
              variants={staggerContainer}
              initial='initial'
              animate='animate'
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div key={i} variants={fadeIn}>
                  <ArtistSkeleton />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!artistsLoading && artists && artists.length > 0 && (
            <motion.div
              className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'
              variants={staggerContainer}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              {artists.slice(0, 8).map((artist, index) => (
                <motion.div
                  key={artist.id}
                  variants={fadeIn}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <ArtistCard.Artist artist={mapPublicArtistToArtist(artist)} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {!artistsLoading && (!artists || artists.length === 0) && (
            <motion.div
              className='py-16 text-center'
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted'>
                <Users className='size-8 text-muted-foreground' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-foreground'>
                Construyendo nuestra comunidad
              </h3>
              <p className='text-muted-foreground'>
                Pronto podrás conocer a nuestros increíbles artistas
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Sección de Productos mejorada */}
      <div className='py-16 lg:py-24'>
        <div className='container mx-auto px-6'>
          <SectionHeader
            icon={Palette}
            title='Obras Seleccionadas'
            subtitle='Descubre piezas únicas cuidadosamente curadas que capturan la esencia del arte contemporáneo'
            actionText='Explorar Galería'
            actionHref={ROUTES.STORE.MAIN.PATH}

          />

          {productsLoading && (
            <div className='flex justify-center py-16'>
              <div className='flex flex-col items-center gap-4'>
                <div className='size-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-muted-foreground'>Cargando obras...</p>
              </div>
            </div>
          )}

          {!productsLoading && publicProducts.length > 0 && (
            <motion.div
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <ProductCarousel
                products={publicProducts.slice(0, 8)}
                title=''
                subtitle=''
              />
            </motion.div>
          )}

          {!productsLoading && publicProducts.length === 0 && (
            <motion.div
              className='py-16 text-center'
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <div className='mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-muted'>
                <Palette className='size-8 text-muted-foreground' />
              </div>
              <h3 className='mb-2 text-xl font-semibold text-foreground'>
                Curando nuevas obras
              </h3>
              <p className='text-muted-foreground'>
                Estamos seleccionando piezas extraordinarias para ti
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  )
}