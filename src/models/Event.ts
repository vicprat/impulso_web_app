const EVENT_METAFIELD_NAMESPACE = 'event_details'

// Re-using interfaces from Product.ts for consistency.
// In a real-world scenario, these might be moved to a shared types file.

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

// This is the same as ShopifyProductData, can be reused
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

// Definimos las claves válidas para EventDetails
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
  private primaryLocationId: string

  constructor(shopifyEventData: ShopifyEventData, primaryLocationId: string) {
    this.id = shopifyEventData.id
    this.handle = shopifyEventData.handle
    this.title = shopifyEventData.title
    this.descriptionHtml = shopifyEventData.descriptionHtml || ''
    this.vendor = shopifyEventData.vendor
    this.productType = shopifyEventData.productType
    this.status = shopifyEventData.status
    this.tags = shopifyEventData.tags || []
    this.images = (shopifyEventData.images?.edges || []).map((edge) => edge.node)
    this.variants = (shopifyEventData.variants?.edges || []).map((edge) =>
      this._convertVariantFromApi(edge.node)
    )
    this.primaryLocationId = primaryLocationId
    this.eventDetails = this._parseDetailsFromMetafields(shopifyEventData.metafields?.edges || [])
  }

  private _convertVariantFromApi(apiVariant: ShopifyVariantNode): Variant {
    return {
      availableForSale: apiVariant.availableForSale,
      compareAtPrice: null,
      id: apiVariant.id,
      inventoryManagement: apiVariant.inventoryItem?.tracked ? 'SHOPIFY' : 'NOT_MANAGED',
      inventoryPolicy: apiVariant.inventoryPolicy,
      inventoryQuantity: apiVariant.inventoryQuantity,
      price: {
        amount: apiVariant.price,
        currencyCode: 'MXN', // Assuming MXN, can be made configurable
      },
      selectedOptions: [],
      sku: apiVariant.sku,
      title: apiVariant.title,
    }
  }

  private _parseDetailsFromMetafields(
    metafieldEdges: { node: ShopifyMetafieldNode }[]
  ): EventDetails {
    // Inicializamos con valores por defecto
    const details: EventDetails = {
      date: null,
      location: null,
      startTime: null,
      endTime: null,
      organizer: null,
    }

    for (const { node } of metafieldEdges) {
      // Corregimos la lógica: verificamos namespace y si la key es válida
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
    return `$${parseFloat(variant.price.amount).toLocaleString('es-MX')} ${
      variant.price.currencyCode
    }`
  }

  public get isAvailable(): boolean {
    const variant = this.primaryVariant
    if (!variant) return false

    // Para eventos, si el inventario no está siendo gestionado por Shopify,
    // solo verificamos que esté disponible para la venta
    if (variant.inventoryManagement === 'NOT_MANAGED') {
      return variant.availableForSale
    }

    // Si está siendo gestionado por Shopify, verificamos tanto disponibilidad como cantidad
    return variant.availableForSale && (variant.inventoryQuantity || 0) > 0
  }

  public get statusLabel(): string {
    const statusLabels = {
      ACTIVE: 'Activo',
      ARCHIVED: 'Archivado',
      DRAFT: 'Borrador',
    }
    return statusLabels[this.status] || this.status
  }

  // Getter para formatear detalles del evento para mostrar
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

  // Método para verificar si el evento ya pasó
  public get isPastEvent(): boolean {
    if (!this.eventDetails.date) return false

    const eventDate = new Date(this.eventDetails.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day

    return eventDate < today
  }

  // Método para obtener los días restantes hasta el evento
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
