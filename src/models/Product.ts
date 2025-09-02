const ARTWORK_METAFIELD_NAMESPACE = 'art_details'

export interface Money {
  amount: string
  currencyCode: string
}

export interface Image {
  id?: string
  url: string
  altText: string | null
  width?: number
  height?: number
}

export interface MediaNode {
  id: string
  mediaContentType: string
  status: string
  image?: {
    id: string
    url: string
    altText: string | null
    width?: number
    height?: number
  }
}

export interface Variant {
  id: string
  title: string
  availableForSale: boolean
  price: Money
  compareAtPrice: Money | null
  sku: string | null
  selectedOptions: {
    name: string
    value: string
  }[]
  inventoryQuantity: number | null
  inventoryManagement: 'SHOPIFY' | 'NOT_MANAGED' | null
  inventoryPolicy: 'DENY' | 'CONTINUE'
}

interface ShopifyMetafieldNode {
  namespace: string
  key: string
  value: string
}

interface ShopifyVariantNode {
  id: string
  title: string
  availableForSale: boolean
  price: string
  sku: string | null
  inventoryQuantity: number | null
  inventoryPolicy: 'DENY' | 'CONTINUE'
  inventoryItem: {
    tracked: boolean
  }
}

interface ShopifyProductData {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  vendor: string
  productType: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  tags: string[]
  images: {
    edges: { node: Image }[]
  }
  media: {
    nodes: MediaNode[]
  }
  variants: {
    edges: { node: ShopifyVariantNode }[]
  }
  metafields: {
    edges: { node: ShopifyMetafieldNode }[]
  }
}

interface ShopifyMetafieldInput {
  namespace: string
  key: string
  value: string
  type: string
}

interface ShopifyVariantInput {
  id?: string
  price: string
  sku: string | null
  inventoryItem?: { tracked: boolean }
  inventoryQuantities?: {
    availableQuantity: number
    locationId: string
  }[]
  inventoryPolicy?: 'DENY' | 'CONTINUE'
}

interface ShopifyProductInput {
  id?: string
  title: string
  descriptionHtml: string
  vendor: string
  productType: string
  tags: string[]
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  variants: ShopifyVariantInput[]
  metafields?: ShopifyMetafieldInput[]
}

interface ShopifyInputPayloads {
  updatePayload: { input: ShopifyProductInput }
  createPayload: { input: Omit<ShopifyProductInput, 'id'> }
  metafieldsPayload: { productId: string; metafields: ShopifyMetafieldInput[] }
}

export interface ArtworkDetails {
  artist: string | null
  medium: string | null
  year: string | null
  height: string | null
  width: string | null
  depth: string | null
  serie: string | null
  location: string | null
}

interface DescriptionField {
  key: keyof ArtworkDetails | 'vendor' | 'productType'
  label: string
  formatter?: (product: Product) => string
}

interface FormatRule {
  minSize: number
  tag: string
}

interface TagRule {
  condition: (product: Product) => boolean
  getValue: (product: Product) => string | string[]
}

const DESCRIPTION_FIELDS: DescriptionField[] = [
  { key: 'vendor', label: 'Artista' },
  { key: 'medium', label: 'Técnica' },
  { key: 'productType', label: 'Tipo' },
  {
    formatter: (product: Product) => {
      return [
        product.artworkDetails.height,
        product.artworkDetails.width,
        product.artworkDetails.depth,
      ]
        .filter(Boolean)
        .join(' x ')
    },
    key: 'height',
    label: 'Medidas (cm)',
  },
  { key: 'year', label: 'Año' },
  { key: 'location', label: 'Localización' },
]

const FORMAT_RULES: FormatRule[] = [
  { minSize: 150, tag: 'Formato Grande' },
  { minSize: 100, tag: 'Formato Mediano' },
  { minSize: 50, tag: 'Formato Pequeño' },
  { minSize: 0, tag: 'Formato Miniatura' },
]

const AUTO_TAG_RULES: TagRule[] = [
  {
    condition: (product) => !!product.vendor,
    getValue: (product) => product.vendor.trim(),
  },
  {
    condition: (product) => !!product.productType,
    getValue: (product) => product.productType.trim(),
  },
  {
    condition: (product) => !!product.artworkDetails.year,
    getValue: (product) => product.artworkDetails.year!.trim(),
  },
  {
    condition: (product) => !!product.artworkDetails.location,
    getValue: (product) => {
      const locationHandle = product.artworkDetails
        .location!.trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
      return `locacion-${locationHandle}`
    },
  },
  {
    condition: (product) => product.status === 'ACTIVE',
    getValue: () => 'Disponible',
  },
]

