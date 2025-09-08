// Datos estructurados (JSON-LD) para mejorar el SEO
export interface StructuredDataConfig {
  type: 'Organization' | 'WebSite' | 'Article' | 'Event' | 'Product' | 'Person' | 'BreadcrumbList'
  data: Record<string, unknown>
}

// Datos estructurados para la organización
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'MX',
    addressLocality: 'Ciudad de México',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Mexico',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    availableLanguage: ['Spanish', 'English'],
    contactType: 'customer service',
    telephone: '+52-55-1234-5678',
  },
  description: 'Galería de arte contemporáneo especializada en artistas emergentes y consagrados',
  founder: {
    '@type': 'Person',
    name: 'Impulso Galería',
  },
  foundingDate: '2020',
  image: 'https://impulsogaleria.com/og-image.jpg',
  logo: 'https://impulsogaleria.com/logo.png',
  name: 'Impulso Galería',
  sameAs: [
    'https://www.instagram.com/impulsogaleria',
    'https://www.facebook.com/impulsogaleria',
    'https://twitter.com/impulsogaleria',
  ],
  serviceType: [
    'Venta de obra original',
    'Enmarcado profesional',
    'Impresión digital',
    'Inversión en arte',
    'Sistemas de colgaje',
    'Fabricación de catálogos',
  ],
  url: 'https://impulsogaleria.com',
}

// Datos estructurados para el sitio web
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  description:
    'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas.',
  name: 'Impulso Galería',
  potentialAction: {
    '@type': 'SearchAction',
    'query-input': 'required name=search_term_string',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://impulsogaleria.com/store/search?q={search_term_string}',
    },
  },
  publisher: {
    '@type': 'Organization',
    logo: {
      '@type': 'ImageObject',
      url: 'https://impulsogaleria.com/logo.png',
    },
    name: 'Impulso Galería',
  },
  url: 'https://impulsogaleria.com',
}

// Función para generar datos estructurados de artista
export const generateArtistStructuredData = (artist: {
  firstName: string
  lastName: string
  email: string
  profile?: {
    occupation?: string
    bio?: string
    avatarUrl?: string
  }
  products?: {
    id: string
    title: string
    description?: string
    images?: string[]
    price?: number
  }[]
}) => {
  const fullName = `${artist.firstName} ${artist.lastName}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    description: artist.profile?.bio ?? `Artista contemporáneo ${fullName} en Impulso Galería`,
    email: artist.email,
    image: artist.profile?.avatarUrl ?? 'https://impulsogaleria.com/og-artist.jpg',
    jobTitle: artist.profile?.occupation ?? 'Artista',
    name: fullName,
    url: `https://impulsogaleria.com/artists/${artist.email}`,
    worksFor: {
      '@type': 'Organization',
      name: 'Impulso Galería',
    },
    ...(artist.products &&
      artist.products.length > 0 && {
        makesOffer: artist.products.map((product) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Product',
            description: product.description,
            image: product.images?.[0] ?? 'https://impulsogaleria.com/og-product.jpg',
            name: product.title,
            offers: {
              '@type': 'Offer',
              price: product.price ?? 0,
              priceCurrency: 'MXN',
            },
          },
        })),
      }),
  }
}

// Función para generar datos estructurados de producto
export const generateProductStructuredData = (product: {
  id: string
  title: string
  description?: string
  images?: string[]
  price?: number
  artist?: string
  category?: string
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    brand: {
      '@type': 'Brand',
      name: 'Impulso Galería',
    },
    description: product.description ?? `Obra de arte "${product.title}" en Impulso Galería`,
    image: product.images ?? ['https://impulsogaleria.com/og-product.jpg'],
    manufacturer: {
      '@type': 'Organization',
      name: 'Impulso Galería',
    },
    name: product.title,
    ...(product.artist && {
      creator: {
        '@type': 'Person',
        name: product.artist,
      },
    }),
    ...(product.category && {
      category: product.category,
    }),
    offers: {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      price: product.price ?? 0,
      priceCurrency: 'MXN',
      seller: {
        '@type': 'Organization',
        name: 'Impulso Galería',
      },
    },
  }
}

