import { NextResponse } from 'next/server'

import { api } from '@/modules/shopify/api'
import { type EnrichedFilterOptions, type FilterValue, type Product } from '@/modules/shopify/types'

const categorizeTag = (tag: string): { category: keyof EnrichedFilterOptions; label: string } => {
  const trimmedTag = tag.trim()

  if (trimmedTag.startsWith('locacion-')) {
    const label = trimmedTag.replace('locacion-', '').replace(/-/g, ' ')
    return { category: 'locations', label: label.charAt(0).toUpperCase() + label.slice(1) }
  }

  if (/^Formato (Grande|Mediano|Pequeño|Miniatura)$/.test(trimmedTag)) {
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
    const shopifyResponse = await api.getProducts({ first: 250 })
    const products = shopifyResponse.data.products

    const allTags = new Set<string>()
    const allVendors = new Set<string>()
    const allProductTypes = new Set<string>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach((product: Product) => {
      product.tags?.forEach((tag) => allTags.add(tag))
      if (product.vendor) allVendors.add(product.vendor)
      if (product.productType) allProductTypes.add(product.productType)
      const price = parseFloat(product.priceRange.minVariantPrice.amount)
      if (price < minPrice) minPrice = price
      if (price > maxPrice) maxPrice = price
    })

    const [techniquesRes, locationsRes] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/options/techniques`),
      fetch(`${process.env.NEXTAUTH_URL}/api/options/locations`),
    ])

    const techniques = techniquesRes.ok ? await techniquesRes.json() : []
    const locations = locationsRes.ok ? await locationsRes.json() : []

    const structuredFilters: EnrichedFilterOptions = {
      artists: [...allVendors].map((v) => ({ count: 0, input: v, label: v })),
      formats: [],
      locations: locations.map((loc: { id: string; name: string }) => ({
        count: 0,
        input: loc.name,
        label: loc.name,
      })),
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
      const { category, label } = categorizeTag(tag)
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
