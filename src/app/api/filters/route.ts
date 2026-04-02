import { NextResponse } from 'next/server'

import {
  categorizeDimensions,
  getDimensionCategoryLabel,
  type DimensionCategory,
} from '@/helpers/dimensions'
import { CacheManager } from '@/lib/cache'
import { type EnrichedFilterOptions } from '@/modules/shopify/types'

const ALL_DIMENSION_CATEGORIES: DimensionCategory[] = ['chico', 'mediano', 'grande', 'extra-grande']

export async function GET() {
  try {
    const allProducts = await CacheManager.getFullCatalog('storefront')

    const products = allProducts.filter((p) => p.status === 'ACTIVE')

    const vendorCounts = new Map<string, number>()
    const productTypeCounts = new Map<string, number>()
    const locationCounts = new Map<string, number>()
    const arrendamientoCounts = new Map<string, number>()
    const dimensionCounts = new Map<string, number>()
    const techniqueCounts = new Map<string, number>()
    const yearCounts = new Map<string, number>()
    const seriesCounts = new Map<string, number>()
    let minPrice = Infinity
    let maxPrice = 0

    products.forEach((product) => {
      const price = parseFloat(product.variants?.[0]?.price?.amount ?? '0')
      if (price < minPrice) minPrice = price
      if (price > maxPrice) maxPrice = price

      if (product.vendor) {
        vendorCounts.set(product.vendor, (vendorCounts.get(product.vendor) ?? 0) + 1)
      }

      if (product.productType) {
        productTypeCounts.set(
          product.productType,
          (productTypeCounts.get(product.productType) ?? 0) + 1
        )
      }

      const artwork = product.artworkDetails
      if (artwork) {
        if (artwork.height && artwork.width) {
          const category = categorizeDimensions(artwork.height, artwork.width, artwork.depth)
          if (category) {
            dimensionCounts.set(category, (dimensionCounts.get(category) ?? 0) + 1)
          }
        }

        if (artwork.location) {
          locationCounts.set(artwork.location, (locationCounts.get(artwork.location) ?? 0) + 1)
        }

        if (artwork.medium) {
          techniqueCounts.set(artwork.medium, (techniqueCounts.get(artwork.medium) ?? 0) + 1)
        }

        if (artwork.year) {
          yearCounts.set(artwork.year, (yearCounts.get(artwork.year) ?? 0) + 1)
        }

        if (artwork.serie) {
          seriesCounts.set(artwork.serie, (seriesCounts.get(artwork.serie) ?? 0) + 1)
        }
      }

      if (product.tags) {
        for (const tag of product.tags) {
          if (tag.startsWith('Arrendamiento:')) {
            const value = tag.replace('Arrendamiento:', '').trim()
            if (value) {
              arrendamientoCounts.set(value, (arrendamientoCounts.get(value) ?? 0) + 1)
            }
          }
        }
      }
    })

    const techniquesRes = await fetch(`${process.env.NEXTAUTH_URL}/api/options/techniques`)
    const techniques = techniquesRes.ok ? await techniquesRes.json() : []

    const structuredFilters: EnrichedFilterOptions = {
      arrendamientos: Array.from(arrendamientoCounts.entries())
        .map(([a, count]) => ({ count, input: a, label: a }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      artists: Array.from(vendorCounts.entries())
        .map(([v, count]) => ({ count, input: v, label: v }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      dimensions: ALL_DIMENSION_CATEGORIES.map((cat) => ({
        count: dimensionCounts.get(cat) ?? 0,
        input: cat,
        label: getDimensionCategoryLabel(cat),
      })).sort((a, b) => a.label.localeCompare(b.label)),
      formats: [],
      locations: Array.from(locationCounts.entries())
        .map(([l, count]) => ({ count, input: l, label: l }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      otherTags: [],
      price: {
        max: Math.ceil(maxPrice === 0 ? 10000 : maxPrice),
        min: Math.floor(minPrice === Infinity ? 0 : minPrice),
      },
      productTypes: Array.from(productTypeCounts.entries())
        .map(([pt, count]) => ({ count, input: pt, label: pt }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      series: Array.from(seriesCounts.entries())
        .map(([s, count]) => ({ count, input: s, label: s }))
        .sort((a, b) => a.label.localeCompare(b.label)),
      techniques: techniques
        .map((tech: { id: string; name: string }) => ({
          count: techniqueCounts.get(tech.name) ?? 0,
          input: tech.name,
          label: tech.name,
        }))
        .sort((a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label)),
      years: Array.from(yearCounts.entries())
        .map(([y, count]) => ({ count, input: y, label: y }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    }

    return NextResponse.json(structuredFilters)
  } catch (error) {
    console.error('Error in /api/filters route:', error)
    return NextResponse.json(
      { error: (error as Error).message, message: 'Error al construir los filtros.' },
      { status: 500 }
    )
  }
}