// Función para generar datos estructurados de evento
export const generateEventStructuredData = (event: {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  location?: string
  images?: string[]
  organizer?: string
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    description: event.description ?? `Evento "${event.title}" en Impulso Galería`,
    endDate: event.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    image: event.images ?? ['https://impulsogaleria.com/og-event.jpg'],
    location: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MX',
        addressLocality: 'Ciudad de México',
      },
      name: event.location ?? 'Impulso Galería',
    },
    name: event.title,
    organizer: {
      '@type': 'Organization',
      name: event.organizer ?? 'Impulso Galería',
      url: 'https://impulsogaleria.com',
    },
    startDate: event.startDate,
  }
}

// Función para generar breadcrumbs
export const generateBreadcrumbStructuredData = (
  items: {
    name: string
    url: string
  }[]
) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      item: item.url,
      name: item.name,
      position: index + 1,
    })),
  }
}

// Función para generar datos estructurados de artículo
export const generateArticleStructuredData = (article: {
  title: string
  description?: string
  author?: string
  publishDate?: string
  modifiedDate?: string
  images?: string[]
  url: string
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    author: {
      '@type': 'Person',
      name: article.author ?? 'Impulso Galería',
    },
    dateModified: article.modifiedDate ?? article.publishDate,
    datePublished: article.publishDate,
    description: article.description,
    headline: article.title,
    image: article.images ?? ['https://impulsogaleria.com/og-blog.jpg'],
    mainEntityOfPage: {
      '@id': article.url,
      '@type': 'WebPage',
    },
    publisher: {
      '@type': 'Organization',
      logo: {
        '@type': 'ImageObject',
        url: 'https://impulsogaleria.com/logo.png',
      },
      name: 'Impulso Galería',
    },
    url: article.url,
  }
}

// Función para generar datos estructurados de colección de arte
export const generateArtCollectionStructuredData = (collection: {
  name: string
  description?: string
  items: {
    name: string
    description?: string
    image?: string
    creator?: string
  }[]
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    collectionSize: collection.items.length,
    description: collection.description,
    itemListElement: collection.items.map((item, index) => ({
      '@type': 'CreativeWork',
      creator: item.creator
        ? {
            '@type': 'Person',
            name: item.creator,
          }
        : undefined,
      description: item.description,
      image: item.image,
      name: item.name,
      position: index + 1,
    })),
    name: collection.name,
  }
}

// Structured data para navegación del sitio (ayuda con sitelinks)
export const generateSiteNavigationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'SiteNavigationElement',
          name: 'Inicio',
          position: 1,
          url: 'https://impulsogaleria.com',
        },
        {
          '@type': 'SiteNavigationElement',
          name: 'Galería',
          position: 2,
          url: 'https://impulsogaleria.com/store',
        },
        {
          '@type': 'SiteNavigationElement',
          name: 'Artistas',
          position: 3,
          url: 'https://impulsogaleria.com/artists',
        },
        {
          '@type': 'SiteNavigationElement',
          name: 'Contacto',
          position: 4,
          url: 'https://impulsogaleria.com/contact',
        },
        {
          '@type': 'SiteNavigationElement',
          name: 'Membresía',
          position: 5,
          url: 'https://impulsogaleria.com/membership',
        },
        {
          '@type': 'SiteNavigationElement',
          name: 'Servicios',
          position: 6,
          url: 'https://impulsogaleria.com/services',
        },
      ],
      name: 'Navegación Principal',
    },
    name: 'Impulso Galería',
    potentialAction: {
      '@type': 'SearchAction',
      'query-input': 'required name=search_term_string',
      target: 'https://impulsogaleria.com/store/search?q={search_term_string}',
    },
    url: 'https://impulsogaleria.com',
  }
}
