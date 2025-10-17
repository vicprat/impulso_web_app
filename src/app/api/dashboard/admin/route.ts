import { NextResponse } from 'next/server'

import { PERMISSIONS } from '@/src/config/Permissions'
import { makeAdminApiRequest } from '@/src/lib/shopifyAdmin'
import { requirePermission } from '@/src/modules/auth/server/server'
import { getAllUsers } from '@/src/modules/user/user.service'

// Helper para crear fechas locales sin problemas de zona horaria
const createLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day) // month es 0-indexed en Date constructor
}

interface ShopifyMoneyV2 {
  amount: string
  currencyCode: string
}

interface ShopifyLineItemNode {
  id: string
  title: string
  quantity: number
  originalUnitPriceSet: {
    shopMoney: ShopifyMoneyV2
  }
}

interface ShopifyLineItemEdge {
  node: ShopifyLineItemNode
}

interface ShopifyOrderNode {
  id: string
  createdAt: string
  displayFinancialStatus: string
  currentTotalPriceSet: {
    shopMoney: ShopifyMoneyV2
  }
  lineItems: {
    edges: ShopifyLineItemEdge[]
  }
}

interface ShopifyOrderEdge {
  node: ShopifyOrderNode
}

interface ShopifyOrdersResponse {
  orders: {
    edges: ShopifyOrderEdge[]
  }
}

let primaryLocationId: string | null = null

async function getPrimaryLocationId(): Promise<string> {
  if (primaryLocationId) return primaryLocationId

  const response = await makeAdminApiRequest<{ locations: { edges: { node: { id: string } }[] } }>(
    `query { locations(first: 1, query: "is_active:true") { edges { node { id name } } } }`,
    {}
  )

  const locationId = response.locations.edges[0]?.node?.id
  if (!locationId) {
    throw new Error('No se pudo encontrar una ubicación de Shopify para gestionar el inventario.')
  }

  primaryLocationId = locationId
  return primaryLocationId
}