export class Product {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  productType: string
  vendor: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  images: Image[]
  media: MediaNode[]
  variants: Variant[]
  tags: string[]
  manualTags: string[] = []
  autoTags: string[] = []
  artworkDetails: ArtworkDetails
  private primaryLocationId: string

  constructor(shopifyProductData: ShopifyProductData, primaryLocationId: string) {
    this.id = shopifyProductData.id
    this.handle = shopifyProductData.handle
    this.title = shopifyProductData.title
    this.descriptionHtml = shopifyProductData.descriptionHtml || ''
    this.vendor = shopifyProductData.vendor
    this.productType = shopifyProductData.productType
    this.status = shopifyProductData.status
    this.tags = shopifyProductData.tags
    this.images = shopifyProductData.images.edges.map((edge) => edge.node)
    this.media = shopifyProductData.media.nodes

    this.variants = shopifyProductData.variants.edges.map((edge) =>
      this._convertVariantFromApi(edge.node)
    )

    this.primaryLocationId = primaryLocationId
    this.artworkDetails = this._parseDetailsFromMetafields(shopifyProductData.metafields.edges)
    this._parseTags()

    // Extraer información de los tags después de que se procesen
    this._extractInfoFromTags()
  }

  private _convertVariantFromApi(apiVariant: ShopifyVariantNode): Variant {
    return {
      availableForSale: apiVariant.availableForSale,
      compareAtPrice: null,
      id: apiVariant.id,
      inventoryManagement: apiVariant.inventoryItem.tracked ? 'SHOPIFY' : 'NOT_MANAGED',
      inventoryPolicy: apiVariant.inventoryPolicy,
      inventoryQuantity: apiVariant.inventoryQuantity,
      price: {
        amount: apiVariant.price,
        currencyCode: 'MXN',
      },
      selectedOptions: [],
      sku: apiVariant.sku,
      title: apiVariant.title,
    }
  }

  private _parseDetailsFromMetafields(
    metafieldEdges: { node: ShopifyMetafieldNode }[]
  ): ArtworkDetails {
    const details: Partial<ArtworkDetails> = {}

    for (const { node } of metafieldEdges) {
      // Procesar metafields con namespace art_details
      if (node.namespace === ARTWORK_METAFIELD_NAMESPACE) {
        const validKeys = [
          'medium',
          'year',
          'height',
          'width',
          'depth',
          'serie',
          'location',
          'artist',
        ]
        const isValidKey = validKeys.includes(node.key)

        if (isValidKey) {
          ;(details as Record<string, string | null>)[node.key] = node.value
        }
      }

      // Procesar metafields con namespace global y clave description_tag
      if (node.namespace === 'global' && node.key === 'description_tag') {
        const parsedDetails = this._parseDescriptionTag(node.value)
        Object.assign(details, parsedDetails)
      }
    }

    // Si no hay detalles de metafields, intentar extraer del descriptionHtml
    if (Object.keys(details).length === 0 && this.descriptionHtml) {
      const htmlDetails = this._parseDescriptionHtml()
      Object.assign(details, htmlDetails)
    }

    const finalDetails = {
      artist: details.artist || null,
      depth: details.depth || null,
      height: details.height || null,
      location: details.location || null,
      medium: details.medium || null,
      serie: details.serie || null,
      width: details.width || null,
      year: details.year || null,
    }

    return finalDetails
  }

  private _extractInfoFromTags(): void {
    // Extraer localización de los tags automáticos si no está en artworkDetails
    if (!this.artworkDetails.location && this.autoTags) {
      const locationTag = this.autoTags.find((tag) => tag.startsWith('locacion-'))
      if (locationTag) {
        // Convertir "locacion-impulso-galería" a "Impulso Galería"
        const locationName = locationTag
          .replace('locacion-', '')
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

        this.artworkDetails.location = locationName
      }
    }

    // Extraer año de los tags automáticos si no está en artworkDetails
    if (!this.artworkDetails.year && this.autoTags) {
      const yearTag = this.autoTags.find((tag) => /^\d{4}$/.test(tag))
      if (yearTag) {
        this.artworkDetails.year = yearTag
      }
    }
  }

