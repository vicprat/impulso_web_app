export function normalizeText(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function buildProductSearchQuery(
  searchTerm: string,
  options?: {
    includeId?: boolean
    includeProductType?: boolean
    includeTags?: boolean
    includeVendor?: boolean
    minWordLength?: number
  }
): string {
  if (!searchTerm?.trim()) return ''

  const {
    includeId = true,
    includeProductType = true,
    includeTags = true,
    includeVendor = true,
    minWordLength = 2,
  } = options ?? {}

  const normalized = normalizeText(searchTerm)
  const words = normalized.split(/\s+/).filter((word) => word.length >= minWordLength)

  if (words.length === 0) return ''

  const searchFields: string[] = ['title']
  if (includeProductType) searchFields.push('product_type')
  if (includeTags) searchFields.push('tag')
  if (includeVendor) searchFields.push('vendor')

  const queryParts: string[] = []

  words.forEach((word) => {
    const fieldQueries: string[] = []

    searchFields.forEach((field) => {
      if (field === 'title') {
        fieldQueries.push(`${field}:*${word}*`)
      } else {
        fieldQueries.push(`${field}:*${word}*`)
      }
    })

    if (includeId) {
      const numericId = word.replace(/\D/g, '')
      if (numericId.length > 0) {
        fieldQueries.push(`id:${numericId}`)
      }
    }

    queryParts.push(`(${fieldQueries.join(' OR ')})`)
  })

  if (queryParts.length > 1) {
    return queryParts.join(' AND ')
  }

  return queryParts[0] ?? ''
}

export function matchesSearch(
  product: {
    id: string
    title: string
    vendor: string
    productType: string
    status?: string
    tags: string[]
    artworkDetails: {
      height?: number | string | null
      medium?: string | null
      serie?: string | null
      location?: string | null
      width?: number | string | null
      year?: string | null
    }
    collections?: { title: string }[] | string[]
    variants?: {
      inventoryQuantity?: number | null
      price?: { amount?: string } | string
      sku?: string | null
    }[]
  },
  searchTerm: string
): boolean {
  if (!searchTerm?.trim()) return true

  const searchWords = normalizeText(searchTerm)
    .split(/\s+/)
    .filter((w) => w.length >= 1)

  if (searchWords.length === 0) return true

  return searchWords.every((word) => {
    const fields: (string | null | undefined)[] = [
      product.id.split('/').pop() ?? product.id,
      product.title,
      product.vendor,
      product.productType,
      product.status,
      product.artworkDetails.medium,
      product.artworkDetails.year,
      product.artworkDetails.serie,
      product.artworkDetails.location,
      ...product.tags,
    ]

    if (product.artworkDetails.height && product.artworkDetails.width) {
      fields.push(`${product.artworkDetails.height} x ${product.artworkDetails.width}`)
      fields.push(`${product.artworkDetails.height}x${product.artworkDetails.width}`)
    }

    if (product.collections) {
      product.collections.forEach((c) => {
        if (typeof c === 'string') {
          fields.push(c)
        } else if (c && typeof c === 'object' && 'title' in c) {
          fields.push(c.title)
        }
      })
    }

    if (product.variants) {
      product.variants.forEach((v) => {
        if (v.price) {
          const priceStr = typeof v.price === 'string' ? v.price : v.price.amount
          if (priceStr) fields.push(priceStr)
        }
        if (v.sku) fields.push(v.sku)
        if (v.inventoryQuantity !== undefined) fields.push(String(v.inventoryQuantity))
      })
    }

    return fields.some((field) => (field ? normalizeText(field).includes(word) : false))
  })
}
