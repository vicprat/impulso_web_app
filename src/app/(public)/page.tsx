import { BookOpen, DollarSign, Frame, Image, Printer, TrendingUp } from 'lucide-react'
import { Suspense } from 'react'

import type { Metadata } from 'next'

import { Landing } from '@/components/Landing'
import { HomeStructuredData } from '@/components/StructuredData'
import {
  getBlogPosts,
  getEventPosts,
  getPublicArtists,
  getPublicEvents,
  getPublicProducts,
} from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'
import { type PublicEvent } from '@/modules/shopify/service'
import { Membership } from '@/src/components/Landing/Membership/Membership'
import { ROUTES } from '@/src/config/routes'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = routeMetadata['/']

interface Slide {
  imageUrl: string
  alt: string
  title: string
  subtitle: string
  parallaxFactor?: number
  actionUrl: string
  actionText: string
}

const slides: Slide[] = [
  {
    actionText: 'Explorar la Galería',
    actionUrl: ROUTES.STORE.MAIN.PATH,
    alt: 'Espacio de Impulso Galería',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3378.webp',
    parallaxFactor: 1.2,
    subtitle: 'Descubre obras únicas de artistas emergentes y consagrados.',
    title: 'Explora un Mundo de Arte',
  },
  {
    actionText: 'Ver Eventos',
    actionUrl: ROUTES.STORE.EVENTS.PATH,
    alt: 'Exposición de arte contemporáneo',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/CrutityStudio-3381.webp',
    parallaxFactor: 1.1,
    subtitle: 'Sumérgete en experiencias artísticas inolvidables.',
    title: 'Eventos y Exposiciones Exclusivas',
  },
  {
    actionText: 'Conocer Servicios',
    actionUrl: ROUTES.STORE.SERVICES.PATH,
    alt: 'Detalle de una obra de arte',
    imageUrl:
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled-16-9-rectangle.webp',
    parallaxFactor: 1.5,
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    title: 'Encuentra la Pieza Perfecta',
  },
]

export interface Service {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  features?: string[]
}

const services: Service[] = [
  {
    description:
      'Desarrollamos artistas a través de la venta de obra original y gráfica con asesoría especializada.',
    features: ['Obra original', 'Gráfica limitada', 'Asesoría de ventas', 'Promoción de artistas'],
    icon: DollarSign,
    id: '1',
    title: 'Venta de Obra Original',
  },
  {
    description:
      'Mantenemos altos estándares de calidad para la conservación profesional de obras de arte.',
    features: ['Marcos personalizados', 'Conservación', 'Cristales UV', 'Montaje profesional'],
    icon: Frame,
    id: '2',
    title: 'Enmarcado Profesional',
  },
  {
    description:
      'Equipos de alta calidad para reproducciones de arte con variedad de papeles premium.',
    features: ['Impresión Giclée', 'Papeles de arte', 'Ediciones limitadas', 'Control de calidad'],
    icon: Printer,
    id: '3',
    title: 'Estudio de Impresión',
  },
  {
    description:
      'El arte como inversión mantiene su valor y se comporta diferente a otros activos financieros.',
    features: ['Asesoría especializada', 'Valuación', 'Portafolio de arte', 'Análisis de mercado'],
    icon: TrendingUp,
    id: '4',
    title: 'Inversión en Arte',
  },
  {
    description: 'Facilita el colgado de cuadros con una gama completa de sistemas profesionales.',
    features: ['Sistemas modulares', 'Hardware profesional', 'Instalación', 'Mantenimiento'],
    icon: Image,
    id: '5',
    title: 'Sistema de Colgajes',
  },
  {
    description:
      'Impresión especializada de revistas, folletos, catálogos y libros de arte de alta calidad.',
    features: [
      'Catálogos de arte',
      'Libros especializados',
      'Diseño editorial',
      'Acabados premium',
    ],
    icon: BookOpen,
    id: '6',
    title: 'Fabricación de Catálogos',
  },
]

export interface Benefit {
  id: string
  text: string
}

const benefits: Benefit[] = [
  { id: '1', text: 'Venta de obras' },
  { id: '2', text: 'Impresión digital para reproducciones giclée' },
  { id: '3', text: 'Exposición internacional' },
  { id: '4', text: 'Publicidad' },
  { id: '5', text: 'Pagos seguros' },
  { id: '6', text: 'Sin exclusividad' },
  { id: '7', text: 'Nos encargamos de generar tus guías de envío' },
]

