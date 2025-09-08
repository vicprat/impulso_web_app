import type { Metadata } from 'next'

// Metadatos específicos para rutas dinámicas de posts
export const postTypeMetadata: Record<string, Metadata> = {
  blog: {
    description:
      'Descubre artículos, noticias y contenido exclusivo sobre arte contemporáneo, artistas y el mundo cultural en Impulso Galería.',
    keywords: [
      'blog de arte',
      'artículos de arte',
      'noticias culturales',
      'arte contemporáneo',
      'impulso galería',
      'cultura',
      'artistas mexicanos',
    ],
    openGraph: {
      description:
        'Descubre artículos, noticias y contenido exclusivo sobre arte contemporáneo y cultura.',
      images: [
        {
          alt: 'Blog - Impulso Galería',
          height: 630,
          url: '/og-blog.jpg',
          width: 1200,
        },
      ],
      title: 'Blog - Impulso Galería',
    },
    title: 'Blog - Impulso Galería',
    twitter: {
      description:
        'Descubre artículos, noticias y contenido exclusivo sobre arte contemporáneo y cultura.',
      images: ['/og-blog.jpg'],
      title: 'Blog - Impulso Galería',
    },
  },
  event: {
    description:
      'Explora los próximos eventos, exposiciones, inauguraciones y actividades culturales en Impulso Galería.',
    keywords: [
      'eventos de arte',
      'exposiciones',
      'inauguraciones',
      'actividades culturales',
      'arte contemporáneo',
      'impulso galería',
      'eventos culturales',
    ],
    openGraph: {
      description:
        'Explora los próximos eventos, exposiciones y actividades culturales en Impulso Galería.',
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
    twitter: {
      description:
        'Explora los próximos eventos, exposiciones y actividades culturales en Impulso Galería.',
      images: ['/og-events.jpg'],
      title: 'Eventos - Impulso Galería',
    },
  },
  news: {
    description:
      'Mantente al día con las últimas noticias del mundo del arte, artistas y eventos culturales en Impulso Galería.',
    keywords: [
      'noticias de arte',
      'actualidad cultural',
      'arte contemporáneo',
      'artistas',
      'impulso galería',
      'noticias culturales',
      'tendencias artísticas',
    ],
    openGraph: {
      description:
        'Mantente al día con las últimas noticias del mundo del arte y eventos culturales.',
      images: [
        {
          alt: 'Noticias - Impulso Galería',
          height: 630,
          url: '/og-news.jpg',
          width: 1200,
        },
      ],
      title: 'Noticias - Impulso Galería',
    },
    title: 'Noticias - Impulso Galería',
    twitter: {
      description:
        'Mantente al día con las últimas noticias del mundo del arte y eventos culturales.',
      images: ['/og-news.jpg'],
      title: 'Noticias - Impulso Galería',
    },
  },
}

// Metadatos para rutas de posts individuales
export const generatePostMetadata = (post: {
  title: string
  description?: string
  author?: string
  publishDate?: string
  images?: string[]
  slug: string
  postType: string
}): Metadata => {
  const baseUrl = 'https://impulsogaleria.com'
  const postUrl = `${baseUrl}/${post.postType}/${post.slug}`

  return {
    alternates: {
      canonical: postUrl,
    },
    description:
      post.description ??
      `Descubre "${post.title}" en Impulso Galería. ${postTypeMetadata[post.postType]?.description ?? ''}`,
    keywords: [
      post.title,
      post.author ?? 'Impulso Galería',
      ...(postTypeMetadata[post.postType]?.keywords ?? []),
      'arte contemporáneo',
    ],
    openGraph: {
      authors: post.author ? [post.author] : ['Impulso Galería'],
      description: post.description ?? `Descubre "${post.title}" en Impulso Galería.`,
      images:
        post.images && post.images.length > 0
          ? [
              {
                alt: post.title,
                height: 630,
                url: post.images[0],
                width: 1200,
              },
            ]
          : [
              {
                alt: post.title,
                height: 630,
                url:
                  (postTypeMetadata[post.postType]?.openGraph?.images as { url: string }[])?.[0]
                    ?.url ?? '/og-blog.jpg',
                width: 1200,
              },
            ],
      publishedTime: post.publishDate,
      title: post.title,
      type: 'article',
      url: postUrl,
    },
    title: `${post.title} | ${postTypeMetadata[post.postType]?.title ?? 'Impulso Galería'}`,
    twitter: {
      card: 'summary_large_image',
      description: post.description ?? `Descubre "${post.title}" en Impulso Galería.`,
      images:
        post.images && post.images.length > 0
          ? post.images
          : [
              (postTypeMetadata[post.postType]?.openGraph?.images as { url: string }[])?.[0]?.url ??
                '/og-blog.jpg',
            ],
      title: post.title,
    },
  }
}

// Metadatos para rutas de productos individuales
export const generateProductPageMetadata = (product: {
  title: string
  description?: string
  artist?: string
  price?: number
  images?: string[]
  slug: string
}): Metadata => {
  const baseUrl = 'https://impulsogaleria.com'
  const productUrl = `${baseUrl}/store/${product.slug}`

  return {
    alternates: {
      canonical: productUrl,
    },
    description:
      product.description ??
      `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}. Una obra única de arte contemporáneo disponible en Impulso Galería.`,
    keywords: [
      product.title,
      product.artist ?? 'arte contemporáneo',
      'obra de arte',
      'pintura',
      'escultura',
      'impulso galería',
      'arte para comprar',
      'galería de arte',
    ],
    openGraph: {
      description:
        product.description ??
        `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}. Una obra única de arte contemporáneo.`,
      images:
        product.images && product.images.length > 0
          ? [
              {
                alt: product.title,
                height: 630,
                url: product.images[0],
                width: 1200,
              },
            ]
          : [
              {
                alt: product.title,
                height: 630,
                url: '/og-product.jpg',
                width: 1200,
              },
            ],
      title: `${product.title}${product.artist ? ` por ${product.artist}` : ''}`,
      type: 'website',
      url: productUrl,
    },
    title: `${product.title}${product.artist ? ` por ${product.artist}` : ''} | Impulso Galería`,
    twitter: {
      card: 'summary_large_image',
      description:
        product.description ??
        `Descubre "${product.title}"${product.artist ? ` por ${product.artist}` : ''}.`,
      images: product.images && product.images.length > 0 ? product.images : ['/og-product.jpg'],
      title: `${product.title}${product.artist ? ` por ${product.artist}` : ''}`,
    },
  }
}

// Metadatos para búsquedas
export const generateSearchMetadata = (query?: string): Metadata => {
  const title = query ? `Buscar "${query}" - Impulso Galería` : 'Buscar - Impulso Galería'
  const description = query
    ? `Resultados de búsqueda para "${query}" en Impulso Galería. Encuentra obras de arte, artistas y contenido relacionado.`
    : 'Busca en nuestra colección de arte contemporáneo. Encuentra obras específicas, artistas o estilos que se adapten a tu gusto.'

  return {
    description,
    keywords: [
      'buscar arte',
      'colección de arte',
      'obras de arte',
      'artistas',
      'estilos artísticos',
      'arte contemporáneo',
      'impulso galería',
      ...(query ? [query] : []),
    ],
    openGraph: {
      description,
      images: [
        {
          alt: 'Buscar - Impulso Galería',
          height: 630,
          url: '/og-search.jpg',
          width: 1200,
        },
      ],
      title,
    },
    robots: {
      // Las páginas de búsqueda no deben ser indexadas
      follow: true,
      index: false,
    },
    title,
    twitter: {
      card: 'summary_large_image',
      description,
      images: ['/og-search.jpg'],
      title,
    },
  }
}
