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
    includePrice?: boolean
    includeProductType?: boolean
    includeTags?: boolean
    includeTechnique?: boolean
    includeVendor?: boolean
    includeYear?: boolean
    minWordLength?: number
  }
): string {
  if (!searchTerm?.trim()) return ''

  const {
    includePrice = true,
    includeProductType = true,
    includeTags = true,
    includeTechnique = true,
    includeVendor = true,
    includeYear = true,
    minWordLength = 2,
  } = options ?? {}

  // Usar tanto el término original como el normalizado para búsqueda flexible
  const originalTerm = searchTerm.trim().toLowerCase()
  const normalizedTerm = normalizeText(searchTerm)

  const words = normalizedTerm.split(/\s+/).filter((word) => word.length >= minWordLength)
  const originalWords = originalTerm.split(/\s+/).filter((word) => word.length >= minWordLength)

  if (words.length === 0) return ''

  const searchFields: string[] = ['title']
  if (includeProductType) searchFields.push('product_type')
  if (includeTags) searchFields.push('tag')
  if (includeVendor) searchFields.push('vendor')

  const queryParts: string[] = []

  if (words.length === 1) {
    const word = words[0]
    const originalWord = originalWords[0]

    // Crear queries tanto con el término original como normalizado
    const fieldQueries: string[] = []

    searchFields.forEach((field) => {
      fieldQueries.push(`${field}:*${originalWord}*`)
      if (originalWord !== word) {
        fieldQueries.push(`${field}:*${word}*`)
      }
    })

    // Agregar búsqueda en metafields de técnica (medium)
    if (includeTechnique) {
      fieldQueries.push(`metafields.art_details.medium:*${originalWord}*`)
      if (originalWord !== word) {
        fieldQueries.push(`metafields.art_details.medium:*${word}*`)
      }
    }

    // Agregar búsqueda en metafields de año
    if (includeYear) {
      fieldQueries.push(`metafields.art_details.year:*${originalWord}*`)
      if (originalWord !== word) {
        fieldQueries.push(`metafields.art_details.year:*${word}*`)
      }
    }

    // Agregar búsqueda en precio (variants)
    if (includePrice) {
      fieldQueries.push(`variants.price:*${originalWord}*`)
      if (originalWord !== word) {
        fieldQueries.push(`variants.price:*${word}*`)
      }
    }

    queryParts.push(`(${fieldQueries.join(' OR ')})`)
  } else {
    words.forEach((word, index) => {
      const originalWord = originalWords[index]
      const fieldQueries: string[] = []

      searchFields.forEach((field) => {
        fieldQueries.push(`${field}:*${originalWord}*`)
        if (originalWord !== word) {
          fieldQueries.push(`${field}:*${word}*`)
        }
      })

      // Agregar búsqueda en metafields de técnica (medium)
      if (includeTechnique) {
        fieldQueries.push(`metafields.art_details.medium:*${originalWord}*`)
        if (originalWord !== word) {
          fieldQueries.push(`metafields.art_details.medium:*${word}*`)
        }
      }

      // Agregar búsqueda en metafields de año
      if (includeYear) {
        fieldQueries.push(`metafields.art_details.year:*${originalWord}*`)
        if (originalWord !== word) {
          fieldQueries.push(`metafields.art_details.year:*${word}*`)
        }
      }

      // Agregar búsqueda en precio (variants)
      if (includePrice) {
        fieldQueries.push(`variants.price:*${originalWord}*`)
        if (originalWord !== word) {
          fieldQueries.push(`variants.price:*${word}*`)
        }
      }

      queryParts.push(`(${fieldQueries.join(' OR ')})`)
    })
  }

  return queryParts.join(' OR ')
}
