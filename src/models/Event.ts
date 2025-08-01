const EVENT_METAFIELD_NAMESPACE = 'event_details'

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

interface ShopifyEventData {
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
  variants: {
    edges: { node: ShopifyVariantNode }[]
  }
  metafields: {
    edges: { node: ShopifyMetafieldNode }[]
  }
}

export interface EventDetails {
  date: string | null
  location: string | null
  startTime: string | null
  endTime: string | null
  organizer: string | null
}

const VALID_EVENT_DETAIL_KEYS: (keyof EventDetails)[] = [
  'date',
  'location',
  'startTime',
  'endTime',
  'organizer',
]

export class Event {
  id: string
  handle: string
  title: string
  descriptionHtml: string
  productType: string
  vendor: string
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  images: Image[]
  variants: Variant[]
  tags: string[]
  eventDetails: EventDetails
  createdAt: string
  updatedAt: string
  private primaryLocationId: string

  constructor(shopifyEventData: ShopifyEventData, primaryLocationId: string) {
    this.id = shopifyEventData.id
    this.handle = shopifyEventData.handle
    this.title = shopifyEventData.title
    this.descriptionHtml = shopifyEventData.descriptionHtml || ''
    this.vendor = shopifyEventData.vendor
    this.productType = shopifyEventData.productType
    this.status = shopifyEventData.status
    this.tags = shopifyEventData.tags
    this.images = shopifyEventData.images.edges.map((edge) => edge.node)
    this.variants = shopifyEventData.variants.edges.map((edge) =>
      this._convertVariantFromApi(edge.node)
    )
    this.primaryLocationId = primaryLocationId
    this.eventDetails = this._parseDetailsFromMetafields(shopifyEventData.metafields.edges)
    this.createdAt = (shopifyEventData as any).createdAt
    this.updatedAt = (shopifyEventData as any).updatedAt
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
  ): EventDetails {
    const details: EventDetails = {
      date: null,
      endTime: null,
      location: null,
      organizer: null,
      startTime: null,
    }

    for (const { node } of metafieldEdges) {
      if (
        node.namespace === EVENT_METAFIELD_NAMESPACE &&
        VALID_EVENT_DETAIL_KEYS.includes(node.key as keyof EventDetails)
      ) {
        ;(details as unknown as Record<string, string | null>)[node.key] = node.value
      }
    }

    return details
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
    return `${parseFloat(variant.price.amount).toLocaleString('es-MX')} ${
      variant.price.currencyCode
    }`
  }

  public get description(): string {
    return this.descriptionHtml
  }

  

  public get priceRange(): {
    minVariantPrice: Money
    maxVariantPrice: Money
  } {
    const price = this.primaryVariant?.price ?? { amount: '0', currencyCode: 'MXN' }
    return {
      maxVariantPrice: price,
      minVariantPrice: price,
    }
  }

  public get isAvailable(): boolean {
    const variant = this.primaryVariant
    if (!variant) return false

    if (variant.inventoryManagement === 'NOT_MANAGED') {
      return variant.availableForSale
    }

    return variant.availableForSale && (variant.inventoryQuantity ?? 0) > 0
  }

  public get availableForSale(): boolean {
    return this.isAvailable
  }

  public get statusLabel(): string {
    const statusLabels = {
      ACTIVE: 'Activo',
      ARCHIVED: 'Archivado',
      DRAFT: 'Borrador',
    }
    return statusLabels[this.status] || this.status
  }
  public get formattedEventDetails(): string {
    const details = []

    if (this.eventDetails.date) {
      const date = new Date(this.eventDetails.date)
      details.push(`📅 ${date.toLocaleDateString('es-MX')}`)
    }

    if (this.eventDetails.startTime) {
      details.push(`🕐 ${this.eventDetails.startTime}`)
    }

    if (this.eventDetails.location) {
      details.push(`📍 ${this.eventDetails.location}`)
    }

    if (this.eventDetails.organizer) {
      details.push(`👤 ${this.eventDetails.organizer}`)
    }

    return details.join(' • ')
  }
  public get isPastEvent(): boolean {
    if (!this.eventDetails.date) return false

    const eventDate = new Date(this.eventDetails.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return eventDate < today
  }
  public get daysUntilEvent(): number | null {
    if (!this.eventDetails.date) return null

    const eventDate = new Date(this.eventDetails.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    eventDate.setHours(0, 0, 0, 0)

    const diffTime = eventDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }
}
