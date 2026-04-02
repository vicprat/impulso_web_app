const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')

const artworkManagerPool = new Pool({
  connectionString: 'use the connection string from the supabase'
})

const prisma = new PrismaClient()

async function extractFromArtworkManager() {
  console.log('🔍 Extrayendo datos de artwork_manager...')

  try {

    const artworkTypesResult = await artworkManagerPool.query(`
      SELECT id, name
      FROM artwork_types
      ORDER BY name ASC
    `)

    const techniquesResult = await artworkManagerPool.query(`
      SELECT id, name
      FROM techniques
      ORDER BY name ASC
    `)

    const locationsResult = await artworkManagerPool.query(`
      SELECT id, name
      FROM locations
      ORDER BY name ASC
    `)

    const artistsResult = await artworkManagerPool.query(`
      SELECT id, name
      FROM artists
      ORDER BY name ASC
    `)

    return {
      artworkTypes: artworkTypesResult.rows,
      techniques: techniquesResult.rows,
      locations: locationsResult.rows,
      artists: artistsResult.rows,
    }
  } catch (error) {
    console.error('❌ Error conectando a artwork_manager:', error.message)
    throw error
  }
}

async function insertIntoWebApp(data) {
  console.log('📝 Insertando datos en web_app...')

  console.log('📝 Insertando tipos de obra...')
  for (const type of data.artworkTypes) {
    try {
      await prisma.artworkType.upsert({
        where: { name: type.name },
        update: {},
        create: {
          name: type.name,
          isActive: true,
        },
      })
      console.log(`✅ Tipo de obra: ${type.name}`)
    } catch (error) {
      console.error(`❌ Error insertando tipo de obra ${type.name}:`, error.message)
    }
  }

  console.log('\n🎨 Insertando técnicas...')
  for (const technique of data.techniques) {
    try {
      await prisma.technique.upsert({
        where: { name: technique.name },
        update: {},
        create: {
          name: technique.name,
          isActive: true,
        },
      })
      console.log(`✅ Técnica: ${technique.name}`)
    } catch (error) {
      console.error(`❌ Error insertando técnica ${technique.name}:`, error.message)
    }
  }

  console.log('\n📍 Insertando localizaciones...')
  for (const location of data.locations) {
    try {
      await prisma.location.upsert({
        where: { name: location.name },
        update: {},
        create: {
          name: location.name,
          isActive: true,
        },
      })
      console.log(`✅ Localización: ${location.name}`)
    } catch (error) {
      console.error(`❌ Error insertando localización ${location.name}:`, error.message)
    }
  }

  console.log('\n👨‍🎨 Artistas encontrados:', data.artists.length)
  console.log('Nota: Los artistas ya están en la tabla artists de web_app')
}

async function showSummary() {
  console.log('\n📊 Resumen de datos insertados:')

  const artworkTypesCount = await prisma.artworkType.count({ where: { isActive: true } })
  const techniquesCount = await prisma.technique.count({ where: { isActive: true } })
  const locationsCount = await prisma.location.count({ where: { isActive: true } })

  console.log(`📝 Tipos de obra: ${artworkTypesCount}`)
  console.log(`🎨 Técnicas: ${techniquesCount}`)
  console.log(`📍 Localizaciones: ${locationsCount}`)
}

async function main() {
  try {
    console.log('🚀 Iniciando migración desde artwork_manager...\n')

    const data = await extractFromArtworkManager()

    console.log(`📊 Datos encontrados en artwork_manager:`)
    console.log(`- Tipos de obra: ${data.artworkTypes.length}`)
    console.log(`- Técnicas: ${data.techniques.length}`)
    console.log(`- Localizaciones: ${data.locations.length}`)
    console.log(`- Artistas: ${data.artists.length}\n`)

    await insertIntoWebApp(data)

    await showSummary()

    console.log('\n✅ Migración completada exitosamente!')
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await artworkManagerPool.end()
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

module.exports = { main }