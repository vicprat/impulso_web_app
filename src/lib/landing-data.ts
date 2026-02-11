import { prisma } from '@/lib/prisma'
import { blogService } from '@/modules/blog/service'
import {
  type Category,
  type PaginatedResult,
  type PostFilters,
  type PostWithRelations,
  type Tag,
} from '@/modules/blog/types'
import { api as shopifyApi } from '@/modules/shopify/api'
import { shopifyService, type PublicEvent } from '@/modules/shopify/service'
import { type Product } from '@/modules/shopify/types'
import { type PublicArtist } from '@/modules/user/types'

export async function getPublicArtists(
  artistType?: 'IMPULSO' | 'COLLECTIVE'
): Promise<PublicArtist[]> {
  try {
    const artists = await prisma.user.findMany({
      select: {
        artist: {
          select: {
            artistType: true,
          },
        },
        email: true,
        firstName: true,
        id: true,
        lastName: true,
        profile: {
          select: {
            avatarUrl: true,
            backgroundImageUrl: true,
            bio: true,
            occupation: true,
          },
        },
      },
      where: {
        UserRole: {
          some: {
            role: {
              name: 'artist',
            },
          },
        },
        isPublic: true,
      },
    })

    const filteredArtists = artists.filter((artist) => {
      // Solo filtrar por firstName (debe tener valor no vacío)
      if (!artist.firstName?.trim()) {
        return false
      }

      // Si se especifica artistType, filtrar por ese tipo
      if (artistType && artist.artist?.artistType !== artistType) {
        return false
      }

      return true
    })

    return filteredArtists as PublicArtist[]
  } catch (error) {
    console.error('Error fetching public artists:', error)
    return []
  }
}

export async function getPublicProfile(userId: string) {
  try {
    const userProfile = await prisma.user.findUnique({
      include: {
        UserRole: {
          include: {
            role: true,
          },
        },
        artist: true,
        links: true,
        profile: true,
      },
      where: {
        id: userId,
        isPublic: true,
      },
    })

    if (!userProfile || !userProfile.firstName) {
      return null
    }

    const roles = userProfile.UserRole.map((ur) => ur.role.name)

    let products: Product[] = []
    if (roles.includes('artist') && userProfile.artist?.name) {
      try {
        const productData = await shopifyApi.getProducts({
          filters: { vendor: [userProfile.artist.name] },
          first: 10,
        })
        products = productData.data.products
      } catch (productError) {
        console.error('Error fetching products for artist:', productError)
      }
    }

    return {
      ...userProfile,
      products,
      roles,
    }
  } catch (error) {
    console.error('Error fetching public artist profile:', error)
    return null
  }
}

export async function getPublicProducts(): Promise<Product[]> {
  try {
    const response = await shopifyService.getPublicProducts({
      first: 8,
      reverse: true,
      sortKey: 'CREATED_AT',
    })
    return response.data.products
  } catch (error) {
    console.error('Error fetching public products:', error)
    return []
  }
}

export async function getPublicEvents(): Promise<PublicEvent[]> {
  try {
    return await shopifyService.getPublicEvents({
      first: 6,
    })
  } catch (error) {
    console.error('Error fetching public events:', error)
    return []
  }
}

export async function getBlogPosts(): Promise<PaginatedResult<PostWithRelations>> {
  try {
    return await blogService.listPosts({
      page: 1,
      pageSize: 4,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
      status: 'PUBLISHED',
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return {
      hasNextPage: false,
      hasPreviousPage: false,
      items: [],
      page: 1,
      pageSize: 4,
      total: 0,
      totalPages: 0,
    }
  }
}

export async function getEventPosts(): Promise<PostWithRelations[]> {
  try {
    const result = await blogService.listPosts({
      page: 1,
      pageSize: 6,
      postType: 'EVENT',
      sortBy: 'publishedAt',
      sortOrder: 'desc',
      status: 'PUBLISHED',
    })
    return result.items
  } catch (error) {
    console.error('Error fetching event posts:', error)
    return []
  }
}

export async function getPosts(
  filters: Partial<PostFilters> = {}
): Promise<PaginatedResult<PostWithRelations>> {
  try {
    return await blogService.listPosts(filters)
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return {
      hasNextPage: false,
      hasPreviousPage: false,
      items: [],
      page: 1,
      pageSize: 12,
      total: 0,
      totalPages: 0,
    }
  }
}

export async function getBlogCategories(): Promise<Category[]> {
  try {
    return await blogService.listCategories()
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

export async function getBlogTags(): Promise<Tag[]> {
  try {
    return await blogService.listTags()
  } catch (error) {
    console.error('Error fetching blog tags:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<PostWithRelations | null> {
  try {
    return await blogService.getPostBySlug(slug)
  } catch (error) {
    console.error('Error fetching blog post by slug:', error)
    return null
  }
}

// Notion Content Services
export {
  getBenefits,
  getCarouselSlides,
  getFeatures,
  getServices,
  getTermsSections,
} from './services/notion-content.service'
