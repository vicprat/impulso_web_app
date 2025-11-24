export type DimensionCategory = 'chico' | 'mediano' | 'grande' | 'extra-grande'

const DIMENSION_RANGES = {
  chico: { max: 30, min: 0 },
  'extra-grande': { max: Infinity, min: 100 },
  grande: { max: 100, min: 60 },
  mediano: { max: 60, min: 30 },
} as const

export function getDimensionCategoryRanges() {
  return DIMENSION_RANGES
}

export function getDimensionCategoryLabel(category: DimensionCategory): string {
  const range = DIMENSION_RANGES[category]
  const maxLabel = range.max === Infinity ? '∞' : `${range.max}`

  const labels: Record<DimensionCategory, string> = {
    chico: `Chico (0-${range.max} cm)`,
    'extra-grande': `Extra Grande (${range.min}+ cm)`,
    grande: `Grande (${range.min}-${range.max} cm)`,
    mediano: `Mediano (${range.min}-${range.max} cm)`,
  }

  return labels[category]
}

export function categorizeDimensions(
  height?: string | null,
  width?: string | null,
  depth?: string | null
): DimensionCategory | null {
  if (!height || !width) return null

  const heightNum = parseFloat(height)
  const widthNum = parseFloat(width)
  const depthNum = depth ? parseFloat(depth) : 0

  if (isNaN(heightNum) || isNaN(widthNum) || (depth && isNaN(depthNum))) {
    return null
  }

  const maxDimension = Math.max(heightNum, widthNum, depthNum)

  if (maxDimension < DIMENSION_RANGES.mediano.min) {
    return 'chico'
  } else if (maxDimension < DIMENSION_RANGES.grande.min) {
    return 'mediano'
  } else if (maxDimension < DIMENSION_RANGES['extra-grande'].min) {
    return 'grande'
  } else {
    return 'extra-grande'
  }
}

export function calculateDimensionValue(
  height?: string | null,
  width?: string | null,
  depth?: string | null
): number {
  if (!height || !width) return 0

  const heightNum = parseFloat(height)
  const widthNum = parseFloat(width)
  const depthNum = depth ? parseFloat(depth) : 0

  if (isNaN(heightNum) || isNaN(widthNum) || (depth && isNaN(depthNum))) {
    return 0
  }

  return Math.max(heightNum, widthNum, depthNum)
}

export function formatDimensions(
  height?: string | null,
  width?: string | null,
  depth?: string | null
): string {
  const parts: string[] = []

  if (height) parts.push(height)
  if (width) parts.push(width)
  if (depth) parts.push(depth)

  return parts.length > 0 ? parts.join(' × ') : ''
}

export function formatDimensionsWithUnit(
  height?: string | null,
  width?: string | null,
  depth?: string | null,
  unit = 'cm'
): string {
  const parts: string[] = []

  if (height) parts.push(`${height} ${unit}`)
  if (width) parts.push(`${width} ${unit}`)
  if (depth) parts.push(`${depth} ${unit}`)

  return parts.length > 0 ? parts.join(' × ') : ''
}
