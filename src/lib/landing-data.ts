import { prisma } from '@/lib/prisma'
import { blogService } from '@/modules/blog/service'
import { type PaginatedResult, type PostWithRelations } from '@/modules/blog/types'
import { shopifyService } from '@/modules/shopify/service'
import { type Product } from '@/modules/shopify/types'
import { type PublicArtist } from '@/modules/user/types'

export async function getPublicArtists(): Promise<PublicArtist[]> {
  try {
    const artists = await prisma.user.findMany({
      select: {
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

    // Filtrar artistas que tengan firstName y lastName válidos
    return artists.filter((artist) => artist.firstName && artist.lastName) as PublicArtist[]
  } catch (error) {
    console.error('Error fetching public artists:', error)
    return []
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

export async function getPublicEvents(): Promise<any[]> {
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
