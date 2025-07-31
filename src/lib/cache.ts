import { revalidateTag } from 'next/cache'

export class CacheManager {
  // Tags para productos
  static readonly PRODUCT_TAGS = {
    all: 'products',
    byId: (id: string) => `product-${id}`,
    byHandle: (handle: string) => `product-handle-${handle}`,
    byVendor: (vendor: string) => `products-vendor-${vendor}`,
  }

  // Tags para colecciones
  static readonly COLLECTION_TAGS = {
    all: 'collections',
    byHandle: (handle: string) => `collection-${handle}`,
  }

  // Tags para artistas
  static readonly ARTIST_TAGS = {
    all: 'artists',
    byId: (id: string) => `artist-${id}`,
  }

  // Tags para inventario
  static readonly INVENTORY_TAGS = {
    all: 'inventory',
    byProductId: (productId: string) => `inventory-${productId}`,
  }

  // Tags para página principal
  static readonly HOMEPAGE_TAGS = {
    all: 'homepage',
    featured: 'homepage-featured',
  }

  // Revalidar cache de productos
  static revalidateProducts(productId?: string, handle?: string, vendor?: string) {
    revalidateTag(this.PRODUCT_TAGS.all)
    
    if (productId) {
      revalidateTag(this.PRODUCT_TAGS.byId(productId))
    }
    
    if (handle) {
      revalidateTag(this.PRODUCT_TAGS.byHandle(handle))
    }
    
    if (vendor) {
      revalidateTag(this.PRODUCT_TAGS.byVendor(vendor))
    }
  }

  // Revalidar cache de inventario
  static revalidateInventory(productId?: string) {
    revalidateTag(this.INVENTORY_TAGS.all)
    
    if (productId) {
      revalidateTag(this.INVENTORY_TAGS.byProductId(productId))
    }
  }

  // Revalidar cache de artistas
  static revalidateArtists(artistId?: string) {
    revalidateTag(this.ARTIST_TAGS.all)
    
    if (artistId) {
      revalidateTag(this.ARTIST_TAGS.byId(artistId))
    }
  }

  // Revalidar cache de colecciones
  static revalidateCollections(handle?: string) {
    revalidateTag(this.COLLECTION_TAGS.all)
    
    if (handle) {
      revalidateTag(this.COLLECTION_TAGS.byHandle(handle))
    }
  }

  // Revalidar cache de página principal
  static revalidateHomepage() {
    revalidateTag(this.HOMEPAGE_TAGS.all)
    revalidateTag(this.HOMEPAGE_TAGS.featured)
  }

  // Revalidar todo el cache relacionado con un producto
  static revalidateProductCache(product: {
    id: string
    handle: string
    vendor?: string
  }) {
    this.revalidateProducts(product.id, product.handle, product.vendor)
    this.revalidateInventory(product.id)
    this.revalidateCollections()
    this.revalidateHomepage()
    
    if (product.vendor) {
      this.revalidateArtists()
    }
  }
} 