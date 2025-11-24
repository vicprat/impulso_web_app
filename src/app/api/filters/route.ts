import { NextResponse } from 'next/server'

import {
  categorizeDimensions,
  getDimensionCategoryLabel,
  type DimensionCategory,
} from '@/helpers/dimensions'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { type EnrichedFilterOptions, type FilterValue } from '@/modules/shopify/types'

const GET_PRODUCTS_WITH_METAFIELDS_QUERY = `
  query GetProductsWithMetafields($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          tags
          productType
          vendor
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          metafields(first: 50, namespace: "art_details") {
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
    }
  }
`

const categorizeTag = (
  tag: string,
  hasDimensions: boolean
): { category: keyof EnrichedFilterOptions; label: string } => {
  const trimmedTag = tag.trim()

  // Si hay dimensiones disponibles, no categorizar como formato
  if (!hasDimensions && /^Formato (Grande|Mediano|Pequeño|Miniatura)$/.test(trimmedTag)) {
    return { category: 'formats', label: trimmedTag }
  }
  if (/^\d{4}$/.test(trimmedTag)) {
    return { category: 'years', label: trimmedTag }
  }

  const materialKeywords: Record<string, string> = {
    Acrílico: 'techniques',
    Acuarela: 'techniques',
    Bronce: 'techniques',
    Carboncillo: 'techniques',
    Collage: 'techniques',
    Fotografía: 'techniques',
    Grabado: 'techniques',
    Grafito: 'techniques',
    Litografía: 'techniques',
    Lápiz: 'techniques',
    Madera: 'techniques',
    Metal: 'techniques',
    Papel: 'techniques',
    Pastel: 'techniques',
    Piedra: 'techniques',
    Tela: 'techniques',
    Tinta: 'techniques',
    'Técnica Mixta': 'techniques',
    Óleo: 'techniques',
  }
  if (materialKeywords[trimmedTag]) {
    return {
      category: materialKeywords[trimmedTag] as keyof EnrichedFilterOptions,
      label: trimmedTag,
    }
  }

  return { category: 'otherTags', label: trimmedTag }
}

export async function GET() {
  try {
    const response = await makeAdminApiRequest<{
      products: {
        edges: {
          node: {
            id: string
            title: string
            handle: string
            tags: string[]
            productType: string
            vendor: string
            priceRange: {
              minVariantPrice: {
                amount: string
                currencyCode: string
              }
            }
            metafields: {
              edges: {
                node: {
                  namespace: string
                  key: string
                  value: string
                }
              }[]
            }
          }
        }[]
      }
    }>(GET_PRODUCTS_WITH_METAFIELDS_QUERY, { first: 250 })

    const products = response.products.edges.map((edge) => ({
      ...edge.node,
      metafields: edge.node.metafields.edges.map((metafieldEdge) => metafieldEdge.node),
    }))

    const allTags = new Set<string>()
    const allVendors = new Set<string>()
    const allProductTypes = new Set<string>()
    const dimensionCategories = new Set<string>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach((product) => {
      product.tags?.forEach((tag) => allTags.add(tag))
      if (product.vendor) allVendors.add(product.vendor)
      if (product.productType) allProductTypes.add(product.productType)
      const price = parseFloat(product.priceRange.minVariantPrice.amount)
      if (price < minPrice) minPrice = price
      if (price > maxPrice) maxPrice = price

      // Extraer dimensiones de los metafields y categorizar
      if (product.metafields) {
        const height = product.metafields.find((mf) => mf.key === 'height')?.value
        const width = product.metafields.find((mf) => mf.key === 'width')?.value
        const depth = product.metafields.find((mf) => mf.key === 'depth')?.value

        if (height && width) {
          const category = categorizeDimensions(height, width, depth)
          if (category) {
            dimensionCategories.add(category)
          }
        }
      }
    })

    const techniquesRes = await fetch(`${process.env.NEXTAUTH_URL}/api/options/techniques`)
    const techniques = techniquesRes.ok ? await techniquesRes.json() : []

    const structuredFilters: EnrichedFilterOptions = {
      artists: [...allVendors].map((v) => ({ count: 0, input: v, label: v })),
      dimensions: [...dimensionCategories].map((cat) => ({
        count: 0,
        input: cat,
        label: getDimensionCategoryLabel(cat as DimensionCategory),
      })),
      formats: dimensionCategories.size > 0 ? [] : [],
      otherTags: [],
      price: {
        max: Math.ceil(maxPrice === 0 ? 10000 : maxPrice),
        min: Math.floor(minPrice === Infinity ? 0 : minPrice),
      },
      productTypes: [...allProductTypes].map((pt) => ({ count: 0, input: pt, label: pt })),
      series: [],
      techniques: techniques.map((tech: { id: string; name: string }) => ({
        count: 0,
        input: tech.name,
        label: tech.name,
      })),
      years: [],
    }

    allTags.forEach((tag) => {
      const { category, label } = categorizeTag(tag, dimensionCategories.size > 0)
      const categoryArray = structuredFilters[category] as FilterValue[]
      if (!categoryArray.some((item) => item.input === tag)) {
        categoryArray.push({ count: 0, input: tag, label })
      }
    })

    return NextResponse.json(structuredFilters)
  } catch (error) {
    console.error('Error in /api/filters route:', error)
    return NextResponse.json(
      { error: (error as Error).message, message: 'Error al construir los filtros.' },
      { status: 500 }
    )
  }
}