export async function GET() {
  try {
    const session = await requirePermission(PERMISSIONS.VIEW_ANALYTICS)
    const locationId = await getPrimaryLocationId()

    const today = new Date()
    const firstDayOfPreviousMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    // Obtener TODAS las órdenes usando paginación
    const allOrders: ShopifyOrderEdge[] = []
    let ordersHasNextPage = true
    let ordersCursor: string | undefined = undefined

    while (ordersHasNextPage) {
      const orderQuery = `
        query($after: String, $first: Int!) {
          orders(query: "created_at:>=${firstDayOfPreviousMonth.toISOString()} created_at:<=${today.toISOString()}", first: $first, after: $after) {
            edges {
              node {
                id
                createdAt
                displayFinancialStatus
                currentTotalPriceSet {
                  shopMoney {
                    amount
                  }
                }
                lineItems(first: 50) {
                  edges {
                    node {
                      id
                      title
                      quantity
                      originalUnitPriceSet {
                        shopMoney {
                          amount
                        }
                      }
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `

      const orderVariables: {
        after?: string
        first: number
      } = {
        after: ordersCursor,
        first: 250, // Máximo permitido por Shopify
      }

      const orderResponse: any = await makeAdminApiRequest(orderQuery, orderVariables)
      allOrders.push(...orderResponse.orders.edges)

      // Verificar si hay más páginas
      ordersHasNextPage = orderResponse.orders.pageInfo.hasNextPage
      ordersCursor = orderResponse.orders.pageInfo.endCursor ?? undefined

      // Para órdenes muy grandes, limitamos a 5000 órdenes máximo
      if (allOrders.length >= 5000) {
        break
      }
    }

    const shopifyResponse: ShopifyOrdersResponse = { orders: { edges: allOrders } }

    // Obtener TODOS los productos usando el método de stats que implementa paginación
    const allProducts: any[] = []
    let productsHasNextPage = true
    let productsCursor: string | undefined = undefined

    // Obtener todos los productos usando paginación como en getProductStats
    while (productsHasNextPage) {
      const productVariables: {
        after?: string
        first: number
        query: string
        reverse: boolean
        sortKey: 'TITLE'
      } = {
        after: productsCursor,
        first: 50, // Reducido para evitar throttling
        query: '',
        reverse: false,
        sortKey: 'TITLE',
      }

      try {
        const productResponse: any = await makeAdminApiRequest(
          `
          query($after: String, $first: Int!, $query: String, $reverse: Boolean, $sortKey: ProductSortKeys) {
            products(after: $after, first: $first, query: $query, reverse: $reverse, sortKey: $sortKey) {
              edges {
                node {
                  id
                  handle
                  title
                  descriptionHtml
                  vendor
                  productType
                  status
                  tags
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price
                        sku
                        inventoryQuantity
                        inventoryPolicy
                        inventoryItem {
                          tracked
                        }
                      }
                    }
                  }
                  metafields(first: 50) {
                    edges {
                      node {
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
          productVariables
        )

        const products = productResponse.products.edges.map((edge: any) => {
          // Crear un objeto Product simplificado para el dashboard
          const productData = edge.node

          return {
            // Procesar artworkDetails desde metafields
            get artworkDetails() {
              const details: any = {}
              for (const { node } of this.metafields) {
                if (node.namespace === 'art_details') {
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
                  if (validKeys.includes(node.key)) {
                    details[node.key] = node.value
                  }
                }
              }
              return {
                artist: details.artist || null,
                depth: details.depth || null,
                height: details.height || null,
                location: details.location || null,
                medium: details.medium || null,
                serie: details.serie || null,
                width: details.width || null,
                year: details.year || null,
              }
            },

            get autoTags() {
              return this.tags.filter((tag: string) => tag.startsWith('auto-'))
            },

            descriptionHtml: productData.descriptionHtml,

            get formattedPrice() {
              const variant = this.primaryVariant
              return variant ? `$${parseFloat(variant.price.amount).toFixed(2)}` : '$0.00'
            },

            handle: productData.handle,

            id: productData.id,

            images: [],

            get isAvailable() {
              const variant = this.primaryVariant
              if (!variant) return false

              if (variant.inventoryQuantity === null) {
                return variant.availableForSale
              }

              return variant.availableForSale && variant.inventoryQuantity > 0
            },

            // Procesar tags
            get manualTags() {
              return this.tags.filter((tag: string) => !tag.startsWith('auto-'))
            },

            // Array vacío para evitar errores
            media: [],

            metafields: productData.metafields.edges,

            // Métodos del modelo Product
            get primaryVariant() {
              return this.variants[0] || null
            },

            productType: productData.productType,

            status: productData.status,

            tags: productData.tags,

            title: productData.title,

            // Array vacío para evitar errores
            variants: productData.variants.edges.map((variantEdge: any) => ({
              availableForSale: variantEdge.node.availableForSale,
              id: variantEdge.node.id,
              inventoryManagement: variantEdge.node.inventoryItem.tracked
                ? 'SHOPIFY'
                : 'NOT_MANAGED',
              inventoryPolicy: variantEdge.node.inventoryPolicy,
              inventoryQuantity: variantEdge.node.inventoryQuantity,
              price: { amount: variantEdge.node.price, currencyCode: 'MXN' },
              sku: variantEdge.node.sku,
              title: variantEdge.node.title,
            })),

            vendor: productData.vendor,
          }
        })
        allProducts.push(...products)

        // Verificar si hay más páginas
        productsHasNextPage = productResponse.products.pageInfo.hasNextPage
        productsCursor = productResponse.products.pageInfo.endCursor ?? undefined

        // Para inventarios muy grandes, limitamos a 5000 productos máximo
        if (allProducts.length >= 5000) {
          break
        }

        // Delay para evitar throttling
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error: any) {
        if (error.message?.includes('Throttled')) {
          console.log('Throttled, esperando 2 segundos...')
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }
        throw error
      }
    }

    const managementProducts = allProducts

    // Obtener TODOS los eventos usando paginación
    const allEvents: any[] = []
    let eventsHasNextPage = true
    let eventsCursor: string | undefined = undefined

    while (eventsHasNextPage) {
      const eventVariables: {
        after?: string
        first: number
        query: string
        reverse: boolean
        sortKey: 'TITLE'
      } = {
        after: eventsCursor,
        first: 50, // Reducido para evitar throttling
        query: 'product_type:event', // Filtrar solo eventos
        reverse: false,
        sortKey: 'TITLE',
      }

      try {
        const eventResponse: any = await makeAdminApiRequest(
          `
          query($after: String, $first: Int!, $query: String, $reverse: Boolean, $sortKey: ProductSortKeys) {
            products(after: $after, first: $first, query: $query, reverse: $reverse, sortKey: $sortKey) {
              edges {
                node {
                  id
                  handle
                  title
                  descriptionHtml
                  vendor
                  productType
                  status
                  tags
                  variants(first: 10) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price
                        sku
                        inventoryQuantity
                        inventoryPolicy
                        inventoryItem {
                          tracked
                        }
                      }
                    }
                  }
                  metafields(first: 50) {
                    edges {
                      node {
                        namespace
                        key
                        value
                      }
                    }
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        `,
          eventVariables
        )

        const events = eventResponse.products.edges.map((edge: any) => {
          // Crear un objeto Event simplificado para el dashboard
          const eventData = edge.node

          return {
            get availableForSale() {
              const variant = this.primaryVariant
              return variant ? variant.availableForSale : false
            },
            get daysUntilEvent() {
              if (!this.eventDetails.date) return null
              const eventDate = createLocalDate(this.eventDetails.date)
              const today = new Date()
              const diffTime = eventDate.getTime() - today.getTime()
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
              return diffDays
            },

            descriptionHtml: eventData.descriptionHtml,

            // Procesar eventDetails desde metafields
            get eventDetails() {
              const details: any = {}
              for (const { node } of this.metafields) {
                if (node.namespace === 'event_details') {
                  const validKeys = ['date', 'location', 'startTime', 'endTime', 'organizer']
                  if (validKeys.includes(node.key)) {
                    details[node.key] = node.value
                  }
                }
              }
              return {
                date: details.date || null,
                endTime: details.endTime || null,
                location: details.location || null,
                organizer: details.organizer || null,
                startTime: details.startTime || null,
              }
            },

            get formattedEventDetails() {
              const details = this.eventDetails
              const parts = []
              if (details.date) parts.push(`Fecha: ${details.date}`)
              if (details.location) parts.push(`Ubicación: ${details.location}`)
              if (details.startTime) parts.push(`Hora: ${details.startTime}`)
              if (details.organizer) parts.push(`Organizador: ${details.organizer}`)
              return parts.join(' | ')
            },

            get formattedPrice() {
              const variant = this.primaryVariant
              return variant ? `$${parseFloat(variant.price.amount).toFixed(2)}` : '$0.00'
            },

            handle: eventData.handle,

            id: eventData.id,

            images: [],

            get isAvailable() {
              const variant = this.primaryVariant
              if (!variant) return false

              if (variant.inventoryQuantity === null) {
                return variant.availableForSale
              }

              return variant.availableForSale && variant.inventoryQuantity > 0
            },

            get isPastEvent() {
              if (!this.eventDetails.date) return false
              const eventDate = createLocalDate(this.eventDetails.date)
              return eventDate < new Date()
            },

            metafields: eventData.metafields.edges,

            // Métodos del modelo Event
            get primaryVariant() {
              return this.variants[0] || null
            },

            productType: eventData.productType,

            status: eventData.status,

            tags: eventData.tags,

            title: eventData.title,

            // Array vacío para evitar errores
            variants: eventData.variants.edges.map((variantEdge: any) => ({
              availableForSale: variantEdge.node.availableForSale,
              id: variantEdge.node.id,
              inventoryManagement: variantEdge.node.inventoryItem.tracked
                ? 'SHOPIFY'
                : 'NOT_MANAGED',
              inventoryPolicy: variantEdge.node.inventoryPolicy,
              inventoryQuantity: variantEdge.node.inventoryQuantity,
              price: { amount: variantEdge.node.price, currencyCode: 'MXN' },
              sku: variantEdge.node.sku,
              title: variantEdge.node.title,
            })),

            vendor: eventData.vendor,
          }
        })
        allEvents.push(...events)

        // Verificar si hay más páginas
        eventsHasNextPage = eventResponse.products.pageInfo.hasNextPage
        eventsCursor = eventResponse.products.pageInfo.endCursor ?? undefined

        // Para eventos muy grandes, limitamos a 1000 eventos máximo
        if (allEvents.length >= 1000) {
          break
        }

        // Delay para evitar throttling
        await new Promise((resolve) => setTimeout(resolve, 200))
      } catch (error: any) {
        if (error.message?.includes('Throttled')) {
          console.log('Throttled, esperando 2 segundos...')
          await new Promise((resolve) => setTimeout(resolve, 2000))
          continue
        }
        throw error
      }
    }

    const managementEvents = allEvents

    // Obtener TODOS los usuarios usando paginación
    const allUsers: any[] = []
    let userPage = 1
    let userHasMore = true

    while (userHasMore) {
      const { total, users } = await getAllUsers({
        limit: 100,
        page: userPage,
      })

      allUsers.push(...users)

      // Verificar si hay más páginas
      userHasMore = allUsers.length < total && userPage * 100 < total
      userPage++

      // Para usuarios muy grandes, limitamos a 5000 usuarios máximo
      if (allUsers.length >= 5000) {
        break
      }
    }

    const users = allUsers

    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    const orders: ShopifyOrderEdge[] = shopifyResponse.orders.edges
    const totalOrders = orders.length
    const totalSales = orders.reduce((sum: number, order: ShopifyOrderEdge) => {
      const amount = parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0')
      return sum + amount
    }, 0)

    const salesByMonth = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(currentYear, currentMonth - (5 - i), 1)
      const monthOrders = orders.filter((order: ShopifyOrderEdge) => {
        const orderDate = new Date(order.node.createdAt)
        return (
          orderDate.getMonth() === month.getMonth() &&
          orderDate.getFullYear() === month.getFullYear()
        )
      })

      const monthSales = monthOrders.reduce((sum: number, order: ShopifyOrderEdge) => {
        const amount = parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0')
        return sum + amount
      }, 0)

      return {
        month: month.toLocaleDateString('es-ES', { month: 'short' }),
        orders: monthOrders.length,
        products: new Set(
          monthOrders.flatMap((order: ShopifyOrderEdge) =>
            order.node.lineItems.edges.map((item: ShopifyLineItemEdge) => item.node.id)
          )
        ).size,
        sales: monthSales,
      }
    })

    const products = managementProducts ?? []
    const events = managementEvents ?? []

    // Procesar datos enriquecidos de productos
    const productSalesMap = new Map<
      string,
      { name: string; artist: string; sales: number; units: number; details: any }
    >()
    const artistsMap = new Map<
      string,
      { name: string; products: number; sales: number; details: any[] }
    >()

    orders.forEach((order: ShopifyOrderEdge) => {
      order.node.lineItems.edges.forEach((item: ShopifyLineItemEdge) => {
        const productName = item.node.title
        const quantity = item.node.quantity
        const price = parseFloat(item.node.originalUnitPriceSet?.shopMoney?.amount ?? '0')
        const itemSales = quantity * price

        const product = products.find((p) => p.title === productName)
        const artistName = product?.vendor ?? 'Artista Desconocido'

        if (productSalesMap.has(productName)) {
          const existing = productSalesMap.get(productName)!
          existing.sales += itemSales
          existing.units += quantity
        } else {
          productSalesMap.set(productName, {
            artist: artistName,
            details: product || null,
            name: productName,
            sales: itemSales,
            units: quantity,
          })
        }

        if (!artistsMap.has(artistName)) {
          artistsMap.set(artistName, {
            details: [],
            name: artistName,
            products: 0,
            sales: 0,
          })
        }
        const artist = artistsMap.get(artistName)!
        artist.sales += itemSales
      })
    })

    products.forEach((product) => {
      const artistName = product.vendor ?? 'Artista Desconocido'
      if (!artistsMap.has(artistName)) {
        artistsMap.set(artistName, {
          details: [],
          name: artistName,
          products: 0,
          sales: 0,
        })
      }
      const artist = artistsMap.get(artistName)!
      artist.products += 1
      artist.details.push({
        artworkDetails: product.artworkDetails,
        autoTags: product.autoTags,
        id: product.id,
        manualTags: product.manualTags,
        status: product.status,
        tags: product.tags,
        title: product.title,
      })
    })

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    const artistStats = Array.from(artistsMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((artist) => ({
        ...artist,
        topProducts: artist.details
          .sort((a: any, b: any) => (b.sales || 0) - (a.sales || 0))
          .slice(0, 3),
      }))

    const categoriesMap = new Map()
    products.forEach((product) => {
      const category = product.productType ?? 'Sin categoría'
      categoriesMap.set(category, (categoriesMap.get(category) ?? 0) + 1)
    })

    const productCategories = Array.from(categoriesMap.entries()).map(([name, value], index) => ({
      color: ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'][index % 5],
      name,
      value,
    }))

    // Procesar eventos
    const eventsMap = new Map<string, { event: any; ticketsSold: number; totalTickets: number }>()
    const upcomingEvents = events.filter((event) => !event.isPastEvent && event.status === 'ACTIVE')
    const pastEvents = events.filter((event) => event.isPastEvent && event.status === 'ACTIVE')

    // Calcular métricas de eventos
    const totalEvents = events.length
    const activeEvents = events.filter((event) => event.status === 'ACTIVE').length
    const upcomingEventsCount = upcomingEvents.length
    const pastEventsCount = pastEvents.length

    // Procesar detalles de eventos
    const eventDetails = events.map((event) => ({
      availableForSale: event.availableForSale,
      daysUntilEvent: event.daysUntilEvent,
      eventDetails: event.eventDetails,
      formattedEventDetails: event.formattedEventDetails,
      id: event.id,
      isAvailable: event.isAvailable,
      isPastEvent: event.isPastEvent,
      price: event.formattedPrice,
      status: event.status,
      title: event.title,
    }))

    interface AdminRecentActivityItem {
      id: string
      message: string
      type: 'sale' | 'product' | 'user' | 'event'
      amount?: number
    }

    const recentSales: AdminRecentActivityItem[] = orders.slice(0, 4).map((order) => ({
      amount: parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
      createdAt: order.node.createdAt,
      id: order.node.id,
      message: `Nueva venta por ${parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0').toFixed(2)}`,
      time: `${Math.floor((new Date().getTime() - new Date(order.node.createdAt).getTime()) / (1000 * 60 * 60))} horas`,
      type: 'sale',
    }))

    const recentProducts: AdminRecentActivityItem[] = products.slice(0, 4).map((product) => ({
      id: product.id,
      message: `Nuevo producto añadido: ${product.title}`,
      type: 'product',
    }))

    const recentUsers: AdminRecentActivityItem[] = users.slice(0, 4).map((user) => ({
      createdAt: user.createdAt,
      id: user.id,
      message: `Nuevo usuario registrado: ${user.firstName ?? ''} ${user.lastName ?? ''}`,
      time: `${Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60))} horas`,
      type: 'user',
    }))

    const combinedRecentActivity: AdminRecentActivityItem[] = [
      ...recentSales,
      ...recentProducts,
      ...recentUsers,
    ]

    const recentActivity = combinedRecentActivity

    const totalProducts = products.length
    const lowStock = products.filter((p) => {
      const qty = p.primaryVariant?.inventoryQuantity
      return qty !== null && qty !== undefined && qty < 5 && qty > 0
    }).length
    const outOfStock = products.filter((p) => {
      const qty = p.primaryVariant?.inventoryQuantity
      return qty !== null && qty !== undefined && qty === 0
    }).length
    const totalInventoryValue = products.reduce((sum, product) => {
      const price = parseFloat(product.primaryVariant?.price?.amount ?? '0')
      const quantity = product.primaryVariant?.inventoryQuantity ?? 0
      return sum + price * quantity
    }, 0)

    // Métricas adicionales con datos enriquecidos
    const productsWithArtworkDetails = products.filter(
      (p) => p.artworkDetails && Object.values(p.artworkDetails).some((value) => value !== null)
    ).length

    const productsByMedium = products.reduce(
      (acc, product) => {
        const medium = product.artworkDetails?.medium || 'Sin medio especificado'
        acc[medium] = (acc[medium] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const productsByYear = products.reduce(
      (acc, product) => {
        const year = product.artworkDetails?.year || 'Sin año especificado'
        acc[year] = (acc[year] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const productsByLocation = products.reduce(
      (acc, product) => {
        const location = product.artworkDetails?.location || 'Sin ubicación especificada'
        acc[location] = (acc[location] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const totalRevenue = totalSales
    const totalExpenses = totalRevenue * 0.3
    const totalProfit = totalRevenue * 0.7
    const pendingPayments = orders
      .filter((order) => order.node.displayFinancialStatus === 'PENDING')
      .reduce((sum, order) => {
        const amount = parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0')
        return sum + amount
      }, 0)

    const activeProducts = products.filter((p) => p.status === 'ACTIVE').length

    const averageOrderValue =
      orders.length > 0
        ? orders.reduce(
            (sum, order) =>
              sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
            0
          ) / orders.length
        : 0

    const totalUsers = users?.length ?? 0

    const salesCurrentMonth = orders
      .filter(
        (order) =>
          new Date(order.node.createdAt).getMonth() === today.getMonth() &&
          new Date(order.node.createdAt).getFullYear() === today.getFullYear()
      )
      .reduce(
        (sum: number, order: ShopifyOrderEdge) =>
          sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
        0
      )

    const salesPreviousMonth = orders
      .filter(
        (order) =>
          new Date(order.node.createdAt).getMonth() === firstDayOfPreviousMonth.getMonth() &&
          new Date(order.node.createdAt).getFullYear() === firstDayOfPreviousMonth.getFullYear()
      )
      .reduce(
        (sum: number, order: ShopifyOrderEdge) =>
          sum + parseFloat(order.node.currentTotalPriceSet?.shopMoney?.amount ?? '0'),
        0
      )

    const monthlyGrowth =
      salesPreviousMonth > 0
        ? ((salesCurrentMonth - salesPreviousMonth) / salesPreviousMonth) * 100
        : 0

    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0

    const data = {
      activeProducts,
      artistStats,
      averageOrderValue,

      events: {
        active: activeEvents,
        details: eventDetails,
        ticketsSold: pastEventsCount,
        totalTickets: totalEvents,
        upcoming: upcomingEventsCount,
      },

      financialSummary: {
        expenses: totalExpenses,
        pendingPayments,
        profit: totalProfit,
        revenue: totalRevenue,
      },

      inventory: {
        lowStock,
        outOfStock,
        productsByLocation,
        productsByMedium,
        productsByYear,
        productsWithArtworkDetails,
        totalValue: totalInventoryValue,
      },

      overview: {
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        monthlyGrowth,
        totalOrders,
        totalProducts,
        totalSales: Math.round(totalSales),
        totalUsers,
      },

      productCategories,

      recentActivity,

      salesData: salesByMonth,
      topProducts,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