  private _parseDescriptionTag(descriptionTag: string): Partial<ArtworkDetails> {
    const details: Partial<ArtworkDetails> = {}

    // Buscar patrones en el texto - mejorados para capturar correctamente
    const patterns = {
      artist: /Artist:\s*([^M]+?)(?=Medium|Dimensions|Year|Location|Serie|$)/i,
      dimensions: /Dimensions:\s*([^Y]+?)(?=Year|Location|Serie|$)/i,
      location: /Location:\s*([^A-Z]+?)(?=Serie|$)/i,
      medium: /Medium:\s*([^D]+?)(?=Dimensions|Year|Location|Serie|$)/i,
      serie: /Serie:\s*([^A-Z]+?)(?=$)/i,
      year: /Year:\s*(\d{4})/i,
    }

    // Extraer artist
    const artistMatch = descriptionTag.match(patterns.artist)
    if (artistMatch) {
      details.artist = artistMatch[1].trim()
    }

    // Extraer medium
    const mediumMatch = descriptionTag.match(patterns.medium)
    if (mediumMatch) {
      details.medium = mediumMatch[1].trim()
    }

    // Extraer dimensions
    const dimensionsMatch = descriptionTag.match(patterns.dimensions)
    if (dimensionsMatch) {
      const dimensionsText = dimensionsMatch[1].trim()

      // Parsear dimensiones (ej: "46.0h x 61.0w")
      const dimensionPattern = /(\d+(?:\.\d+)?)(?:h|H)\s*x\s*(\d+(?:\.\d+)?)(?:w|W)/
      const dimensionMatch = dimensionsText.match(dimensionPattern)

      if (dimensionMatch) {
        details.height = dimensionMatch[1]
        details.width = dimensionMatch[2]
      }
    }

    // Extraer year
    const yearMatch = descriptionTag.match(patterns.year)
    if (yearMatch) {
      details.year = yearMatch[1]
    }

    // Extraer location
    const locationMatch = descriptionTag.match(patterns.location)
    if (locationMatch) {
      details.location = locationMatch[1].trim()
    }

    // Extraer serie
    const serieMatch = descriptionTag.match(patterns.serie)
    if (serieMatch) {
      details.serie = serieMatch[1].trim()
    }

    return details
  }

  private _parseDescriptionHtml(): Partial<ArtworkDetails> {
    const details: Partial<ArtworkDetails> = {}

    // Buscar patrones en el HTML
    const patterns = {
      artist: /<strong>Artista:<\/strong>\s*([^<]+)/i,
      dimensions: /<strong>Medidas[^<]*:<\/strong>\s*([^<]+)/i,
      location: /<strong>Localización:<\/strong>\s*([^<]+)/i,
      medium: /<strong>Técnica:<\/strong>\s*([^<]+)/i,
      serie: /<strong>Serie:<\/strong>\s*([^<]+)/i,
      year: /<strong>Año:<\/strong>\s*(\d{4})/i,
    }

    // Extraer artist
    const artistMatch = this.descriptionHtml.match(patterns.artist)
    if (artistMatch) {
      details.artist = artistMatch[1].trim()
    }

    // Extraer medium
    const mediumMatch = this.descriptionHtml.match(patterns.medium)
    if (mediumMatch) {
      details.medium = mediumMatch[1].trim()
    }

    // Extraer dimensions
    const dimensionsMatch = this.descriptionHtml.match(patterns.dimensions)
    if (dimensionsMatch) {
      const dimensionsText = dimensionsMatch[1].trim()

      // Parsear dimensiones (ej: "46.0h x 61.0w" o "100 x 150")
      const dimensionPattern = /(\d+(?:\.\d+)?)(?:h|H)?\s*x\s*(\d+(?:\.\d+)?)(?:w|W)?/
      const dimensionMatch = dimensionsText.match(dimensionPattern)

      if (dimensionMatch) {
        details.height = dimensionMatch[1]
        details.width = dimensionMatch[2]
      }
    }

    // Extraer year
    const yearMatch = this.descriptionHtml.match(patterns.year)
    if (yearMatch) {
      details.year = yearMatch[1]
    }

    // Extraer location
    const locationMatch = this.descriptionHtml.match(patterns.location)
    if (locationMatch) {
      details.location = locationMatch[1].trim()
    }

    // Extraer serie
    const serieMatch = this.descriptionHtml.match(patterns.serie)
    if (serieMatch) {
      details.serie = serieMatch[1].trim()
    }

    return details
  }

