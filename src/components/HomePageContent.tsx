'use client'

import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { EventCarousel } from '@/components/EventCarousel'
import { Landing } from '@/components/Landing'
import { MembershipSection } from '@/components/MembershipSection'
import { ProductCarousel } from '@/components/ProductCarousel'
import { ServicesSection } from '@/components/ServicesSection'
import { Button } from '@/components/ui/button'
import { useEmblaParallax } from '@/hooks/useEmblaParallax'
import { usePublicEvents } from '@/hooks/usePublicEvents'
import { usePublicProducts } from '@/hooks/usePublicProducts'
import { Card } from '@/src/components/Card'
import { ROUTES } from '@/src/config/routes'
import { usePublicArtists } from '@/src/modules/user/hooks/management'
import { type PublicArtist } from '@/src/modules/user/types'

interface Slide {
  imageUrl: string
  alt: string
  title: string
  subtitle: string
  parallaxFactor?: number
  actionUrl: string
  actionText: string
}

interface NewsArticle {
  title: string
  imageUrl: string
  excerpt: string
}

interface ArrowButtonProps {
  onClick: () => void
  disabled: boolean
  direction: 'prev' | 'next'
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, disabled, onClick }) => (
  <button
    className={`absolute ${direction === 'prev' ? 'left-4' : 'right-4'} top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50`}
    onClick={onClick}
    disabled={disabled}
  >
    {direction === 'prev' ? (
      <ChevronLeft className='size-6' />
    ) : (
      <ChevronRight className='size-6' />
    )}
  </button>
)

interface DotButtonProps {
  onClick: () => void
  isSelected: boolean
}

const DotButton: React.FC<DotButtonProps> = ({ isSelected, onClick }) => (
  <button
    className={`size-3 rounded-full transition-all duration-300 ${isSelected ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
      }`}
    onClick={onClick}
  />
)

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

const heroSlides: Slide[] = [
  {
    actionText: 'Explorar la Galería',
    actionUrl: ROUTES.STORE.MAIN.PATH,
    alt: 'Espacio de Impulso Galería',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3378.jpg',
    parallaxFactor: 1.2,
    subtitle: 'Descubre obras únicas de artistas emergentes y consagrados.',
    title: 'Explora un Mundo de Arte'
  },
  {
    actionText: 'Ver Eventos',
    actionUrl: ROUTES.STORE.EVENTS.PATH,
    alt: 'Exposición de arte contemporáneo',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3381.jpg',
    parallaxFactor: 1.1,
    subtitle: 'Sumérgete en experiencias artísticas inolvidables.',
    title: 'Eventos y Exposiciones Exclusivas'
  },
  {
    actionText: 'Conocer Servicios',
    actionUrl: ROUTES.STORE.SERVICES.PATH,
    alt: 'Detalle de una obra de arte',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/10/IMG_3321-scaled.jpg',
    parallaxFactor: 1.5,
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    title: 'Encuentra la Pieza Perfecta'
  },
]


const fadeIn = {
  animate: { opacity: 1 },
  initial: { opacity: 0 },
  transition: { duration: 0.5 },
}

const slideUp = {
  animate: { opacity: 1, y: 0 },
  initial: { opacity: 0, y: 50 },
  transition: { duration: 0.7, ease: 'easeInOut' },
}

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
    <div className='relative h-[50vh] overflow-hidden p-4'>
      <div className='h-full overflow-hidden' ref={emblaRef}>
        <div className='flex h-full'>
          {slides.map((slide, index) => (
            <div
              key={index}
              className='relative min-w-0 flex-[0_0_100%]'
              data-parallax-factor={slide.parallaxFactor ?? 1}
            >
              <motion.div className='relative size-full overflow-hidden rounded-2xl'>
                <div className=' absolute inset-0 h-full w-[120%]'>
                  <img
                    src={slide.imageUrl}
                    alt={slide.alt}
                    className='object-cover'
                  />
                </div>

                <div className='absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/30 p-6 text-center text-white'>
                  <motion.h2
                    variants={fadeIn}
                    initial='initial'
                    animate='animate'
                    className='mb-4 text-4xl font-bold md:text-5xl lg:text-6xl'
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    variants={fadeIn}
                    initial='initial'
                    animate='animate'
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className='mb-8 max-w-2xl text-lg md:text-xl'
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    variants={slideUp}
                    initial='initial'
                    animate='animate'
                    transition={{ delay: 0.4, duration: 0.7, ease: 'easeInOut' }}
                  >
                    <Button
                      asChild
                      size='lg'
                      className='hover:bg-accent/80 bg-accent text-accent-foreground transition-colors duration-200'
                    >
                      <Link href={slide.actionUrl}>{slide.actionText}</Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <ArrowButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} direction='prev' />
      <ArrowButton onClick={onNextButtonClick} disabled={nextBtnDisabled} direction='next' />

      <div className='absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2'>
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            isSelected={index === selectedIndex}
          />
        ))}
      </div>
    </div>
  )
}

