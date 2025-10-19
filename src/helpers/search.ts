export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function buildFlexibleSearchQuery(searchTerm: string): string {
  if (!searchTerm?.trim()) return ''

  const normalized = normalizeText(searchTerm)
  const words = normalized.split(/\s+/).filter((word) => word.length > 0)

  if (words.length === 0) return ''

  const searchFields = ['title', 'product_type', 'tag', 'vendor']
  const queryParts: string[] = []

  if (words.length === 1) {
    const word = words[0]
    const fieldQueries = searchFields.map((field) => `${field}:*${word}*`)
    queryParts.push(`(${fieldQueries.join(' OR ')})`)
  } else {
    words.forEach((word) => {
      if (word.length >= 2) {
        const fieldQueries = searchFields.map((field) => `${field}:*${word}*`)
        queryParts.push(`(${fieldQueries.join(' OR ')})`)
      }
    })
  }

  return queryParts.join(' OR ')
}

export function buildProductSearchQuery(
  searchTerm: string,
  options?: {
    includeVendor?: boolean
    includeTags?: boolean
    includeProductType?: boolean
    minWordLength?: number
  }
): string {
  if (!searchTerm?.trim()) return ''

  const {
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

  if (words.length === 1) {
    const word = words[0]
    const fieldQueries = searchFields.map((field) => `${field}:*${word}*`)
    queryParts.push(`(${fieldQueries.join(' OR ')})`)
  } else {
    words.forEach((word) => {
      const fieldQueries = searchFields.map((field) => `${field}:*${word}*`)
      queryParts.push(`(${fieldQueries.join(' OR ')})`)
    })
  }

  return queryParts.join(' OR ')
}
