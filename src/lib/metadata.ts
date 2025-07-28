import type { Metadata } from 'next'

// Configuración base de metadata
export const baseMetadata: Metadata = {
  title: {
    default: 'Impulso Galería - Arte Contemporáneo y Exposiciones',
    template: '%s'
  },
  description: 'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas que transformarán tu espacio.',
  keywords: [
    'arte contemporáneo',
    'galería de arte',
    'exposiciones',
    'artistas',
    'pinturas',
    'esculturas',
    'arte digital',
    'impulso galería',
    'arte mexicano',
    'colección de arte'
  ],
  authors: [{ name: 'Impulso Galería' }],
  creator: 'Impulso Galería',
  publisher: 'Impulso Galería',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://impulsogaleria.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    url: 'https://impulsogaleria.com',
    siteName: 'Impulso Galería',
    title: 'Impulso Galería - Arte Contemporáneo y Exposiciones',
    description: 'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Impulso Galería - Arte Contemporáneo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Impulso Galería - Arte Contemporáneo y Exposiciones',
    description: 'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas.',
    images: ['/og-image.jpg'],
    creator: '@impulsogaleria',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'tu-codigo-de-verificacion-google',
    yandex: 'tu-codigo-de-verificacion-yandex',
    yahoo: 'tu-codigo-de-verificacion-yahoo',
  },
}

// Metadata específica para cada ruta
export const routeMetadata: Record<string, Metadata> = {
  '/': {
    title: 'Inicio - Impulso Galería',
    description: 'Bienvenido a Impulso Galería. Descubre arte contemporáneo único, explora exposiciones exclusivas y conoce artistas emergentes que transformarán tu perspectiva del arte.',
    keywords: [
      'arte contemporáneo',
      'galería de arte',
      'exposiciones',
      'artistas emergentes',
      'arte mexicano',
      'colección de arte',
      'impulso galería'
    ],
    openGraph: {
      title: 'Inicio - Impulso Galería',
      description: 'Bienvenido a Impulso Galería. Descubre arte contemporáneo único, explora exposiciones exclusivas y conoce artistas emergentes.',
      images: [
        {
          url: '/og-home.jpg',
          width: 1200,
          height: 630,
          alt: 'Impulso Galería - Página de inicio',
        },
      ],
    },
  },
  '/artists': {
    title: 'Artistas - Impulso Galería',
    description: 'Explora nuestra colección de artistas talentosos en Impulso Galería. Descubre sus obras únicas, técnicas innovadoras y visiones artísticas que definen el arte contemporáneo.',
    keywords: [
      'artistas',
      'arte contemporáneo',
      'pintores',
      'escultores',
      'artistas mexicanos',
      'arte emergente',
      'galería de artistas'
    ],
    openGraph: {
      title: 'Artistas - Impulso Galería',
      description: 'Explora nuestra colección de artistas talentosos. Descubre sus obras únicas y visiones artísticas que definen el arte contemporáneo.',
      images: [
        {
          url: '/og-artists.jpg',
          width: 1200,
          height: 630,
          alt: 'Artistas - Impulso Galería',
        },
      ],
    },
  },
  '/store': {
    title: 'Galería - Impulso Galería',
    description: 'Explora nuestra galería de arte contemporáneo. Encuentra piezas únicas, pinturas originales, esculturas y obras de arte que transformarán cualquier espacio.',
    keywords: [
      'galería de arte',
      'pinturas',
      'esculturas',
      'arte contemporáneo',
      'obras de arte',
      'colección',
      'arte para comprar'
    ],
    openGraph: {
      title: 'Galería - Impulso Galería',
      description: 'Explora nuestra galería de arte contemporáneo. Encuentra piezas únicas que transformarán cualquier espacio.',
      images: [
        {
          url: '/og-gallery.jpg',
          width: 1200,
          height: 630,
          alt: 'Galería - Impulso Galería',
        },
      ],
    },
  },
  '/events': {
    title: 'Eventos - Impulso Galería',
    description: 'Descubre los próximos eventos y exposiciones en Impulso Galería. Inauguraciones, charlas con artistas, talleres y experiencias únicas en el mundo del arte.',
    keywords: [
      'eventos de arte',
      'exposiciones',
      'inauguraciones',
      'charlas con artistas',
      'talleres de arte',
      'eventos culturales',
      'arte contemporáneo'
    ],
    openGraph: {
      title: 'Eventos - Impulso Galería',
      description: 'Descubre los próximos eventos y exposiciones. Inauguraciones, charlas con artistas y experiencias únicas en el mundo del arte.',
      images: [
        {
          url: '/og-events.jpg',
          width: 1200,
          height: 630,
          alt: 'Eventos - Impulso Galería',
        },
      ],
    },
  },
  '/store/cart': {
    title: 'Carrito de Compras - Impulso Galería',
    description: 'Tu carrito de compras en Impulso Galería. Revisa las obras de arte seleccionadas y completa tu compra de manera segura.',
    keywords: [
      'carrito de compras',
      'comprar arte',
      'obras de arte',
      'pinturas',
      'esculturas',
      'arte contemporáneo'
    ],
    openGraph: {
      title: 'Carrito de Compras - Impulso Galería',
      description: 'Revisa las obras de arte seleccionadas y completa tu compra de manera segura.',
      images: [
        {
          url: '/og-cart.jpg',
          width: 1200,
          height: 630,
          alt: 'Carrito de Compras - Impulso Galería',
        },
      ],
    },
  },
  '/store/search': {
    title: 'Buscar - Impulso Galería',
    description: 'Busca en nuestra colección de arte contemporáneo. Encuentra obras específicas, artistas o estilos que se adapten a tu gusto y espacio.',
    keywords: [
      'buscar arte',
      'colección de arte',
      'obras de arte',
      'artistas',
      'estilos artísticos',
      'arte contemporáneo'
    ],
    openGraph: {
      title: 'Buscar - Impulso Galería',
      description: 'Busca en nuestra colección de arte contemporáneo. Encuentra obras específicas que se adapten a tu gusto.',
      images: [
        {
          url: '/og-search.jpg',
          width: 1200,
          height: 630,
          alt: 'Buscar - Impulso Galería',
        },
      ],
    },
  },
}

