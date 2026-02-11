import { Suspense } from 'react'

import type { Locale } from '@/types/notion-content.types'
import type { Metadata } from 'next'

import { Landing } from '@/components/Landing'
import { HomeStructuredData } from '@/components/StructuredData'
import {
  getBenefits,
  getBlogPosts,
  getCarouselSlides,
  getEventPosts,
  getPublicArtists,
  getPublicEvents,
  getPublicProducts,
  getServices,
} from '@/lib/landing-data'
import { routeMetadata } from '@/lib/metadata'
import { type PublicEvent } from '@/modules/shopify/service'
import { Membership } from '@/src/components/Landing/Membership/Membership'
import { ROUTES } from '@/src/config/routes'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = routeMetadata['/']

// Notion data will be fetched in the Page component

export default async function Page() {
  const [
    events,
    eventPosts,
    blogPosts,
    artists,
    products,
    notionSlides,
    notionServices,
    notionBenefits,
  ] = await Promise.all([
    getPublicEvents(),
    getEventPosts(),
    getBlogPosts(),
    getPublicArtists(),
    getPublicProducts(),
    getCarouselSlides('es'),
    getServices(false),
    getBenefits('landing'),
  ])

  // Transform Notion data to localized versions for components
  const slides = notionSlides.map((s) => ({
    actionText: s.actionText.es,
    actionUrl: s.actionUrl,
    alt: s.title.es,
    imageUrl: s.imageUrl,
    order: s.order,
    subtitle: s.subtitle.es,
    title: s.title.es,
  }))

  const services = notionServices.map((s) => ({
    description: s.description.es,
    features: s.features,
    iconName: s.iconName,
    id: s.id,
    order: s.order,
    title: s.title.es,
  }))

  const benefits = notionBenefits.map((b) => ({
    id: b.id,
    order: b.order,
    text: (b.text as Record<Locale, string>).es,
  }))

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
