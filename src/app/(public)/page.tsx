'use client';

import React, { useCallback, useEffect,  useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  EmblaCarouselType,
  EmblaOptionsType
} from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {EnhancedHeroVideo} from '@/components/HeroVideoSection';
import { useEmblaParallax } from '@/hooks/useEmblaParallax';

// ===== TYPES =====
interface Slide {
  imageUrl: string;
  alt: string;
  title: string;
  subtitle: string;
  parallaxFactor?: number; // Opcional: para aprovechar la nueva funcionalidad del hook
}
interface Category {
  name: string;
  imageUrl: string;
  href: string;
}

interface Artist {
  name: string;
  avatarUrl: string;
  bio: string;
  href: string;
  featuredWorkUrl: string;
}

interface Event {
  title: string;
  date: string;
  imageUrl: string;
  description: string;
}

interface NewsArticle {
  title: string;
  imageUrl: string;
  excerpt: string;
}

// ===== CAROUSEL BUTTON COMPONENTS =====
interface ArrowButtonProps {
  onClick: () => void;
  disabled: boolean;
  direction: 'prev' | 'next';
}

const ArrowButton: React.FC<ArrowButtonProps> = ({ onClick, disabled, direction }) => (
  <button
    className={`absolute ${direction === 'prev' ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
    onClick={onClick}
    disabled={disabled}
  >
    {direction === 'prev' ? (
      <ChevronLeft className="w-6 h-6" />
    ) : (
      <ChevronRight className="w-6 h-6" />
    )}
  </button>
);

interface DotButtonProps {
  onClick: () => void;
  isSelected: boolean;
}

const DotButton: React.FC<DotButtonProps> = ({ onClick, isSelected }) => (
  <button
    className={`w-3 h-3 rounded-full transition-all duration-300 ${
      isSelected ? 'bg-white' : 'bg-white/50 hover:bg-white/70'
    }`}
    onClick={onClick}
  />
);

// ===== HOOKS =====
const usePrevNextButtons = (emblaApi: EmblaCarouselType | undefined) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  };
};

const useDotButton = (emblaApi: EmblaCarouselType | undefined) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: EmblaCarouselType) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on('reInit', onInit);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onInit, onSelect]);

  return {
    selectedIndex,
    scrollSnaps,
    onDotButtonClick
  };
};

// ===== DATA =====
const heroSlides: Slide[] = [
  {
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3378.jpg',
    alt: 'Espacio de Impulso Galería',
    title: 'Explora un Mundo de Arte',
    subtitle: 'Descubre obras únicas de artistas emergentes y consagrados.',
    parallaxFactor: 1.2
  },
  {
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3381.jpg',
    alt: 'Exposición de arte contemporáneo',
    title: 'Eventos y Exposiciones Exclusivas',
    subtitle: 'Sumérgete en experiencias artísticas inolvidables.',
    parallaxFactor: 1.1
  },
  {
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/10/IMG_3321-scaled.jpg',
    alt: 'Detalle de una obra de arte',
    title: 'Encuentra la Pieza Perfecta',
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    parallaxFactor: 1.5
  }
];

const categories: Category[] = [
  {
    name: 'Pintura',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/08/ic_pintura_categoria.jpeg',
    href: '/store/collections/pintura'
  },
  {
    name: 'Escultura',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/08/ic_escultura_categoria.jpeg',
    href: '/store/collections/escultura'
  },
  {
    name: 'Fotografía',
    imageUrl: 'https://via.placeholder.com/300/0000FF/808080?Text=Fotografia',
    href: '/store/collections/fotografia'
  },
  {
    name: 'Arte Digital',
    imageUrl: 'https://via.placeholder.com/300/FFA500/FFFFFF?Text=Arte+Digital',
    href: '/store/collections/arte-digital'
  },
  {
    name: 'Merch',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/08/ic_merch_categoria.jpeg',
    href: '/store/collections/merch'
  }
];

const artists: Artist[] = [
  {
    name: 'Alva de la Canal',
    avatarUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/Alva-de-la-Canal.jpg',
    bio: 'Artista con una profunda conexión con...',
    href: '/artistas/alva-de-la-canal',
    featuredWorkUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/obra-alva.jpg'
  },
  {
    name: 'Armando García Nuñez',
    avatarUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/Armando-Garcia-Nunez.jpeg',
    bio: 'Reconocido por su uso innovador de...',
    href: '/artistas/armando-garcia-nunez',
    featuredWorkUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/obra-armando.jpg'
  },
  {
    name: 'Frida Kahlo (Ejemplo)',
    avatarUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/Frida-Kahlo.jpg',
    bio: 'Ícono del arte mexicano...',
    href: '/artistas/frida-kahlo',
    featuredWorkUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/02/obra-frida.jpg'
  }
];

const events: Event[] = [
  {
    title: 'Próxima Subasta de Arte',
    date: '2024-05-15',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/11/Subasta-de-Arte-Impulso-Galeria-1-960x640.jpeg',
    description: 'No te pierdas nuestra próxima subasta con una selección excepcional de obras.'
  },
  {
    title: 'Inauguración: Nuevas Colecciones',
    date: '2024-06-01',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2023/10/Inauguracion-de-la-exposicion-Tiempo-Color-y-Tradiccion-960x640.jpg',
    description: 'Celebra con nosotros la llegada de nuevas y emocionantes colecciones.'
  }
];

const news: NewsArticle[] = [
  {
    title: 'Tendencias del Arte Contemporáneo 2024',
 imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3378.jpg',
    excerpt: 'Descubre las corrientes artísticas que están marcando la pauta este año.'
  },
  {
    title: 'Consejos para Coleccionar Arte por Primera Vez',
    imageUrl: 'https://impulsogaleria.com/wp-content/uploads/2021/11/CrutityStudio-3381.jpg',
    excerpt: 'Una guía práctica para iniciarte en el apasionante mundo del coleccionismo.'
  }
];

// ===== ANIMATION VARIANTS =====
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

const slideUp = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.7, ease: "easeInOut" }
};


interface ParallaxCarouselProps {
  slides: Slide[];
  options?: EmblaOptionsType;
}

const ParallaxHeroCarousel: React.FC<ParallaxCarouselProps> = ({ slides, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options,
      loop: true,
      align: 'center',
      skipSnaps: false,
      dragFree: false
    },
    [Autoplay({ delay: 8000, stopOnInteraction: true })]
  );
  
  useEmblaParallax(emblaApi);

  const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } = usePrevNextButtons(emblaApi);


  return (
    <div className="relative h-[50vh] overflow-hidden p-4">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative"
              data-parallax-factor={slide.parallaxFactor || 1}
            >
              <motion.div
               className="relative w-full h-full overflow-hidden rounded-2xl">
                <div className="embla__parallax__layer absolute inset-0 w-[120%] h-full">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center text-white text-center p-6 z-10">
                  <motion.h2
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
                  >
                    {slide.title}
                  </motion.h2>
                  <motion.p
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="max-w-2xl text-lg md:text-xl mb-8"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    variants={slideUp}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: 0.4, duration: 0.7, ease: "easeInOut" }}
                  >
                    <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/80 transition-colors duration-200">
                      <Link href="/store">Explorar la Galería</Link>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <ArrowButton
        onClick={onPrevButtonClick}
        disabled={prevBtnDisabled}
        direction="prev"
      />
      <ArrowButton
        onClick={onNextButtonClick}
        disabled={nextBtnDisabled}
        direction="next"
      />

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
        {scrollSnaps.map((_, index) => (
          <DotButton
            key={index}
            onClick={() => onDotButtonClick(index)}
            isSelected={index === selectedIndex}
          />
        ))}
      </div>
    </div>
  );
};
// Carousel para Eventos (sin parallax)
const EventsCarousel = ({ events }: { events: Event[] }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    dragFree: true,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 }
    }
  });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {events.map((event) => (
            <div key={event.title} className="flex-[0_0_90%] md:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
              <motion.div
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden h-full"
              >
                <div className="relative aspect-video">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {event.description.substring(0, 100)}...
                  </p>
                  <Button asChild variant="secondary" size="sm">
                    <Link href="/eventos">Ver Detalles</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all duration-300"
        onClick={scrollPrev}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-lg border flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all duration-300"
        onClick={scrollNext}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ===== MAIN COMPONENT =====
export default function HomePage() {
  return (
    <main className="overflow-hidden">
        <EnhancedHeroVideo
        videoId="j5RAiTZ-w6E" 
      />

     

      {/* Descubre Impulso Galería */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            variants={slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-4xl text-gray-800 dark:text-gray-200 mb-8"
          >
            Descubre Impulso Galería
          </motion.h2>
          <motion.p
            variants={fadeIn}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-3xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12"
          >
            En Impulso Galería, nuestro objetivo es ser un faro para el arte y la cultura. Impulsamos el talento de artistas emergentes y celebramos la trayectoria de creadores consolidados, ofreciendo a nuestros clientes obras de la más alta calidad y experiencias artísticas enriquecedoras.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              variants={slideUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-md shadow-md p-6 hover:shadow-lg transition duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Nuestra Misión</h3>
              <p className="text-gray-600 dark:text-gray-400">Fomentar el arte como un lenguaje universal, creando un espacio inclusivo y dinámico para artistas y amantes del arte.</p>
            </motion.div>
            <motion.div
              variants={slideUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-md shadow-md p-6 hover:shadow-lg transition duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Nuestra Visión</h3>
              <p className="text-gray-600 dark:text-gray-400">Ser una galería referente en la promoción y difusión del arte contemporáneo, tanto a nivel nacional como internacional.</p>
            </motion.div>
            <motion.div
              variants={slideUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-md shadow-md p-6 hover:shadow-lg transition duration-300"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Nuestros Valores</h3>
              <p className="text-gray-600 dark:text-gray-400">Calidad, innovación, compromiso con los artistas, y una profunda pasión por el arte en todas sus formas.</p>
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
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <motion.h2
            variants={slideUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-3xl font-semibold text-center text-gray-800 dark:text-gray-200 mb-8"
          >
            Últimas Noticias
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article) => (
              <motion.div
                key={article.title}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden"
              >
                <div className="relative aspect-video">
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {article.excerpt}...
                  </p>
                  <Button asChild variant="secondary" size="sm" className="mt-4">
                    <Link href="/noticias">Leer Más</Link>
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild variant="outline" size="lg">
              <Link href="/noticias">Ver Todas las Noticias</Link>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}