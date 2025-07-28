// Configuración de imágenes para Open Graph
export const OG_IMAGES = {
  HOME: '/og-home.jpg',
  ARTISTS: '/og-artists.jpg',
  GALLERY: '/og-gallery.jpg',
  EVENTS: '/og-events.jpg',
  CART: '/og-cart.jpg',
  SEARCH: '/og-search.jpg',
  ARTIST: '/og-artist.jpg',
  PRODUCT: '/og-product.jpg',
  EVENT: '/og-event.jpg',
  DEFAULT: '/og-image.jpg',
} as const

// Función para generar URLs de imágenes OG
export function getOGImageUrl(imagePath: string): string {
  const baseUrl = 'https://impulsogaleria.com'
  return `${baseUrl}${imagePath}`
}

// Función para obtener la imagen OG según la ruta
export function getOGImageForRoute(pathname: string): string {
  switch (pathname) {
    case '/':
      return OG_IMAGES.HOME
    case '/artists':
      return OG_IMAGES.ARTISTS
    case '/store':
      return OG_IMAGES.GALLERY
    case '/events':
      return OG_IMAGES.EVENTS
    case '/store/cart':
      return OG_IMAGES.CART
    case '/store/search':
      return OG_IMAGES.SEARCH
    default:
      if (pathname.startsWith('/artists/')) {
        return OG_IMAGES.ARTIST
      }
      if (pathname.startsWith('/store/product/')) {
        return OG_IMAGES.PRODUCT
      }
      if (pathname.startsWith('/store/event/')) {
        return OG_IMAGES.EVENT
      }
      return OG_IMAGES.DEFAULT
  }
} 