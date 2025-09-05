
import { Suspense } from 'react'

import { ArtistSkeleton, ArtistsSection } from '@/components/HomePageContent/ArtistsSection'
import { Blog, BlogSkeleton } from '@/components/HomePageContent/BlogSection'
import { Events } from '@/components/HomePageContent/EventsSection'
import { EventsLoader } from '@/components/HomePageContent/Loaders/EventsLoader'
import { ProductsLoader } from '@/components/HomePageContent/Loaders/ProductsLoader'
import { ProductsSection } from '@/components/HomePageContent/ProductsSection'
import { Landing } from '@/components/Landing'
import { Membership } from '@/components/Membership'
import { Services } from '@/components/Services'
import { getBlogPosts, getPublicArtists, getPublicEvents, getPublicProducts } from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'
import { ROUTES } from '@/src/config/routes'

import type { Metadata } from 'next'

export const metadata: Metadata = routeMetadata[ '/' ]

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
      'https://xhsidbbijujrdjjymhbs.supabase.co/storage/v1/object/public/images/general/IMG_3321-scaled.webp',
    parallaxFactor: 1.5,
    subtitle: 'Nuestra colección curada tiene algo especial para cada amante del arte.',
    title: 'Encuentra la Pieza Perfecta',
  },
]

export default async function Page() {

  const events = await getPublicEvents()
  const blogPosts = await getBlogPosts()
  const artists = await getPublicArtists()
  const products = await getPublicProducts()

  return (
    <main className='overflow-hidden bg-surface'>
      <Landing.Hero videoId='j5RAiTZ-w6E' />

      <Landing.Carousel slides={slides} />

      <Landing.Section
        icon="Sparkles"
        title='Últimos Artículos'
        subtitle='Explora las historias más recientes del mundo del arte y nuestra comunidad creativa'
        actionText='Ver todo el Blog'
        actionHref={ROUTES.PUBLIC.POSTS.DYNAMIC.MAIN.PATH.replace(':postType', 'blog')}
        paddingY='py-12 lg:py-16'
      >
        <Suspense fallback={Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <BlogSkeleton />
          </div>
        ))}>
          <Blog blogData={blogPosts} />
        </Suspense>
      </Landing.Section>

      <Landing.Section
        icon="Settings"
        title='Nuestros Servicios'
        subtitle='Ofrecemos una gama completa de servicios especializados para el mundo del arte, desde la venta de obra original hasta servicios técnicos de alta calidad'
        actionText='Ver Todos los Servicios'
        actionHref={ROUTES.STORE.SERVICES.PATH}
      >
        <Services />
      </Landing.Section>

      <Landing.Section
        icon="Calendar"
        title='Próximos Eventos'
        subtitle='Sumérgete en experiencias artísticas únicas que transformarán tu perspectiva del arte'
        actionText='Ver Todos los Eventos'
        actionHref={ROUTES.STORE.EVENTS.PATH}
      >
        <Suspense fallback={<EventsLoader />}>
          <Events events={events} />
        </Suspense>
      </Landing.Section>

      <Landing.Section
        icon="Crown"
        title='Vende tus obras'
        subtitle='Adquiere un plan de membresía y disfruta de los grandes beneficios de vender tu arte con nosotros'
        actionText='Más información'
        actionHref={ROUTES.STORE.MEMBERSHIP.PATH}
        paddingY='py-20'
        containerClassName='container relative z-10 mx-auto px-6'
      >
        <Membership />
      </Landing.Section>

      <Landing.Section
        icon="Users"
        title='Artistas Destacados'
        subtitle='Conoce el talento excepcional de nuestra comunidad de artistas emergentes y consagrados'
        actionText='Ver Todos los Artistas'
        actionHref={ROUTES.PUBLIC.ARTISTS.PATH}
        wrapperElement='section'
      >
        <Suspense fallback={Array.from({ length: 8 }).map((_, i) => (
          <div key={i} >
            <ArtistSkeleton />
          </div>
        ))}>
          <ArtistsSection artists={artists} />
        </Suspense>
      </Landing.Section>

      <Landing.Section
        icon="Palette"
        title='Obras Seleccionadas'
        subtitle='Descubre piezas únicas cuidadosamente curadas que capturan la esencia del arte contemporáneo'
        actionText='Explorar Galería'
        actionHref={ROUTES.STORE.MAIN.PATH}
      >
        <Suspense fallback={<ProductsLoader />}>
          <ProductsSection products={products} />
        </Suspense>
      </Landing.Section>
    </main>
  )
}
