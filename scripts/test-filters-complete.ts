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
  searchParams.set('limit', '50')

  console.log(`\n🔍 Probando filtro: ${filterName}`)
  console.log(`📋 Parámetros: ${JSON.stringify(params)}`)

  const url = `http://localhost:3030/api/store/products?${searchParams.toString()}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const products: Product[] = data.data?.products || []

    console.log(`📦 Total de productos obtenidos: ${products.length}`)

    const failures: TestResult['failures'] = []

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
      console.log('✅ Todos los productos cumplen con el filtro')
    } else {
      console.log(`❌ ${failures.length} productos NO cumplen con el filtro:`)
      failures.slice(0, 5).forEach((f, idx) => {
        console.log(`   ${idx + 1}. ${f.product}`)
        console.log(`      Esperado: ${f.expected}, Actual: ${f.actual}`)
      })
      if (failures.length > 5) {
        console.log(`   ... y ${failures.length - 5} más`)
      }
    }

    return {
      failures,
      passed,
      total: products.length,
    }
  } catch (error) {
    console.error('❌ Error al probar filtro:', error)
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
  console.log('🧪 PRUEBA COMPLETA DE TODOS LOS FILTROS\n')
  console.log('='.repeat(60))

  const results: { name: string; result: TestResult }[] = []

  console.log('\n📥 Obteniendo opciones de filtros disponibles...')
  const filterOptions = await getFilterOptions()

  console.log(`\n${'='.repeat(60)}`)
  console.log('🏷️  FILTROS DE PRECIO')
  console.log('='.repeat(60))

  results.push({
    name: '💰 Precio: máximo 5000',
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
    name: '💰 Precio: mínimo 1000',
    result: await testFilter('Precio mínimo 1000', { priceMin: '1000' }, (p) => {
      const price = parseFloat(p.priceRange.minVariantPrice.amount)
      return price >= 1000
        ? { passed: true }
        : {
            actual: `$${price}`,
            expected: '>= $1000',
            passed: false,
            reason: 'Precio menor al mínimo',
          }
    }),
  })

  results.push({
    name: '💰 Precio: rango 1000-5000',
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

  console.log(`\n${'='.repeat(60)}`)
  console.log('👤 FILTROS DE ARTISTA')
  console.log('='.repeat(60))

  const sampleVendor = filterOptions.artists[0]?.input
  if (sampleVendor && sampleVendor !== 'Evento') {
    results.push({
      name: `👤 Artista: ${sampleVendor}`,
      result: await testFilter(`Artista: ${sampleVendor}`, { vendor: sampleVendor }, (p) =>
        p.vendor === sampleVendor
          ? { passed: true }
          : {
              actual: p.vendor,
              expected: sampleVendor,
              passed: false,
              reason: 'Artista no coincide',
            }
      ),
    })
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('🎨 FILTROS DE TIPO DE OBRA')
  console.log('='.repeat(60))

  const sampleProductType = filterOptions.productTypes[0]?.input
  if (sampleProductType) {
    results.push({
      name: `🎨 Tipo: ${sampleProductType}`,
      result: await testFilter(
        `Tipo de obra: ${sampleProductType}`,
        { artworkType: sampleProductType },
        (p) =>
          p.productType === sampleProductType
            ? { passed: true }
            : {
                actual: p.productType,
                expected: sampleProductType,
                passed: false,
                reason: 'Tipo de obra no coincide',
              }
      ),
    })
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('🖌️  FILTROS DE TÉCNICA')
  console.log('='.repeat(60))

  const sampleTechnique = filterOptions.techniques[0]?.input
  if (sampleTechnique) {
    results.push({
      name: `🖌️  Técnica: ${sampleTechnique}`,
      result: await testFilter(
        `Técnica: ${sampleTechnique}`,
        { technique: sampleTechnique },
        (p) =>
          p.artworkDetails?.medium === sampleTechnique
            ? { passed: true }
            : {
                actual: p.artworkDetails?.medium || 'N/A',
                expected: sampleTechnique,
                passed: false,
                reason: 'Técnica no coincide',
              }
      ),
    })
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log('📊 RESUMEN FINAL')
  console.log('='.repeat(60))

  let totalTests = 0
  let passedTests = 0

  for (const { name, result } of results) {
    totalTests++
    if (result.passed) passedTests++

    const status = result.passed ? '✅' : '❌'
    const info =
      result.total > 0
        ? `${result.total} productos, ${result.failures.length} errores`
        : 'Sin resultados'
    console.log(`${status} ${name}: ${info}`)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`\n🎯 Resultado: ${passedTests}/${totalTests} pruebas exitosas`)

  if (passedTests === totalTests) {
    console.log('🎉 ¡Todos los filtros funcionan correctamente!')
    process.exit(0)
  } else {
    console.log('⚠️  Algunos filtros tienen problemas')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Error fatal:', error)
  process.exit(1)
})
