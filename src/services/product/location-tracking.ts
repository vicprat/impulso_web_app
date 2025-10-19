import { prisma } from '@/src/lib/prisma'

export interface CreateLocationHistoryInput {
  productId: string
  shopifyGid: string
  locationId?: string | null
  changedBy?: string
  notes?: string
  title?: string
  handle?: string
  vendor?: string
}

export interface LocationHistoryEntry {
  id: string
  productId: string
  locationId: string | null
  changedAt: Date
  changedBy: string | null
  notes: string | null
  location: {
    id: string
    name: string
  } | null
}

export const locationTrackingService = {
  async createLocationHistory(input: CreateLocationHistoryInput) {
    const numericId = input.shopifyGid.split('/').pop()
    if (!numericId) {
      throw new Error('Invalid Shopify GID')
    }

    await this.ensureProduct(input)

    const product = await prisma.product.findUnique({
      include: {
        currentLocation: true,
      },
      where: { id: numericId },
    })

    if (product?.currentLocation?.id === input.locationId) {
      return null
    }

    const [history] = await prisma.$transaction([
      prisma.locationHistory.create({
        data: {
          changedBy: input.changedBy,
          locationId: input.locationId,
          notes: input.notes,
          productId: numericId,
        },
        include: {
          location: true,
        },
      }),
      prisma.product.update({
        data: {
          currentLocationId: input.locationId,
          handle: input.handle || product?.handle,
          title: input.title || product?.title,
          vendor: input.vendor || product?.vendor,
        },
        where: { id: numericId },
      }),
    ])

    return history
  },

  async ensureProduct(input: CreateLocationHistoryInput) {
    const numericId = input.shopifyGid.split('/').pop()
    if (!numericId) {
      throw new Error('Invalid Shopify GID')
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: numericId },
    })

    if (existingProduct) {
      return existingProduct
    }

    return prisma.product.create({
      data: {
        handle: input.handle,
        id: numericId,
        shopifyGid: input.shopifyGid,
        title: input.title,
        vendor: input.vendor,
      },
    })
  },

  async getCurrentLocation(productId: string) {
    const numericId = productId.includes('/') ? productId.split('/').pop() : productId
    if (!numericId) {
      throw new Error('Invalid product ID')
    }

    const product = await prisma.product.findUnique({
      include: {
        currentLocation: true,
      },
      where: { id: numericId },
    })

    return product?.currentLocation || null
  },

  async getProductLocationHistory(productId: string): Promise<LocationHistoryEntry[]> {
    const numericId = productId.includes('/') ? productId.split('/').pop() : productId
    if (!numericId) {
      throw new Error('Invalid product ID')
    }

    const history = await prisma.locationHistory.findMany({
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        changedAt: 'desc',
      },
      where: {
        productId: numericId,
      },
    })

    return history
  },

  async updateProductInfo(
    shopifyGid: string,
    data: {
      title?: string
      handle?: string
      vendor?: string
    }
  ) {
    const numericId = shopifyGid.split('/').pop()
    if (!numericId) {
      throw new Error('Invalid Shopify GID')
    }

    return prisma.product.upsert({
      create: {
        handle: data.handle,
        id: numericId,
        shopifyGid,
        title: data.title,
        vendor: data.vendor,
      },
      update: {
        handle: data.handle,
        title: data.title,
        vendor: data.vendor,
      },
      where: { id: numericId },
    })
  },
}
