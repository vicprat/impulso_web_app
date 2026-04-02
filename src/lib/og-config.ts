export const ogConfig = {
  dimensions: {
    height: 630,
    width: 1200,
  },
  facebook: {
    appId: process.env.FACEBOOK_APP_ID ?? '',
  },
  images: {
    artist: '/og-artist.jpg',
    artists: '/og-artists.jpg',
    blog: '/og-blog.jpg',
    cart: '/og-cart.jpg',
    default: '/og-image.jpg',
    event: '/og-event.jpg',
    events: '/og-events.jpg',
    gallery: '/og-gallery.jpg',
    home: '/og-home.jpg',
    membership: '/og-membership.jpg',
    news: '/og-news.jpg',
    product: '/og-product.jpg',
    search: '/og-search.jpg',
    services: '/og-services.jpg',
    terms: '/og-terms.jpg',
  },
  instagram: {
    username: 'impulsogaleria',
  },
  locale: 'es_MX',
  siteName: 'Impulso Galería',
  twitter: {
    card: 'summary_large_image',
    creator: '@impulsogaleria',
    site: '@impulsogaleria',
  },
  type: 'website',
}

export const getOgImageUrl = (imagePath: string): string => {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://impulsogaleria.com'
  return imagePath.startsWith('http') ? imagePath : `${baseUrl}${imagePath}`
}

export const generateOgMetadata = (config: {
  title: string
  description: string
  image?: string
  url?: string
  type?: string
  siteName?: string
}) => {
  const {
    description,
    image = ogConfig.images.default,
    siteName = ogConfig.siteName,
    title,
    type = ogConfig.type,
    url,
  } = config

  return {
    description,
    images: [
      {
        alt: title,
        height: ogConfig.dimensions.height,
        url: getOgImageUrl(image),
        width: ogConfig.dimensions.width,
      },
    ],
    locale: ogConfig.locale,
    siteName,
    title,
    type,
    ...(url && { url }),
  }
}

export const generateTwitterMetadata = (config: {
  title: string
  description: string
  image?: string
  creator?: string
}) => {
  const {
    creator = ogConfig.twitter.creator,
    description,
    image = ogConfig.images.default,
    title,
  } = config

  return {
    card: ogConfig.twitter.card,
    creator,
    description,
    images: [getOgImageUrl(image)],
    site: ogConfig.twitter.site,
    title,
  }
}

export const getImageByContentType = (contentType: string): string => {
  const imageMap: Record<string, string> = {
    artist: ogConfig.images.artist,
    artists: ogConfig.images.artists,
    blog: ogConfig.images.blog,
    cart: ogConfig.images.cart,
    event: ogConfig.images.event,
    events: ogConfig.images.events,
    gallery: ogConfig.images.gallery,
    home: ogConfig.images.home,
    membership: ogConfig.images.membership,
    news: ogConfig.images.news,
    product: ogConfig.images.product,
    search: ogConfig.images.search,
    services: ogConfig.images.services,
    terms: ogConfig.images.terms,
  }

  return imageMap[contentType] || ogConfig.images.default
}

export const generateSocialMetadata = (config: {
  title: string
  description: string
  image?: string
  url?: string
  type?: string
  contentType?: string
  creator?: string
}) => {
  const { contentType, creator, description, image, title, type, url } = config

  const finalImage =
    image || (contentType ? getImageByContentType(contentType) : ogConfig.images.default)

  return {
    openGraph: generateOgMetadata({
      description,
      image: finalImage,
      title,
      type,
      url,
    }),
    twitter: generateTwitterMetadata({
      creator,
      description,
      image: finalImage,
      title,
    }),
  }
}
