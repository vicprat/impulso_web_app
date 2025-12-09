import { makeAdminApiRequest } from '@/lib/shopifyAdmin'

interface CreateDiscountResponse {
  discountCodeBasicCreate: {
    codeDiscountNode: {
      id: string
      codeDiscount: {
        title: string
        codes: {
          edges: {
            node: {
              code: string
            }
          }[]
        }
        status: string
        startsAt: string
        endsAt?: string
        usageLimit?: number
        appliesOncePerCustomer: boolean
        customerGets: {
          value: {
            percentage?: number
            discountAmount?: {
              amount: string
              appliesOnEachItem: boolean
            }
          }
          items: {
            products?: {
              edges: {
                node: {
                  id: string
                }
              }[]
            }
            collections?: {
              edges: {
                node: {
                  id: string
                }
              }[]
            }
            allItems: boolean
          }
        }
      }
    }
    userErrors: {
      field: string[]
      message: string
    }[]
  }
}

interface GetDiscountsResponse {
  codeDiscountNodes: {
    edges: {
      node: {
        id: string
        codeDiscount: {
          title: string
          codes: {
            edges: {
              node: {
                code: string
              }
            }[]
          }
          status: string
          startsAt: string
          endsAt?: string
          usageLimit?: number
          appliesOncePerCustomer: boolean
          customerGets: {
            value: {
              percentage?: number
              discountAmount?: {
                amount: string
                appliesOnEachItem: boolean
              }
            }
            items: {
              products?: {
                edges: {
                  node: {
                    id: string
                  }
                }[]
              }
              collections?: {
                edges: {
                  node: {
                    id: string
                  }
                }[]
              }
              allItems: boolean
            }
          }
        }
      }
    }[]
    pageInfo: {
      hasNextPage: boolean
      endCursor?: string
    }
  }
}

interface GetDiscountResponse {
  codeDiscountNode: {
    id: string
    codeDiscount: {
      title: string
      codes: {
        edges: {
          node: {
            code: string
          }
        }[]
      }
      status: string
      startsAt: string
      endsAt?: string
      usageLimit?: number
      appliesOncePerCustomer: boolean
      customerGets: {
        value: {
          percentage?: number
          discountAmount?: {
            amount: string
            appliesOnEachItem: boolean
          }
        }
        items: {
          products?: {
            edges: {
              node: {
                id: string
              }
            }[]
          }
          collections?: {
            edges: {
              node: {
                id: string
              }
            }[]
          }
          allItems: boolean
        }
      }
    }
  }
}

interface UpdateDiscountResponse {
  discountCodeBasicUpdate: {
    codeDiscountNode: {
      id: string
      codeDiscount: {
        title: string
        codes: {
          edges: {
            node: {
              code: string
            }
          }[]
        }
        status: string
        startsAt: string
        endsAt?: string
        usageLimit?: number
        appliesOncePerCustomer: boolean
        customerGets: {
          value: {
            percentage?: number
            discountAmount?: {
              amount: string
              appliesOnEachItem: boolean
            }
          }
          items: {
            products?: {
              edges: {
                node: {
                  id: string
                }
              }[]
            }
            collections?: {
              edges: {
                node: {
                  id: string
                }
              }[]
            }
            allItems: boolean
          }
        }
      }
    }
    userErrors: {
      field: string[]
      message: string
    }[]
  }
}

interface DeleteDiscountResponse {
  discountCodeDelete: {
    deletedCodeDiscountId?: string
    userErrors: {
      field: string[]
      message: string
    }[]
  }
}

export interface ShopifyDiscount {
  id: string
  code: string
  title: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  startsAt: string
  endsAt?: string
  isActive: boolean
  appliesTo: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'COLLECTIONS'
  productIds?: string[]
  collectionIds?: string[]
  createdAt: string
  updatedAt: string
  usageLimit?: number
  appliesOncePerCustomer?: boolean
}

export interface CreateShopifyDiscountInput {
  code?: string
  title?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  startsAt: string
  endsAt?: string
  appliesTo: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'COLLECTIONS'
  productIds?: string[]
  collectionIds?: string[]
  usageLimit?: number
  appliesOncePerCustomer?: boolean
  isAutomatic?: boolean
}

export interface UpdateShopifyDiscountInput {
  id: string
  title?: string
  isActive?: boolean
  endsAt?: string
  value?: number
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT'
  usageLimit?: number
  appliesOncePerCustomer?: boolean
  appliesTo?: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'COLLECTIONS'
  productIds?: string[]
  collectionIds?: string[]
}

