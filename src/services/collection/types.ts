export interface Collection {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  image?: {
    id: string
    url: string
    altText?: string
    width?: number
    height?: number
  }
  updatedAt: string
  productsCount: number
  ruleSet?: {
    appliedDisjunctively: boolean
    rules: {
      column: string
      relation: string
      condition: string
    }[]
  }
  products?: {
    id: string
    title: string
    handle: string
  }[]
}

export interface CreateCollectionInput {
  title: string
  description?: string
  handle?: string
  image?: {
    id: string
    url: string
    altText?: string
  }
  ruleSet?: {
    appliedDisjunctively: boolean
    rules: {
      column: string
      relation: string
      condition: string
    }[]
  }
  products?: string[]
}

export interface UpdateCollectionInput {
  id: string
  title?: string
  description?: string
  handle?: string
  image?: {
    id: string
    url: string
    altText?: string
  }
  ruleSet?: {
    appliedDisjunctively: boolean
    rules: {
      column: string
      relation: string
      condition: string
    }[]
  }
}

export interface CollectionsResponse {
  collections: Collection[]
  pageInfo: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string | null
    endCursor: string | null
  }
}