export default async function Page() {
  const [events, eventPosts] = await Promise.all([getPublicEvents(), getEventPosts()])
  const blogPosts = await getBlogPosts()
  const artists = await getPublicArtists()
  const products = await getPublicProducts()

  // Combinar eventos de Shopify con posts de tipo EVENT
  // Si hay eventos de Shopify, los usamos primero, si no hay suficientes, agregamos posts
  const shopifyEvents = events
  const eventPostsAsEvents: PublicEvent[] = eventPosts
    .slice(0, Math.max(0, 6 - shopifyEvents.length))
    .map((post) => ({
      availableForSale: true,
      createdAt: post.createdAt.toISOString(),
      descriptionHtml: post.content,
      eventDetails: {
        date: post.date ? new Date(post.date).toISOString().split('T')[0] : null,
        endTime: null,
        location: post.location,
        organizer: null,
        startTime: null,
      },
      formattedPrice: 'Entrada gratuita',
      handle: post.slug,
      id: `post-${post.id}`,
      images: post.featuredImageUrl
        ? [
            {
              altText: post.title,
              url: post.featuredImageUrl,
            },
          ]
        : [],
      isAvailable: true,
      priceRange: {
        maxVariantPrice: { amount: '0', currencyCode: 'MXN' },
        minVariantPrice: { amount: '0', currencyCode: 'MXN' },
      },
      primaryVariant: null,
      productType: 'Evento',
      status: 'ACTIVE' as const,
      tags: post.tags.map((t) => t.tag.name),
      title: post.title,
      updatedAt: post.updatedAt.toISOString(),
      variants: [],
      vendor: 'Evento',
    }))

  const combinedEvents = [...shopifyEvents, ...eventPostsAsEvents]

  return (
    <main className='overflow-hidden bg-surface'>
      <HomeStructuredData />

      <Landing.Carousel slides={slides} />

      <Landing.Section
        icon='Palette'
        title='Obras Seleccionadas'
        subtitle='Descubre piezas únicas cuidadosamente curadas que capturan la esencia del arte contemporáneo'
        actionText='Explorar Galería'
        actionHref={ROUTES.STORE.MAIN.PATH}
      >
        <Suspense fallback={<Landing.Products.Loader />}>
          <Landing.Products.Main data={products} />
        </Suspense>
      </Landing.Section>

      <Landing.Section
        icon='Users'
        title='Artistas Destacados'
        subtitle='Conoce el talento excepcional de nuestra comunidad de artistas emergentes y consagrados'
        actionText='Ver Todos los Artistas'
        actionHref={ROUTES.PUBLIC.ARTISTS.PATH}
        wrapperElement='section'
      >
        <Suspense fallback={<Landing.Artists.Loader />}>
          <Landing.Artists.Carousel
            artists={artists}
            title='Artistas Destacados'
            subtitle='Conoce el talento excepcional de nuestra comunidad de artistas emergentes y consagrados'
            autoplay={true}
            scrollSpeed={0.5}
          />
        </Suspense>
      </Landing.Section>

      <Landing.LazyHero rootMargin='600px'>
        <Suspense fallback={<div className='min-h-[90vh] bg-black' />}>
          <Landing.Hero />
        </Suspense>
      </Landing.LazyHero>

      {combinedEvents.length > 0 && (
        <Landing.Section
          icon='Calendar'
          title='Próximos Eventos'
          subtitle='Sumérgete en experiencias artísticas únicas que transformarán tu perspectiva del arte'
          actionText='Ver Todos los Eventos'
          actionHref={ROUTES.STORE.EVENTS.PATH}
        >
          <Suspense fallback={<Landing.Events.Loader />}>
            <Landing.Events.Main data={combinedEvents} />
          </Suspense>
        </Landing.Section>
      )}

      <Landing.Section
        icon='Settings'
        title='Nuestros Servicios'
        subtitle='Ofrecemos una gama completa de servicios especializados para el mundo del arte, desde la venta de obra original hasta servicios técnicos de alta calidad'
        actionText='Ver Todos los Servicios'
        actionHref={ROUTES.STORE.SERVICES.PATH}
      >
        <Suspense fallback={<Landing.Services.Loader />}>
          <Landing.Services.Main data={services} />
        </Suspense>
      </Landing.Section>

      <Landing.Section
        icon='Crown'
        title='Vende tus obras'
        subtitle='Adquiere un plan de membresía y disfruta de los grandes beneficios de vender tu arte con nosotros'
        actionText='Más información'
        actionHref={ROUTES.STORE.MEMBERSHIP.PATH}
        paddingY='py-20'
        containerClassName='container relative z-10 mx-auto px-6'
      >
        <Membership data={benefits} />
      </Landing.Section>

      <Landing.Section
        icon='Sparkles'
        title='Últimos Artículos'
        subtitle='Explora las historias más recientes del mundo del arte y nuestra comunidad creativa'
        actionText='Ver todo el Blog'
        actionHref={ROUTES.PUBLIC.POSTS.DYNAMIC.MAIN.PATH.replace(':postType', 'blog')}
        paddingY='py-12 lg:py-16'
      >
        <Suspense fallback={<Landing.Blog.Loader />}>
          <Landing.Blog.Carousel
            posts={blogPosts}
            title='Últimos Artículos'
            subtitle='Explora las historias más recientes del mundo del arte y nuestra comunidad creativa'
            autoplay={true}
            scrollSpeed={0.5}
          />
        </Suspense>
      </Landing.Section>
    </main>
  )
}
