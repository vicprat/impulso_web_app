import { config } from 'dotenv'

config()

interface Product {
  id: string
  title: string
  vendor: string
  productType: string
  tags: string[]
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  artworkDetails?: {
    medium?: string
    year?: string
    height?: string
    width?: string
    depth?: string
  }
}

interface TestResult {
  passed: boolean
  total: number
  failures: {
    product: string
    expected: string
    actual: string
    reason: string
  }[]
  warning?: string
}

async function testFilter(
  filterName: string,
  params: Record<string, string>,
  validator: (product: Product) => {
    passed: boolean
    reason?: string
    expected?: string
    actual?: string
  }
): Promise<TestResult> {
  const searchParams = new URLSearchParams(params)
  searchParams.set('limit', '100')

  console.log(`\n${'='.repeat(70)}`)
  console.log(`🔍 PROBANDO: ${filterName}`)
  console.log(`${'='.repeat(70)}`)
  console.log(`📋 Parámetros enviados:`)
  Object.entries(params).forEach(([key, value]) => {
    console.log(`   - ${key}: "${value}"`)
  })

  const url = `http://localhost:3030/api/store/products?${searchParams.toString()}`
  console.log(`\n📡 URL completa:\n   ${url}`)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const products: Product[] = data.data?.products || []

    console.log(`\n📦 Productos obtenidos: ${products.length}`)

    if (products.length === 0) {
      console.log(`⚠️  ADVERTENCIA: No se encontraron productos con este filtro`)
      return {
        failures: [],
        passed: true,
        total: 0,
        warning: 'No se encontraron productos',
      }
    }

    const failures: TestResult['failures'] = []

    console.log(`\n🔬 Analizando primeros 3 productos:`)
    products.slice(0, 3).forEach((p, idx) => {
      console.log(`\n   ${idx + 1}. "${p.title}" (${p.vendor})`)
      console.log(`      - Tipo: ${p.productType}`)
      console.log(`      - Precio: $${p.priceRange.minVariantPrice.amount}`)
      console.log(`      - Técnica: ${p.artworkDetails?.medium || 'N/A'}`)
      console.log(`      - Año: ${p.artworkDetails?.year || 'N/A'}`)
      console.log(
        `      - Dimensiones: ${p.artworkDetails?.height && p.artworkDetails?.width ? `${p.artworkDetails.height} x ${p.artworkDetails.width}` : 'N/A'}`
      )
      console.log(`      - Tags: ${p.tags.slice(0, 5).join(', ')}${p.tags.length > 5 ? '...' : ''}`)
    })

    console.log(`\n🧪 Validando todos los productos...`)

    for (const product of products) {
      const result = validator(product)

      if (!result.passed && result.reason) {
        failures.push({
          actual: result.actual || 'N/A',
          expected: result.expected || 'N/A',
          product: `${product.title} (${product.vendor})`,
          reason: result.reason,
        })
      }
    }

    const passed = failures.length === 0

    if (passed) {
      console.log(`\n✅ ÉXITO: Todos los productos cumplen con el filtro`)
    } else {
      console.log(`\n❌ FALLO: ${failures.length}/${products.length} productos NO cumplen:`)
      failures.slice(0, 10).forEach((f, idx) => {
        console.log(`\n   ${idx + 1}. ${f.product}`)
        console.log(`      Esperado: ${f.expected}`)
        console.log(`      Actual: ${f.actual}`)
        console.log(`      Razón: ${f.reason}`)
      })
      if (failures.length > 10) {
        console.log(`\n   ... y ${failures.length - 10} productos más con errores`)
      }
    }

    return {
      failures,
      passed,
      total: products.length,
    }
  } catch (error) {
    console.error(`\n❌ ERROR al probar filtro:`, error)
    return {
      failures: [],
      passed: false,
      total: 0,
    }
  }
}

async function getFilterOptions() {
  const response = await fetch('http://localhost:3030/api/filters')
  if (!response.ok) {
    throw new Error('Failed to fetch filter options')
  }
  return response.json()
}