  private _parseTags(): void {
    // Siempre inicializar arrays, incluso si no hay tags
    this.autoTags = []
    this.manualTags = []

    if (this.tags.length === 0) {
      return
    }

    const artists = this.vendor ? [this.vendor] : []
    const types = this.productType ? [this.productType] : []

    this.autoTags = this.tags.filter((tag) => isAutoTag(tag, artists, types))
    this.manualTags = this.tags.filter((tag) => !isAutoTag(tag, artists, types))
  }

  private _generateDescription(): string {
    const mainDescription = (this.descriptionHtml || '')
      .split('<ul>')[0]
      .trim()
      .replace(/<p>|<\/p>/g, '')
    const parts: string[] = []

    if (mainDescription) {
      parts.push(`<p>${mainDescription}</p>`)
    }

    const detailsList = DESCRIPTION_FIELDS.map((field) => {
      const value =
        field.key === 'vendor'
          ? this.vendor
          : field.key === 'productType'
            ? this.productType
            : this.artworkDetails[field.key as keyof ArtworkDetails]

      if (!value) return null

      const displayValue = field.formatter ? field.formatter(this) : value
      return displayValue ? `<li><strong>${field.label}:</strong> ${displayValue}</li>` : null
    }).filter(Boolean)

    if (detailsList.length > 0) {
      parts.push(`<ul>${detailsList.join('')}</ul>`)
    }

    return parts.join('\n\n')
  }

  private _generateAutoTags(): Set<string> {
    const autoTags = new Set<string>()

    AUTO_TAG_RULES.forEach((rule) => {
      if (rule.condition(this)) {
        const values = rule.getValue(this)
        const tags = Array.isArray(values) ? values : [values]
        tags.forEach((tag) => autoTags.add(tag))
      }
    })

    const formatTag = this._getFormatTag()
    if (formatTag) autoTags.add(formatTag)

    const materialTags = this._getMaterialTags()
    materialTags.forEach((tag) => autoTags.add(tag))

    return autoTags
  }

  private _getFormatTag(): string | null {
    const height = parseFloat(this.artworkDetails.height ?? '0')
    const width = parseFloat(this.artworkDetails.width ?? '0')

    if (height === 0 && width === 0) return null

    const maxDimension = Math.max(height, width)
    const rule = FORMAT_RULES.find((rule) => maxDimension >= rule.minSize)
    return rule?.tag ?? null
  }

  private _getMaterialTags(): string[] {
    const fullText = normalizeString(
      `${this.artworkDetails.medium ?? ''} ${this.productType || ''}`
    )
    return Object.entries(materialKeywords)
      .filter(([keyword]) => fullText.includes(keyword))
      .map(([, tag]) => tag)
  }

  public get primaryImage(): Image | null {
    return this.images.length > 0 ? this.images[0] : null
  }

  public get primaryVariant(): Variant | null {
    return this.variants.length > 0 ? this.variants[0] : null
  }

  public get formattedPrice(): string {
    const variant = this.primaryVariant
    if (!variant) return 'Sin precio'
    return `$${parseFloat(variant.price.amount).toLocaleString('es-MX')} ${variant.price.currencyCode}`
  }

  public get isAvailable(): boolean {
    const variant = this.primaryVariant
    return variant ? variant.availableForSale && (variant.inventoryQuantity ?? 0) > 0 : false
  }

  public get statusLabel(): string {
    const statusLabels = {
      ACTIVE: 'Activo',
      ARCHIVED: 'Archivado',
      DRAFT: 'Borrador',
    }
    return statusLabels[this.status] || this.status
  }

