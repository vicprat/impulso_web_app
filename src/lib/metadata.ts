import type { Metadata } from 'next'

// Configuración base de metadata
export const baseMetadata: Metadata = {
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Impulso Galería' }],
  creator: 'Impulso Galería',
  description: 'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas que transformarán tu espacio.',
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
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
  metadataBase: new URL('https://impulsogaleria.com'),
  openGraph: {
    description: 'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas.',
    images: [
      {
        height: 630,
        alt: 'Impulso Galería - Arte Contemporáneo',
        url: '/og-image.jpg',
        width: 1200,
      },
    ],
    locale: 'es_MX',
    siteName: 'Impulso Galería',
    title: 'Impulso Galería - Arte Contemporáneo y Exposiciones',
    type: 'website',
    url: 'https://impulsogaleria.com',
  },
  publisher: 'Impulso Galería',
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    index: true,
  },
  title: {
    default: 'Impulso Galería - Arte Contemporáneo y Exposiciones',
    template: '%s'
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@impulsogaleria',
    description: 'Descubre arte contemporáneo único en Impulso Galería. Explora exposiciones, conoce artistas y encuentra piezas exclusivas.',
    images: ['/og-image.jpg'],
    title: 'Impulso Galería - Arte Contemporáneo y Exposiciones',
  },
  verification: {
    google: 'tu-codigo-de-verificacion-google',
    yahoo: 'tu-codigo-de-verificacion-yahoo',
    yandex: 'tu-codigo-de-verificacion-yandex',
  },
}

// Metadata específica para cada ruta
export const routeMetadata: Record<string, Metadata> = {
  '/': {
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
      description: 'Bienvenido a Impulso Galería. Descubre arte contemporáneo único, explora exposiciones exclusivas y conoce artistas emergentes.',
      images: [
        {
          alt: 'Impulso Galería - Página de inicio',
          height: 630,
          url: '/og-home.jpg',
          width: 1200,
        },
      ],
      title: 'Inicio - Impulso Galería',
    },
    title: 'Inicio - Impulso Galería',
  },
  '/artists': {
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
      description: 'Explora nuestra colección de artistas talentosos. Descubre sus obras únicas y visiones artísticas que definen el arte contemporáneo.',
      images: [
        {
          alt: 'Artistas - Impulso Galería',
          height: 630,
          url: '/og-artists.jpg',
          width: 1200,
        },
      ],
      title: 'Artistas - Impulso Galería',
    },
    title: 'Artistas - Impulso Galería',
  },
  '/events': {
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
      description: 'Descubre los próximos eventos y exposiciones. Inauguraciones, charlas con artistas y experiencias únicas en el mundo del arte.',
      images: [
        {
          alt: 'Eventos - Impulso Galería',
          height: 630,
          url: '/og-events.jpg',
          width: 1200,
        },
      ],
      title: 'Eventos - Impulso Galería',
    },
    title: 'Eventos - Impulso Galería',
  },
  '/store': {
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
      description: 'Explora nuestra galería de arte contemporáneo. Encuentra piezas únicas que transformarán cualquier espacio.',
      images: [
        {
          alt: 'Galería - Impulso Galería',
          height: 630,
          url: '/og-gallery.jpg',
          width: 1200,
        },
      ],
      title: 'Galería - Impulso Galería',
    },
    title: 'Galería - Impulso Galería',
  },
  '/store/cart': {
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
      description: 'Revisa las obras de arte seleccionadas y completa tu compra de manera segura.',
      images: [
        {
          alt: 'Carrito de Compras - Impulso Galería',
          height: 630,
          url: '/og-cart.jpg',
          width: 1200,
        },
      ],
      title: 'Carrito de Compras - Impulso Galería',
    },
    title: 'Carrito de Compras - Impulso Galería',
  },
  '/store/search': {
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
      description: 'Busca en nuestra colección de arte contemporáneo. Encuentra obras específicas que se adapten a tu gusto.',
      images: [
        {
          alt: 'Buscar - Impulso Galería',
          height: 630,
          url: '/og-search.jpg',
          width: 1200,
        },
      ],
      title: 'Buscar - Impulso Galería',
    },
    title: 'Buscar - Impulso Galería',
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
      description: `Descubre las obras únicas de ${fullName}, ${occupation.toLowerCase()}. Explora su portafolio y visión artística.`,
      images: artist.profile?.avatarUrl ? [
        {
          alt: `${fullName} - ${occupation}`,
          height: 400,
          url: artist.profile.avatarUrl,
          width: 400,
        },
      ] : [
        {
          alt: `${fullName} - ${occupation}`,
          height: 630,
          url: '/og-artist.jpg',
          width: 1200,
        },
      ],
      title: `${fullName} - ${occupation}`,
    },
    title: `${fullName} - ${occupation}`,
    twitter: {
      description: `Descubre las obras únicas de ${fullName}, ${occupation.toLowerCase()}.`,
      images: artist.profile?.avatarUrl ? [artist.profile.avatarUrl] : ['/og-artist.jpg'],
      title: `${fullName} - ${occupation}`,
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
      description: product.description || `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}. Una obra única de arte contemporáneo.`,
      images: product.images && product.images.length > 0 ? [
        {
          alt: product.title,
          height: 630,
          url: product.images[0],
          width: 1200,
        },
      ] : [
        {
          alt: product.title,
          height: 630,
          url: '/og-product.jpg',
          width: 1200,
        },
      ],
      title: `${product.title}`,
    },
    title: `${product.title}`,
    twitter: {
      description: product.description || `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}.`,
      images: product.images && product.images.length > 0 ? product.images : ['/og-product.jpg'],
      title: `${product.title}`,
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
      description: event.description || `Descubre "${event.title}", un evento único en Impulso Galería. Una experiencia inmersiva en el mundo del arte.`,
      images: event.images && event.images.length > 0 ? [
        {
          alt: event.title,
          height: 630,
          url: event.images[0],
          width: 1200,
        },
      ] : [
        {
          alt: event.title,
          height: 630,
          url: '/og-event.jpg',
          width: 1200,
        },
      ],
      title: `${event.title} | Evento`,
    },
    title: `${event.title} | Evento`,
    twitter: {
      description: event.description || `Descubre "${event.title}", un evento único en Impulso Galería.`,
      images: event.images && event.images.length > 0 ? event.images : ['/og-event.jpg'],
      title: `${event.title} | Evento`,
    },
  }
} 