async function main() {
  console.log('\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(20)}🧪 PRUEBA EXHAUSTIVA DE FILTROS${' '.repeat(27)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  const results: { name: string; result: TestResult; category: string }[] = []

  console.log('\n📥 Obteniendo opciones de filtros desde el API...')
  const filterOptions = await getFilterOptions()

  console.log(`\n📊 Opciones disponibles:`)
  console.log(`   - Artistas: ${filterOptions.artists.length}`)
  console.log(`   - Tipos de obra: ${filterOptions.productTypes.length}`)
  console.log(`   - Técnicas: ${filterOptions.techniques.length}`)
  console.log(`   - Formatos: ${filterOptions.formats.length}`)
  console.log(`   - Dimensiones: ${filterOptions.dimensions.length}`)
  console.log(`   - Años: ${filterOptions.years.length}`)
  console.log(`   - Otros tags: ${filterOptions.otherTags.length}`)

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(30)}💰 FILTROS DE PRECIO${' '.repeat(29)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  results.push({
    category: 'precio',
    name: 'Precio máximo 5000',
    result: await testFilter('Precio máximo 5000', { priceMax: '5000' }, (p) => {
      const price = parseFloat(p.priceRange.minVariantPrice.amount)
      return price <= 5000
        ? { passed: true }
        : {
            actual: `$${price}`,
            expected: '<= $5000',
            passed: false,
            reason: 'Precio mayor al máximo',
          }
    }),
  })

  results.push({
    category: 'precio',
    name: 'Precio rango 1000-5000',
    result: await testFilter(
      'Precio entre 1000 y 5000',
      { priceMax: '5000', priceMin: '1000' },
      (p) => {
        const price = parseFloat(p.priceRange.minVariantPrice.amount)
        if (price < 1000) {
          return {
            actual: `$${price}`,
            expected: '$1000-$5000',
            passed: false,
            reason: 'Precio menor al mínimo',
          }
        }
        if (price > 5000) {
          return {
            actual: `$${price}`,
            expected: '$1000-$5000',
            passed: false,
            reason: 'Precio mayor al máximo',
          }
        }
        return { passed: true }
      }
    ),
  })

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(29)}👤 FILTROS DE ARTISTA${' '.repeat(28)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  for (let i = 0; i < Math.min(3, filterOptions.artists.length); i++) {
    const vendor = filterOptions.artists[i]
    if (vendor.input !== 'Evento') {
      results.push({
        category: 'artista',
        name: `Artista: ${vendor.label}`,
        result: await testFilter(`Artista: ${vendor.label}`, { vendor: vendor.input }, (p) =>
          p.vendor === vendor.input
            ? { passed: true }
            : {
                actual: p.vendor,
                expected: vendor.input,
                passed: false,
                reason: 'Artista no coincide',
              }
        ),
      })
    }
  }

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(27)}🎨 FILTROS DE TIPO DE OBRA${' '.repeat(26)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  for (let i = 0; i < Math.min(3, filterOptions.productTypes.length); i++) {
    const productType = filterOptions.productTypes[i]
    results.push({
      category: 'tipo',
      name: `Tipo: ${productType.label}`,
      result: await testFilter(
        `Tipo de obra: ${productType.label}`,
        { artworkType: productType.input },
        (p) =>
          p.productType === productType.input
            ? { passed: true }
            : {
                actual: p.productType,
                expected: productType.input,
                passed: false,
                reason: 'Tipo de obra no coincide',
              }
      ),
    })
  }

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(28)}🖌️  FILTROS DE TÉCNICA${' '.repeat(27)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  for (let i = 0; i < Math.min(5, filterOptions.techniques.length); i++) {
    const technique = filterOptions.techniques[i]
    results.push({
      category: 'tecnica',
      name: `Técnica: ${technique.label}`,
      result: await testFilter(
        `Técnica: ${technique.label}`,
        { technique: technique.input },
        (p) =>
          p.artworkDetails?.medium === technique.input
            ? { passed: true }
            : {
                actual: p.artworkDetails?.medium || 'N/A',
                expected: technique.input,
                passed: false,
                reason: 'Técnica no coincide',
              }
      ),
    })
  }

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(31)}📅 FILTROS DE AÑO${' '.repeat(30)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  for (let i = 0; i < Math.min(3, filterOptions.years.length); i++) {
    const year = filterOptions.years[i]

    console.log(`\n⚠️  NOTA: Los años se filtran por metafield artworkDetails.year`)
    console.log(`   Buscando productos con año: "${year.input}"`)

    results.push({
      category: 'año',
      name: `Año: ${year.label}`,
      result: await testFilter(`Año: ${year.label}`, { year: year.input }, (p) =>
        p.artworkDetails?.year === year.input
          ? { passed: true }
          : {
              actual: p.artworkDetails?.year || 'N/A',
              expected: year.input,
              passed: false,
              reason: 'Año no coincide',
            }
      ),
    })
  }

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(27)}📏 FILTROS DE DIMENSIONES${' '.repeat(27)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  for (let i = 0; i < Math.min(3, filterOptions.dimensions.length); i++) {
    const dimension = filterOptions.dimensions[i]

    console.log(`\n⚠️  NOTA: Las dimensiones se filtran por coincidencia exacta de texto`)
    console.log(`   Buscando: "${dimension.input}"`)

    results.push({
      category: 'dimensiones',
      name: `Dimensión: ${dimension.label}`,
      result: await testFilter(
        `Dimensión: ${dimension.label}`,
        { dimensions: dimension.input },
        (p) => {
          const height = p.artworkDetails?.height
          const width = p.artworkDetails?.width
          const depth = p.artworkDetails?.depth

          if (!height || !width) {
            return {
              actual: 'Sin dimensiones',
              expected: dimension.input,
              passed: false,
              reason: 'Producto no tiene dimensiones',
            }
          }

          const dimensionText = depth
            ? `${height} x ${width} x ${depth} cm`
            : `${height} x ${width} cm`

          return dimensionText.trim() === dimension.input.trim()
            ? { passed: true }
            : {
                actual: dimensionText,
                expected: dimension.input,
                passed: false,
                reason: 'Dimensión no coincide exactamente',
              }
        }
      ),
    })
  }

  console.log('\n\n')
  console.log(`╔${'═'.repeat(78)}╗`)
  console.log(`║${' '.repeat(30)}📊 RESUMEN FINAL${' '.repeat(33)}║`)
  console.log(`╚${'═'.repeat(78)}╝`)

  const categories = ['precio', 'artista', 'tipo', 'tecnica', 'año', 'dimensiones']

  for (const category of categories) {
    const categoryResults = results.filter((r) => r.category === category)
    if (categoryResults.length === 0) continue

    console.log(`\n${getCategoryEmoji(category)} ${category.toUpperCase()}:`)

    for (const { name, result } of categoryResults) {
      const status = result.passed ? '✅' : '❌'
      const warning = result.warning ? ` ⚠️  ${result.warning}` : ''
      const info =
        result.total > 0
          ? `${result.total} productos, ${result.failures.length} errores`
          : 'Sin resultados'
      console.log(`   ${status} ${name}: ${info}${warning}`)
    }
  }

  const totalTests = results.length
  const passedTests = results.filter((r) => r.result.passed).length
  const failedTests = totalTests - passedTests

  console.log(`\n${'═'.repeat(80)}`)
  console.log(`\n🎯 RESULTADO GENERAL: ${passedTests}/${totalTests} pruebas exitosas`)

  if (failedTests > 0) {
    console.log(`\n⚠️  ${failedTests} filtros tienen problemas:\n`)

    const failedByCategory = categories
      .map((cat) => ({
        category: cat,
        count: results.filter((r) => r.category === cat && !r.result.passed).length,
      }))
      .filter((c) => c.count > 0)

    failedByCategory.forEach(({ category, count }) => {
      console.log(`   ${getCategoryEmoji(category)} ${category}: ${count} filtros fallidos`)
    })
  }

  if (passedTests === totalTests) {
    console.log('\n🎉 ¡Todos los filtros funcionan correctamente!')
    process.exit(0)
  } else {
    console.log('\n❌ Algunos filtros necesitan corrección')
    process.exit(1)
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    artista: '�',
    año: '�',
    dimensiones: '📏',
    precio: '💰',
    tecnica: '🖌️',
    tipo: '🎨',
  }
  return emojis[category] || '📌'
}

main().catch((error) => {
  console.error('\n💥 Error fatal:', error)
  process.exit(1)
})