  public update(updates: {
    title?: string
    vendor?: string
    productType?: string
    inventoryQuantity?: number
    price?: string
    details?: Partial<ArtworkDetails>
    manualTags?: string[]
    status?: 'ACTIVE' | 'DRAFT'
    description?: string
  }): void {
    const propertyUpdaters = {
      description: () => {
        if (updates.description) {
          const currentList = (this.descriptionHtml || '').split('<ul>')[1] || ''
          this.descriptionHtml = `<p>${updates.description}</p>${currentList ? `\n\n<ul>${currentList}` : ''}`
        }
      },
      details: () => {
        if (updates.details) this.artworkDetails = { ...this.artworkDetails, ...updates.details }
      },
      manualTags: () => {
        if (updates.manualTags) this.manualTags = updates.manualTags
      },
      productType: () => {
        if (updates.productType) this.productType = updates.productType
      },
      status: () => {
        if (updates.status) this.status = updates.status
      },
      title: () => {
        if (updates.title) this.title = updates.title
      },
      vendor: () => {
        if (updates.vendor) {
          this.vendor = updates.vendor
          // También actualizar el artist en artworkDetails
          this.artworkDetails = { ...this.artworkDetails, artist: updates.vendor }
        }
      },
    }

    Object.keys(propertyUpdaters).forEach((key) => {
      if (updates[key as keyof typeof updates] !== undefined) {
        propertyUpdaters[key as keyof typeof propertyUpdaters]()
      }
    })

    if (this.variants[0]) {
      if (updates.price) this.variants[0].price.amount = updates.price
      if (updates.inventoryQuantity !== undefined)
        this.variants[0].inventoryQuantity = updates.inventoryQuantity
    }

    const newAutoTags = this._generateAutoTags()
    this.autoTags = Array.from(newAutoTags)
    this.tags = [...new Set([...this.manualTags, ...this.autoTags])]
    this.descriptionHtml = this._generateDescription()
  }

  public toShopifyInput(): ShopifyInputPayloads {
    const metafields = Object.entries(this.artworkDetails)
      .filter(([, value]) => value != null && value !== '')
      .map(([key, value]) => ({
        key,
        namespace: ARTWORK_METAFIELD_NAMESPACE,
        type: 'single_line_text_field',
        value: String(value),
      }))

    const variantsInput: ShopifyVariantInput[] = this.variants.map((variant) => ({
      id: variant.id,
      inventoryItem: { tracked: true },
      inventoryPolicy: variant.inventoryPolicy,
      inventoryQuantities: [
        {
          availableQuantity: variant.inventoryQuantity ?? 0,
          locationId: this.primaryLocationId,
        },
      ],
      price: variant.price.amount,
      sku: variant.sku,
    }))

    const input: ShopifyProductInput = {
      descriptionHtml: this.descriptionHtml,
      id: this.id,
      metafields: metafields.length > 0 ? metafields : undefined,
      productType: this.productType,
      status: this.status,
      tags: this.tags,
      title: this.title,
      variants: variantsInput,
      vendor: this.vendor,
    }

    const createInput = { ...input }
    delete createInput.id
    createInput.variants = createInput.variants.map((v) => {
      const { id: _id, ...rest } = v
      return rest
    })

    return {
      createPayload: { input: createInput },
      metafieldsPayload: {
        metafields,
        productId: this.id,
      },
      updatePayload: { input },
    }
  }
}

function normalizeString(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

const structuralTagPatterns = [
  /^locacion-/,
  /^Formato (Grande|Mediano|Pequeño|Miniatura)$/,
  /^Disponible$/,
  /^\d{4}$/,
]
const materialKeywords: Record<string, string> = {
  acrilico: 'Acrílico',
  bronce: 'Bronce',
  canvas: 'Tela',
  collage: 'Collage',
  fotografia: 'Fotografía',
  grabado: 'Grabado',
  lienzo: 'Tela',
  madera: 'Madera',
  metal: 'Metal',
  mixta: 'Técnica Mixta',
  oleo: 'Óleo',
  papel: 'Papel',
  tela: 'Tela',
}

function isAutoTag(tag: string, artists: string[], types: string[]): boolean {
  const trimmedTag = tag.trim()
  const normalizedTag = normalizeString(trimmedTag)
  const materialTags = Object.values(materialKeywords).map(normalizeString)
  const valueBasedTagSet = new Set([
    ...artists.map(normalizeString),
    ...types.map(normalizeString),
    ...materialTags,
  ])

  if (valueBasedTagSet.has(normalizedTag)) return true
  if (structuralTagPatterns.some((pattern) => pattern.test(trimmedTag))) return true

  return false
}