const GET_DISCOUNTS_QUERY = `
  query getDiscounts($first: Int = 50) {
    codeDiscountNodes(first: $first) {
      edges {
        node {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              status
              startsAt
              endsAt
              usageLimit
              appliesOncePerCustomer

              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              customerGets {
                value {
                  ... on DiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                    appliesOnEachItem
                  }
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                  ... on DiscountProducts {
                    products(first: 50) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 50) {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const CREATE_DISCOUNT_MUTATION = `
  mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
    discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
      codeDiscountNode {
        id
        codeDiscount {
          ... on DiscountCodeBasic {
            title
            status
            startsAt
            endsAt
            usageLimit
            appliesOncePerCustomer
            codes(first: 1) {
              edges {
                node {
                  code
                }
              }
            }
            customerGets {
              value {
                ... on DiscountAmount {
                  amount {
                    amount
                    currencyCode
                  }
                  appliesOnEachItem
                }
                ... on DiscountPercentage {
                  percentage
                }
              }
              items {
                ... on AllDiscountItems {
                  allItems
                }
                ... on DiscountProducts {
                  products(first: 10) {
                    edges {
                      node {
                        id
                        title
                      }
                    }
                  }
                }
                ... on DiscountCollections {
                  collections(first: 10) {
                    edges {
                      node {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const shopifyDiscountService = {
  async createAutomaticProductDiscount(input: {
    productIds: string[]
    type: 'PERCENTAGE' | 'FIXED_AMOUNT'
    value: number
    title?: string
    startsAt?: string
    endsAt?: string
  }): Promise<ShopifyDiscount> {
    const discountInput: CreateShopifyDiscountInput = {
      appliesTo: 'SPECIFIC_PRODUCTS',
      code: `AUTO_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      endsAt: input.endsAt,
      isAutomatic: true,
      productIds: input.productIds,
      startsAt: input.startsAt || new Date().toISOString(),
      title:
        input.title ||
        `Descuento automático ${input.type === 'PERCENTAGE' ? `${input.value}%` : `$${input.value}`}`,
      type: input.type,
      value: input.value,
    }

    return this.createDiscount(discountInput)
  },

  async createDiscount(input: CreateShopifyDiscountInput): Promise<ShopifyDiscount> {
    let items: Record<string, unknown> = {}

    if (input.appliesTo === 'ALL_PRODUCTS') {
      items = { all: true }
    } else if (input.appliesTo === 'SPECIFIC_PRODUCTS' && input.productIds?.length) {
      items = {
        products: {
          productsToAdd: input.productIds,
        },
      }
    } else if (input.appliesTo === 'COLLECTIONS' && input.collectionIds?.length) {
      items = {
        collections: {
          collectionsToAdd: input.collectionIds,
        },
      }
    }

    let discountValue: Record<string, unknown>

    if (input.type === 'PERCENTAGE') {
      const percentageValue = input.value / 100
      discountValue = {
        percentage: percentageValue,
      }
    } else {
      discountValue = {
        discountAmount: {
          amount: input.value.toString(),
          appliesOnEachItem: true,
        },
      }
    }

    const discountInput: Record<string, unknown> = {
      appliesOncePerCustomer: input.appliesOncePerCustomer ?? false,
      code: input.code,
      customerGets: {
        items,
        value: discountValue,
      },
      customerSelection: {
        all: true,
      },
      endsAt: input.endsAt,
      startsAt: input.startsAt,
      title: input.title ?? `Descuento ${input.code}`,
      usageLimit: input.usageLimit ?? null,
    }

    const response = await makeAdminApiRequest<CreateDiscountResponse>(CREATE_DISCOUNT_MUTATION, {
      basicCodeDiscount: discountInput,
    })

    const userErrors = response.discountCodeBasicCreate?.userErrors
    if (userErrors?.length > 0) {
      const firstError = userErrors[0]
      throw new Error(`Error al crear descuento: ${firstError.message}`)
    }

    const createdDiscount = response.discountCodeBasicCreate?.codeDiscountNode
    if (!createdDiscount) {
      throw new Error('Error: No se pudo crear el descuento')
    }

    return {
      appliesOncePerCustomer: input.appliesOncePerCustomer,
      appliesTo: input.appliesTo,
      code: createdDiscount.codeDiscount.codes.edges[0]?.node.code ?? input.code,
      collectionIds: input.collectionIds,
      createdAt: input.startsAt,
      endsAt: input.endsAt,
      id: createdDiscount.id,
      isActive: createdDiscount.codeDiscount.status === 'ACTIVE',
      productIds: input.productIds,
      startsAt: input.startsAt,
      title: createdDiscount.codeDiscount.title ?? input.title ?? 'Sin título',
      type: input.type,
      updatedAt: input.startsAt,
      usageLimit: input.usageLimit,
      value: input.value,
    }
  },

  async createVolumeDiscount(input: {
    productIds: string[]
    type: 'PERCENTAGE' | 'FIXED_AMOUNT'
    value: number
    minimumQuantity: number
    title?: string
    startsAt?: string
    endsAt?: string
  }): Promise<ShopifyDiscount> {
    const discountInput: CreateShopifyDiscountInput = {
      appliesOncePerCustomer: false,
      appliesTo: 'SPECIFIC_PRODUCTS',
      code: `VOL${input.minimumQuantity}_${Date.now()}`,
      endsAt: input.endsAt,
      productIds: input.productIds,
      startsAt: input.startsAt || new Date().toISOString(),
      title:
        input.title ||
        `Compra ${input.minimumQuantity}+ y obtén ${input.type === 'PERCENTAGE' ? `${input.value}%` : `$${input.value}`} OFF`,
      type: input.type,
      usageLimit: undefined,
      value: input.value,
    }

    return this.createDiscount(discountInput)
  },

  async deleteDiscount(id: string): Promise<void> {
    const formattedId = id.startsWith('gid://shopify/DiscountCodeNode/')
      ? id
      : `gid://shopify/DiscountCodeNode/${id}`

    const DELETE_MUTATION = `
      mutation discountCodeDelete($id: ID!) {
        discountCodeDelete(id: $id) {
          deletedCodeDiscountId
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await makeAdminApiRequest<DeleteDiscountResponse>(DELETE_MUTATION, {
      id: formattedId,
    })

    if (response.discountCodeDelete?.userErrors?.length > 0) {
      const error = response.discountCodeDelete.userErrors[0]
      if (error.message.includes("doesn't exist on type")) {
        const DELETE_MUTATION_SIMPLE = `
          mutation discountCodeDelete($id: ID!) {
            discountCodeDelete(id: $id) {
              userErrors {
                field
                message
              }
            }
          }
        `

        const simpleResponse = await makeAdminApiRequest<DeleteDiscountResponse>(
          DELETE_MUTATION_SIMPLE,
          { id: formattedId }
        )

        if (simpleResponse.discountCodeDelete?.userErrors?.length > 0) {
          const simpleError = simpleResponse.discountCodeDelete.userErrors[0]
          throw new Error(`Error al eliminar descuento: ${simpleError.message}`)
        }
        return
      }
      throw new Error(`Error al eliminar descuento: ${error.message}`)
    }
  },

  async getDiscount(id: string): Promise<ShopifyDiscount | null> {
    const formattedId = id.startsWith('gid://shopify/DiscountCodeNode/')
      ? id
      : `gid://shopify/DiscountCodeNode/${id}`

    const GET_DISCOUNT_QUERY = `
      query getDiscount($id: ID!) {
        codeDiscountNode(id: $id) {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              status
              startsAt
              endsAt
              usageLimit
              appliesOncePerCustomer

              codes(first: 1) {
                edges {
                  node {
                    code
                  }
                }
              }
              customerGets {
                value {
                  ... on DiscountAmount {
                    amount {
                      amount
                      currencyCode
                    }
                    appliesOnEachItem
                  }
                  ... on DiscountPercentage {
                    percentage
                  }
                }
                items {
                  ... on AllDiscountItems {
                    allItems
                  }
                  ... on DiscountProducts {
                    products(first: 50) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                  ... on DiscountCollections {
                    collections(first: 50) {
                      edges {
                        node {
                          id
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const response = await makeAdminApiRequest<GetDiscountResponse>(GET_DISCOUNT_QUERY, {
      id: formattedId,
    })

    if (!response.codeDiscountNode) {
      return null
    }

    const node = response.codeDiscountNode
    const discount = node.codeDiscount
    const codes = discount.codes.edges.map((edge: any) => edge.node.code)

    let type: 'PERCENTAGE' | 'FIXED_AMOUNT' = 'PERCENTAGE'
    let value = 0

    if (discount.customerGets.value.percentage !== undefined) {
      type = 'PERCENTAGE'
      value = discount.customerGets.value.percentage * 100
    } else if (discount.customerGets.value.discountAmount) {
      type = 'FIXED_AMOUNT'
      value = parseFloat(discount.customerGets.value.discountAmount.amount)
    }

    let appliesTo: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'COLLECTIONS' = 'ALL_PRODUCTS'
    const productIds: string[] = []
    const collectionIds: string[] = []

    if (discount.customerGets.items.allItems) {
      appliesTo = 'ALL_PRODUCTS'
    } else if (
      discount.customerGets.items.products?.edges &&
      discount.customerGets.items.products.edges.length > 0
    ) {
      appliesTo = 'SPECIFIC_PRODUCTS'
      productIds.push(
        ...discount.customerGets.items.products.edges.map((edge: any) => edge.node.id)
      )
    } else if (
      discount.customerGets.items.collections?.edges &&
      discount.customerGets.items.collections.edges.length > 0
    ) {
      appliesTo = 'COLLECTIONS'
      collectionIds.push(
        ...discount.customerGets.items.collections.edges.map((edge: any) => edge.node.id)
      )
    }

    return {
      appliesOncePerCustomer: discount.appliesOncePerCustomer,
      appliesTo,
      code: codes[0] ?? 'N/A',
      collectionIds: collectionIds.length > 0 ? collectionIds : undefined,
      createdAt: discount.startsAt,
      endsAt: discount.endsAt,
      id: node.id,
      isActive: discount.status === 'ACTIVE',
      productIds: productIds.length > 0 ? productIds : undefined,
      startsAt: discount.startsAt,
      title: discount.title ?? 'Sin título',
      type,
      updatedAt: discount.startsAt,
      usageLimit: discount.usageLimit,
      value,
    }
  },

  async getDiscounts(): Promise<ShopifyDiscount[]> {
    const response = await makeAdminApiRequest<GetDiscountsResponse>(GET_DISCOUNTS_QUERY, {
      first: 50,
    })

    if (!response.codeDiscountNodes?.edges) {
      return []
    }

    return response.codeDiscountNodes.edges.map(({ node }: any) => {
      const discount = node.codeDiscount
      const codes = discount.codes.edges.map((edge: any) => edge.node.code)

      let type: 'PERCENTAGE' | 'FIXED_AMOUNT' = 'PERCENTAGE'
      let value = 0

      if (discount.customerGets.value.percentage !== undefined) {
        type = 'PERCENTAGE'
        value = discount.customerGets.value.percentage * 100
      } else if (discount.customerGets.value.amount) {
        type = 'FIXED_AMOUNT'
        value = parseFloat(discount.customerGets.value.amount.amount)
      }

      let appliesTo: 'ALL_PRODUCTS' | 'SPECIFIC_PRODUCTS' | 'COLLECTIONS' = 'ALL_PRODUCTS'
      const productIds: string[] = []
      const collectionIds: string[] = []

      if (discount.customerGets.items.allItems) {
        appliesTo = 'ALL_PRODUCTS'
      } else if (discount.customerGets.items.products?.edges.length > 0) {
        appliesTo = 'SPECIFIC_PRODUCTS'
        productIds.push(
          ...discount.customerGets.items.products.edges.map((edge: any) => edge.node.id)
        )
      } else if (discount.customerGets.items.collections?.edges.length > 0) {
        appliesTo = 'COLLECTIONS'
        collectionIds.push(
          ...discount.customerGets.items.collections.edges.map((edge: any) => edge.node.id)
        )
      }

      return {
        appliesOncePerCustomer: discount.appliesOncePerCustomer,
        appliesTo,
        code: codes[0] ?? 'N/A',
        collectionIds: collectionIds.length > 0 ? collectionIds : undefined,
        createdAt: discount.startsAt,
        endsAt: discount.endsAt,
        id: node.id,
        isActive: discount.status === 'ACTIVE',
        productIds: productIds.length > 0 ? productIds : undefined,
        startsAt: discount.startsAt,
        title: discount.title ?? 'Sin título',
        type,
        updatedAt: discount.startsAt,
        usageLimit: discount.usageLimit,
        value,
      }
    })
  },

  async toggleDiscountStatus(id: string, isActive: boolean): Promise<void> {
    const formattedId = id.startsWith('gid://shopify/DiscountCodeNode/')
      ? id
      : `gid://shopify/DiscountCodeNode/${id}`

    const now = new Date().toISOString()
    const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

    const updateInput = {
      endsAt: isActive ? future : now,
    }

    const TOGGLE_MUTATION = `
      mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                status
                endsAt
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const response = await makeAdminApiRequest<UpdateDiscountResponse>(TOGGLE_MUTATION, {
      basicCodeDiscount: updateInput,
      id: formattedId,
    })

    if (response.discountCodeBasicUpdate?.userErrors?.length > 0) {
      const error = response.discountCodeBasicUpdate.userErrors[0]
      throw new Error(`Error al cambiar estado del descuento: ${error.message}`)
    }
  },

  async updateDiscount(input: UpdateShopifyDiscountInput): Promise<ShopifyDiscount> {
    const formattedId = input.id.startsWith('gid://shopify/DiscountCodeNode/')
      ? input.id
      : `gid://shopify/DiscountCodeNode/${input.id}`

    const UPDATE_DISCOUNT_MUTATION = `
      mutation discountCodeBasicUpdate($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                status
                startsAt
                endsAt
                usageLimit
                appliesOncePerCustomer

                codes(first: 1) {
                  edges {
                    node {
                      code
                    }
                  }
                }
                customerGets {
                  value {
                    ... on DiscountAmount {
                      amount {
                        amount
                        currencyCode
                      }
                      appliesOnEachItem
                    }
                    ... on DiscountPercentage {
                      percentage
                    }
                  }
                  items {
                    ... on AllDiscountItems {
                      allItems
                    }
                    ... on DiscountProducts {
                      products(first: 10) {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                    ... on DiscountCollections {
                      collections(first: 10) {
                        edges {
                          node {
                            id
                            title
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const updateInput: Record<string, unknown> = {}

    if (input.title !== undefined) {
      updateInput.title = input.title
    }
    if (input.endsAt !== undefined) {
      updateInput.endsAt = input.endsAt
    }
    if (input.usageLimit !== undefined) {
      updateInput.usageLimit = input.usageLimit
    }
    if (input.appliesOncePerCustomer !== undefined) {
      updateInput.appliesOncePerCustomer = input.appliesOncePerCustomer
    }

    if (input.value !== undefined) {
      const discountType = input.type ?? 'PERCENTAGE'
      let discountValue: Record<string, unknown>

      if (discountType === 'PERCENTAGE') {
        discountValue = {
          percentage: input.value / 100,
        }
      } else {
        discountValue = {
          discountAmount: {
            amount: input.value.toString(),
            appliesOnEachItem: true,
          },
        }
      }

      updateInput.customerGets = {
        value: discountValue,
      }
    }

    if (input.appliesTo !== undefined) {
      let items: Record<string, unknown> = {}

      if (input.appliesTo === 'ALL_PRODUCTS') {
        items = { all: true }
      } else if (input.appliesTo === 'SPECIFIC_PRODUCTS' && input.productIds?.length) {
        items = {
          products: {
            productsToAdd: input.productIds,
          },
        }
      } else if (input.appliesTo === 'COLLECTIONS' && input.collectionIds?.length) {
        items = {
          collections: {
            collectionsToAdd: input.collectionIds,
          },
        }
      }

      if (Object.keys(items).length > 0) {
        updateInput.customerGets = {
          ...(updateInput.customerGets || {}),
          items,
        }
      }
    }

    const response = await makeAdminApiRequest<UpdateDiscountResponse>(UPDATE_DISCOUNT_MUTATION, {
      basicCodeDiscount: updateInput,
      id: formattedId,
    })

    if (response.discountCodeBasicUpdate?.userErrors?.length > 0) {
      const error = response.discountCodeBasicUpdate.userErrors[0]
      throw new Error(`Error al actualizar descuento: ${error.message}`)
    }

    const updatedDiscount = response.discountCodeBasicUpdate?.codeDiscountNode
    if (!updatedDiscount) {
      throw new Error('Error: No se pudo actualizar el descuento')
    }

    const codes = updatedDiscount.codeDiscount.codes.edges.map((edge: any) => edge.node.code)
    const shopifyStatus = updatedDiscount.codeDiscount.status
    const isActiveFromStatus = shopifyStatus === 'ACTIVE'

    const result = {
      appliesOncePerCustomer:
        input.appliesOncePerCustomer ?? updatedDiscount.codeDiscount.appliesOncePerCustomer,
      appliesTo: input.appliesTo ?? 'ALL_PRODUCTS',
      code: codes[0] ?? 'N/A',
      collectionIds: input.collectionIds,
      createdAt: updatedDiscount.codeDiscount.startsAt,
      endsAt: input.endsAt ?? updatedDiscount.codeDiscount.endsAt,
      id: updatedDiscount.id,
      isActive: isActiveFromStatus,
      productIds: input.productIds,
      startsAt: updatedDiscount.codeDiscount.startsAt,
      title: input.title ?? updatedDiscount.codeDiscount.title ?? 'Sin título',
      type: input.type ?? 'PERCENTAGE',
      updatedAt: updatedDiscount.codeDiscount.startsAt,
      usageLimit: input.usageLimit ?? updatedDiscount.codeDiscount.usageLimit,
      value: input.value ?? 0,
    }

    return result
  },
}