// Función para generar metadata dinámica para perfiles de artistas
export const generateArtistMetadata = (artist: {
  firstName: string
  lastName: string
  profile?: {
    occupation?: string
    avatarUrl?: string
  }
}): Metadata => {
  const fullName = `${artist.firstName} ${artist.lastName}`
  const occupation = artist.profile?.occupation || 'Artista'
  
  return {
    title: `${fullName} - ${occupation}`,
    description: `Descubre las obras únicas de ${fullName}, ${occupation.toLowerCase()} en Impulso Galería. Explora su portafolio, técnica y visión artística que define el arte contemporáneo.`,
    keywords: [
      fullName,
      occupation,
      'arte contemporáneo',
      'artista',
      'portafolio',
      'obras de arte',
      'impulso galería'
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${fullName} - ${occupation}`,
      description: `Descubre las obras únicas de ${fullName}, ${occupation.toLowerCase()}. Explora su portafolio y visión artística.`,
      images: artist.profile?.avatarUrl ? [
        {
          url: artist.profile.avatarUrl,
          width: 400,
          height: 400,
          alt: `${fullName} - ${occupation}`,
        },
      ] : [
        {
          url: '/og-artist.jpg',
          width: 1200,
          height: 630,
          alt: `${fullName} - ${occupation}`,
        },
      ],
    },
    twitter: {
      title: `${fullName} - ${occupation}`,
      description: `Descubre las obras únicas de ${fullName}, ${occupation.toLowerCase()}.`,
      images: artist.profile?.avatarUrl ? [artist.profile.avatarUrl] : ['/og-artist.jpg'],
    },
  }
}

// Función para generar metadata dinámica para productos
export const generateProductMetadata = (product: {
  title: string
  description?: string
  images?: string[]
  artist?: string
}): Metadata => {
  return {
    title: `${product.title}`,
    description: product.description || `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}. Una obra única de arte contemporáneo disponible en Impulso Galería.`,
    keywords: [
      product.title,
      product.artist,
      'arte contemporáneo',
      'obra de arte',
      'pintura',
      'escultura',
      'impulso galería'
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${product.title}`,
      description: product.description || `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}. Una obra única de arte contemporáneo.`,
      images: product.images && product.images.length > 0 ? [
        {
          url: product.images[0],
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ] : [
        {
          url: '/og-product.jpg',
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
    },
    twitter: {
      title: `${product.title}`,
      description: product.description || `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}.`,
      images: product.images && product.images.length > 0 ? product.images : ['/og-product.jpg'],
    },
  }
}

// Función para generar metadata dinámica para eventos
export const generateEventMetadata = (event: {
  title: string
  description?: string
  date?: string
  images?: string[]
}): Metadata => {
  return {
    title: `${event.title} | Evento`,
    description: event.description || `Descubre "${event.title}", un evento único en Impulso Galería. ${event.date ? `Fecha: ${event.date}` : ''} Una experiencia inmersiva en el mundo del arte contemporáneo.`,
    keywords: [
      event.title,
      'evento de arte',
      'exposición',
      'inauguración',
      'arte contemporáneo',
      'impulso galería'
    ],
    openGraph: {
      title: `${event.title} | Evento`,
      description: event.description || `Descubre "${event.title}", un evento único en Impulso Galería. Una experiencia inmersiva en el mundo del arte.`,
      images: event.images && event.images.length > 0 ? [
        {
          url: event.images[0],
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ] : [
        {
          url: '/og-event.jpg',
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      title: `${event.title} | Evento`,
      description: event.description || `Descubre "${event.title}", un evento único en Impulso Galería.`,
      images: event.images && event.images.length > 0 ? event.images : ['/og-event.jpg'],
    },
  }
} 