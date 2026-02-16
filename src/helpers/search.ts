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
    // Para cada palabra, construimos una sub-query que busca esa palabra en CUALQUIERA de los campos
    const fieldQueries: string[] = []

    searchFields.forEach((field) => {
      // Para títulos, usar búsqueda más flexible con wildcards
      // Shopify es case-insensitive por defecto
      if (field === 'title') {
        fieldQueries.push(`${field}:*${word}*`)
      } else {
        fieldQueries.push(`${field}:*${word}*`)
      }
    })

    // Agregar búsqueda por ID si está habilitada y la palabra parece un número
    if (includeId) {
      const numericId = word.replace(/\D/g, '')
      if (numericId.length > 0) {
        fieldQueries.push(`id:${numericId}`)
      }
    }

    // Nota: Eliminamos búsquedas en metafields y variants.price aquí porque Shopify
    // no soporta wildcards consistentemente en esos campos via API search string.
    // El filtrado fino de esos campos se hace en memoria via matchesSearch().

    // Unimos los campos con OR: (title:*word* OR vendor:*word* OR ...)
    queryParts.push(`(${fieldQueries.join(' OR ')})`)
  })

  // Unimos las palabras con AND: (palabra1 en campos) AND (palabra2 en campos)
  // Esto asegura que el resultado contenga TODAS las palabras buscadas.
  if (queryParts.length > 1) {
    return queryParts.join(' AND ')
  }

  return queryParts[0] ?? ''
}

/**
 * Verifica si un producto coincide con los términos de búsqueda en memoria.
 * Esta función es crucial para filtrar campos que Shopify no soporta bien en su query string
 * (como metafields con wildcards) y para asegurar coincidencia exacta de todas las palabras.
 */
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

  // Cada palabra de la búsqueda debe estar presente en AL MENOS UN campo del producto
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

    // Agregar dimensiones como string buscable (ej: "50 x 70", "50x70")
    if (product.artworkDetails.height && product.artworkDetails.width) {
      fields.push(`${product.artworkDetails.height} x ${product.artworkDetails.width}`)
      fields.push(`${product.artworkDetails.height}x${product.artworkDetails.width}`)
    }

    // Agregar colecciones
    if (product.collections) {
      product.collections.forEach((c) => {
        if (typeof c === 'string') {
          fields.push(c)
        } else if (c && typeof c === 'object' && 'title' in c) {
          fields.push(c.title)
        }
      })
    }

    // Agregar datos de variantes: precio, SKU, inventario
    if (product.variants) {
      product.variants.forEach((v) => {
        // Precio como string para búsqueda (ej: buscar "1500" o "1,500")
        if (v.price) {
          const priceStr = typeof v.price === 'string' ? v.price : v.price.amount
          if (priceStr) fields.push(priceStr)
        }
        if (v.sku) fields.push(v.sku)
        if (v.inventoryQuantity !== undefined) fields.push(String(v.inventoryQuantity))
      })
    }

    // Buscamos la palabra en cualquiera de los campos normalizados
    return fields.some((field) => (field ? normalizeText(field).includes(word) : false))
  })
}