// Función para mapear PublicArtist al formato que espera el componente Artist
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

export function HomePageContent() {
  const { data: artists } = usePublicArtists()
  const { loading: productsLoading, products: publicProducts } = usePublicProducts(8)
  const { events: publicEvents, loading: eventsLoading } = usePublicEvents(6)

  return (
    <main className='overflow-hidden'>
      <Landing.Hero videoId='j5RAiTZ-w6E' />

      <section>
        <ParallaxHeroCarousel slides={heroSlides} />
      </section>


      {/* Sección de Servicios */}
      <ServicesSection />


      {/* Sección de Eventos Publicados */}
      <section >
        <div className=' px-6'>


          {!eventsLoading && publicEvents.length > 0 && (
            <motion.div
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <EventCarousel
                events={publicEvents.slice(0, 4)}
                title='Próximos Eventos'
                subtitle='No te pierdas nuestras experiencias artísticas únicas'
              />

              {/* Botón "Ver todos los eventos" */}
              <motion.div
                variants={slideUp}
                initial='initial'
                whileInView='animate'
                viewport={{ once: true }}
                className='mt-12 text-center'
              >
                <Button
                  asChild
                  size='lg'
                  variant='outline-success'
                >
                  <Link href={ROUTES.STORE.EVENTS.PATH}>
                    Ver Todos los Eventos
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {eventsLoading && (
            <div className='flex justify-center py-12'>
              <div className='text-muted-foreground'>Cargando eventos...</div>
            </div>
          )}
        </div>
      </section>


      {/* Sección de Membresía */}
      <MembershipSection />

      <section className='py-20'>
        <div className=' px-6'>
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-foreground sm:text-3xl'>
                Artistas Destacados
              </h2>
              <p className='mt-2 text-muted-foreground'>
                Descubre el talento de nuestros artistas consagrados y emergentes
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
            {artists?.map((artist) => (
              <motion.div
                key={artist.id}
                variants={fadeIn}
                initial='initial'
                whileInView='animate'
                viewport={{ amount: 0.4, once: true }}
              >
                <Card.Artist artist={mapPublicArtistToArtist(artist)} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección de Productos Publicados */}
      <section className='py-20'>
        <div className=' px-6'>


          {!productsLoading && publicProducts.length > 0 && (
            <motion.div
              variants={fadeIn}
              initial='initial'
              whileInView='animate'
              viewport={{ once: true }}
            >
              <ProductCarousel
                products={publicProducts.slice(0, 5)}
                title='Obras Seleccionadas'
                subtitle='Descubre nuestras piezas más destacadas'
              />

              {/* Botón "Explora la galería" */}
              <motion.div
                variants={slideUp}
                initial='initial'
                whileInView='animate'
                viewport={{ once: true }}
                className='mt-12 text-center'
              >
                <Button
                  asChild
                  size='lg'
                  variant='outline-success'             >
                  <Link href={ROUTES.STORE.MAIN.PATH}>
                    Explora la Galería
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}

          {productsLoading && (
            <div className='flex justify-center py-12'>
              <div className='text-muted-foreground'>Cargando productos...</div>
            </div>
          )}
        </div>
      </section>

    </main>
  )
} 