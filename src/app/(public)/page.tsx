'use client'

import { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel'
import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useCallback, useEffect, useState } from 'react'

import { Landing } from '@/components/Landing'
import { Button } from '@/components/ui/button'
import { useEmblaParallax } from '@/hooks/useEmblaParallax'
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
    className={`size-3 rounded-full transition-all duration-300 ${
      isSelected ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
    }`}
    onClick={onClick}
  />
)

const usePrevNextButtons = (emblaApi: EmblaCarouselType | undefined) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollPrev()
  }, [emblaApi])

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return
    emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('select', onSelect)
  }, [emblaApi, onSelect])

  return {
    nextBtnDisabled,
    onNextButtonClick,
    onPrevButtonClick,
    prevBtnDisabled,
  }
}

const useDotButton = (emblaApi: EmblaCarouselType | undefined) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return
      emblaApi.scrollTo(index)
    },
    [emblaApi]
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
  }, [emblaApi, onInit, onSelect])

  return {
    onDotButtonClick,
    scrollSnaps,
    selectedIndex,
  }
}

const heroSlides: Slide[] = [
  {
    alt: 'Espacio de Impulso Galería',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3378.jpg',
    parallaxFactor: 1.2,
    subtitle: 'Descubre obras únicas de artistas emergentes y consagrados.',
    title: 'Explora un Mundo de Arte',
  },
  {
    alt: 'Exposición de arte contemporáneo',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3381.jpg',
    parallaxFactor: 1.1,
    subtitle: 'Sumérgete en experiencias artísticas inolvidables.',
    title: 'Eventos y Exposiciones Exclusivas',
  },
  {
    alt: 'Detalle de una obra de arte',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/10/IMG_3321-scaled.jpg',
    parallaxFactor: 1.5,
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    title: 'Encuentra la Pieza Perfecta',
  },
]

const news: NewsArticle[] = [
  {
    excerpt: 'Descubre las corrientes artísticas que están marcando la pauta este año.',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3378.jpg',
    title: 'Tendencias del Arte Contemporáneo 2024',
  },
  {
    excerpt: 'Una guía práctica para iniciarte en el apasionante mundo del coleccionismo.',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3381.jpg',
    title: 'Consejos para Coleccionar Arte por Primera Vez',
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
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options,
      align: 'center',
      dragFree: false,
      loop: true,
      skipSnaps: false,
    },
    [Autoplay({ delay: 8000, stopOnInteraction: true })]
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
                  <Image
                    src={slide.imageUrl}
                    alt={slide.alt}
                    fill
                    className='object-cover'
                    priority={index === 0}
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
                      <Link href={ROUTES.STORE.MAIN.PATH}>Explorar la Galería</Link>
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

export default function Page() {
  const { data: artists } = usePublicArtists()
  return (
    <main className='overflow-hidden'>
      <Landing.Hero videoId='j5RAiTZ-w6E' />

      <section className=' py-20 '>
        <div className='container mx-auto px-6 text-center'>
          <motion.h2
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='mb-8 text-4xl text-gray-800 dark:text-gray-200'
          >
            Descubre Impulso Galería
          </motion.h2>
          <motion.p
            variants={fadeIn}
            initial='initial'
            whileInView='animate'
            viewport={{ amount: 0.5, once: true }}
            className='mx-auto mb-12 max-w-3xl text-lg text-gray-600 dark:text-gray-400'
          >
            En Impulso Galería, nuestro objetivo es ser un faro para el arte y la cultura.
            Impulsamos el talento de artistas emergentes y celebramos la trayectoria de creadores
            consolidados, ofreciendo a nuestros clientes obras de la más alta calidad y experiencias
            artísticas enriquecedoras.
          </motion.p>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            <motion.div
              variants={slideUp}
              initial='initial'
              whileInView='animate'
              viewport={{ amount: 0.3, once: true }}
              className='rounded-md bg-white p-6 shadow-md transition duration-300 hover:shadow-lg dark:bg-gray-800'
            >
              <h3 className='mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200'>
                Nuestra Misión
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Fomentar el arte como un lenguaje universal, creando un espacio inclusivo y dinámico
                para artistas y amantes del arte.
              </p>
            </motion.div>
            <motion.div
              variants={slideUp}
              initial='initial'
              whileInView='animate'
              viewport={{ amount: 0.3, once: true }}
              transition={{ delay: 0.2 }}
              className='rounded-md bg-white p-6 shadow-md transition duration-300 hover:shadow-lg dark:bg-gray-800'
            >
              <h3 className='mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200'>
                Nuestra Visión
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Ser una galería referente en la promoción y difusión del arte contemporáneo, tanto a
                nivel nacional como internacional.
              </p>
            </motion.div>
            <motion.div
              variants={slideUp}
              initial='initial'
              whileInView='animate'
              viewport={{ amount: 0.3, once: true }}
              transition={{ delay: 0.4 }}
              className='rounded-md bg-white p-6 shadow-md transition duration-300 hover:shadow-lg dark:bg-gray-800'
            >
              <h3 className='mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200'>
                Nuestros Valores
              </h3>
              <p className='text-gray-600 dark:text-gray-400'>
                Calidad, innovación, compromiso con los artistas, y una profunda pasión por el arte
                en todas sus formas.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section>
        <ParallaxHeroCarousel slides={heroSlides} />
      </section>

      <section className='py-20'>
        <div className='container mx-auto px-6'>
          <motion.h2
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='mb-8 text-center text-3xl font-semibold text-gray-800 dark:text-gray-200'
          >
            Artistas Destacados
          </motion.h2>
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

      <section className='bg-gray-50 py-20 dark:bg-gray-900'>
        <div className='container mx-auto px-6'>
          <motion.h2
            variants={slideUp}
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            className='mb-8 text-center text-3xl font-semibold text-gray-800 dark:text-gray-200'
          >
            Últimas Noticias
          </motion.h2>
          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {news.map((article) => (
              <motion.div
                key={article.title}
                variants={fadeIn}
                initial='initial'
                whileInView='animate'
                viewport={{ amount: 0.4, once: true }}
                className='overflow-hidden rounded-md bg-white shadow-md dark:bg-gray-800'
              >
                <div className='relative aspect-video'>
                  <Image src={article.imageUrl} alt={article.title} fill className='object-cover' />
                </div>
                <div className='p-6'>
                  <h3 className='mb-2 text-lg font-medium text-gray-800 dark:text-gray-200'>
                    {article.title}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>{article.excerpt}...</p>
                  {/* TODO: ROUTING - AddROUTES.NEWS.DETAIL.PATH */}
                  <Button asChild variant='secondary' size='sm' className='mt-4'>
                    <Link href='/noticias'>Leer Más</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className='mt-8 text-center'>
            {/* TODO: ROUTING - AddROUTES.NEWS.MAIN.PATH */}
            <Button asChild variant='outline' size='lg'>
              <Link href='/noticias'>Ver Todas las Noticias</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
