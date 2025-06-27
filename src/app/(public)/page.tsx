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

// ===== TYPES =====
interface Slide {
  imageUrl: string
  alt: string
  title: string
  subtitle: string
  parallaxFactor?: number // Opcional: para aprovechar la nueva funcionalidad del hook
}
interface Category {
  name: string
  imageUrl: string
  href: string
}

interface Artist {
  name: string
  avatarUrl: string
  bio: string
  href: string
  featuredWorkUrl: string
}

interface Event {
  title: string
  date: string
  imageUrl: string
  description: string
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

// ===== HOOKS =====
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

// ===== DATA =====
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

const categories: Category[] = [
  {
    href: '/store/collections/pintura',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/08/ic_pintura_categoria.jpeg',
    name: 'Pintura',
  },
  {
    href: '/store/collections/escultura',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/08/ic_escultura_categoria.jpeg',
    name: 'Escultura',
  },
  {
    href: '/store/collections/fotografia',
    imageUrl: 'https://via.placeholder.com/300/0000FF/808080?Text=Fotografia',
    name: 'Fotografía',
  },
  {
    href: '/store/collections/arte-digital',
    imageUrl: 'https://via.placeholder.com/300/FFA500/FFFFFF?Text=Arte+Digital',
    name: 'Arte Digital',
  },
  {
    href: '/store/collections/merch',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/08/ic_merch_categoria.jpeg',
    name: 'Merch',
  },
]

const artists: Artist[] = [
  {
    avatarUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/Alva-de-la-Canal.jpg',
    bio: 'Artista con una profunda conexión con...',
    featuredWorkUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/obra-alva.jpg',
    href: '/artistas/alva-de-la-canal',
    name: 'Alva de la Canal',
  },
  {
    avatarUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/Armando-Garcia-Nunez.jpeg',
    bio: 'Reconocido por su uso innovador de...',
    featuredWorkUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/obra-armando.jpg',
    href: '/artistas/armando-garcia-nunez',
    name: 'Armando García Nuñez',
  },
  {
    avatarUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/Frida-Kahlo.jpg',
    bio: 'Ícono del arte mexicano...',
    featuredWorkUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/obra-frida.jpg',
    href: '/artistas/frida-kahlo',
    name: 'Frida Kahlo (Ejemplo)',
  },
]

const events: Event[] = [
  {
    date: '2024-05-15',
    description: 'No te pierdas nuestra próxima subasta con una selección excepcional de obras.',
    imageUrl:
      'https://impulsogaleria.com/wp-content/uploads/2023/11/Subasta-de-Arte-Impulso-Galeria-1-960x640.jpeg',
    title: 'Próxima Subasta de Arte',
  },
  {
    date: '2024-06-01',
    description: 'Celebra con nosotros la llegada de nuevas y emocionantes colecciones.',
    imageUrl:
      'https://impulsogaleria.com/wp-content/uploads/2023/10/Inauguracion-de-la-exposicion-Tiempo-Color-y-Tradiccion-960x640.jpg',
    title: 'Inauguración: Nuevas Colecciones',
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

// ===== ANIMATION VARIANTS =====
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
              data-parallax-factor={slide.parallaxFactor || 1}
            >
              <motion.div className='relative size-full overflow-hidden rounded-2xl'>
                <div className='embla__parallax__layer absolute inset-0 h-full w-[120%]'>
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
                      className='bg-accent text-accent-foreground transition-colors duration-200 hover:bg-accent/80'
                    >
                      <Link href='/store'>Explorar la Galería</Link>
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
// Carousel para Eventos (sin parallax)
const EventsCarousel = ({ events }: { events: Event[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    breakpoints: {
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 768px)': { slidesToScroll: 2 },
    },
    dragFree: true,
    skipSnaps: false,
  })

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

  return (
    <div className='relative'>
      <div className='overflow-hidden' ref={emblaRef}>
        <div className='flex gap-4'>
          {events.map((event) => (
            <div
              key={event.title}
              className='min-w-0 flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_30%]'
            >
              <motion.div
                variants={fadeIn}
                initial='initial'
                whileInView='animate'
                viewport={{ amount: 0.4, once: true }}
                className='h-full overflow-hidden rounded-md bg-white shadow-md dark:bg-gray-800'
              >
                <div className='relative aspect-video'>
                  <Image src={event.imageUrl} alt={event.title} fill className='object-cover' />
                </div>
                <div className='p-6'>
                  <h3 className='mb-2 text-xl font-semibold text-gray-800 dark:text-gray-200'>
                    {event.title}
                  </h3>
                  <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
                    {event.description.substring(0, 100)}...
                  </p>
                  <Button asChild variant='secondary' size='sm'>
                    <Link href='/eventos'>Ver Detalles</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className='absolute left-0 top-1/2 z-10 flex size-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full border bg-white text-gray-800 shadow-lg transition-all duration-300 hover:bg-gray-50'
        onClick={scrollPrev}
      >
        <ChevronLeft className='size-5' />
      </button>

      <button
        className='absolute right-0 top-1/2 z-10 flex size-10 -translate-y-1/2 translate-x-4 items-center justify-center rounded-full border bg-white text-gray-800 shadow-lg transition-all duration-300 hover:bg-gray-50'
        onClick={scrollNext}
      >
        <ChevronRight className='size-5' />
      </button>
    </div>
  )
}

// ===== MAIN COMPONENT =====
export default function HomePage() {
  return (
    <main className='overflow-hidden'>
      <Landing.Hero videoId='j5RAiTZ-w6E' />

      {/* Descubre Impulso Galería */}
      <section className='bg-gray-50 py-20 dark:bg-gray-900'>
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

      {/* Hero Section con Parallax Carousel */}
      <section>
        <ParallaxHeroCarousel slides={heroSlides} />
      </section>

      {/* Categorías Destacadas */}
      {/* <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            variants={slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-8"
          >
            Explora por Categoría
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <motion.div
                key={category.name}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.4 }}
                className="rounded-md overflow-hidden shadow-md hover:shadow-lg transition duration-300 group"
              >
                <Link href={category.href} className="block">
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 text-center">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{category.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/store/collections">Ver Todas las Categorías</Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Artistas Destacados */}
      {/* <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.h2
            variants={slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-10"
          >
            Artistas Destacados
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {artists.map((artist) => (
              <motion.div
                key={artist.name}
                variants={slideUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                className="text-center flex flex-col items-center"
              >
                <Link
                  href={artist.href}
                  className="relative w-32 h-32 rounded-full overflow-hidden shadow-md hover:shadow-lg transition duration-300 mb-4"
                >
                  <Image
                    src={artist.avatarUrl}
                    alt={artist.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {artist.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm truncate max-w-[80%]">
                  {artist.bio}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/artistas">Conocer a Todos los Artistas</Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Próximos Eventos */}
      {/* <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.h2
            variants={slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-8"
          >
            Próximos Eventos
          </motion.h2>
          <EventsCarousel events={events} />
        </div>
      </section> */}

      {/* Últimas Noticias */}
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
                  <Button asChild variant='secondary' size='sm' className='mt-4'>
                    <Link href='/noticias'>Leer Más</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className='mt-8 text-center'>
            <Button asChild variant='outline' size='lg'>
              <Link href='/noticias'>Ver Todas las Noticias</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
