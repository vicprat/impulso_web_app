#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

// Cargar variables de entorno desde .env
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    const lines = envContent.split('\n')
    
    lines.forEach(line => {
      const trimmedLine = line.trim()
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=')
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '')
          process.env[key] = value
        }
      }
    })
  }
}

async function checkWebhooks(): Promise<any[]> {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE?.replace('https://', '')
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION

  if (!storeDomain || !accessToken || !apiVersion) {
    throw new Error('Variables de Shopify no configuradas')
  }

  const url = `https://${storeDomain}/admin/api/${apiVersion}/webhooks.json`
  const response = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': accessToken,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching webhooks: ${response.status}`)
  }

  const data = await response.json()
  return data.webhooks || []
}

async function checkSystem() {
  // Cargar variables de entorno
  loadEnvFile()
  
  console.log('🔍 Verificando estado del sistema...\n')

  try {
    // Verificar variables de entorno de Shopify
    console.log('🔧 Variables de entorno de Shopify:')
    const shopifyEnvVars = [
      'NEXT_PUBLIC_SHOPIFY_STORE',
      'SHOPIFY_ADMIN_ACCESS_TOKEN',
      'NEXT_PUBLIC_SHOPIFY_API_VERSION',
    ]

    const shopifyEnvConfigured = shopifyEnvVars.filter(v => process.env[v]).length
    
    shopifyEnvVars.forEach((envVar) => {
      const value = process.env[envVar]
      const status = value ? '✅' : '❌'
      const displayValue = value ? `${value.substring(0, 20)}...` : 'No configurado'
      console.log(`  ${status} ${envVar}: ${displayValue}`)
    })

    // Solo intentar verificar webhooks si las variables de Shopify están configuradas
    if (shopifyEnvConfigured === shopifyEnvVars.length) {
      try {
        // Verificar webhooks configurados
        console.log('\n📋 Webhooks configurados:')
        const webhooks = await checkWebhooks()
        
        if (webhooks.length === 0) {
          console.log('  ❌ No hay webhooks configurados')
          console.log('  💡 Ejecuta: npm run setup-webhooks')
        } else {
          webhooks.forEach((webhook) => {
            const status = webhook.address ? '✅' : '❌'
            console.log(`  ${status} ${webhook.topic}: ${webhook.address || 'No configurado'}`)
          })
        }
      } catch (error) {
        console.log('\n⚠️ No se pudieron verificar webhooks:')
        console.log('  Error:', error instanceof Error ? error.message : 'Error desconocido')
        console.log('  💡 Verifica las variables de entorno de Shopify')
      }
    } else {
      console.log('\n⚠️ Variables de Shopify no configuradas')
      console.log('  💡 Configura las variables de entorno para verificar webhooks')
    }

    // Verificar variables de entorno generales
    console.log('\n🔧 Variables de entorno generales:')
    const requiredEnvVars = [
      'NEXTAUTH_URL',
      'SHOPIFY_WEBHOOK_SECRET',
      'REVALIDATION_SECRET',
    ]

    requiredEnvVars.forEach((envVar) => {
      const value = process.env[envVar]
      const status = value ? '✅' : '❌'
      const displayValue = value ? `${value.substring(0, 20)}...` : 'No configurado'
      console.log(`  ${status} ${envVar}: ${displayValue}`)
    })

    // Verificar endpoints
    console.log('\n🌐 Endpoints de verificación:')
    const appUrl = process.env.NEXTAUTH_URL
    if (appUrl) {
      const endpoints = [
        '/api/webhooks/shopify/products',
        '/api/webhooks/shopify/inventory',
        '/api/revalidate',
      ]

      endpoints.forEach((endpoint) => {
        console.log(`  🔗 ${appUrl}${endpoint}`)
      })
    } else {
      console.log('  ❌ NEXTAUTH_URL no configurado')
    }

    // Resumen
    console.log('\n📊 Resumen:')
    const envVarsConfigured = requiredEnvVars.filter(v => process.env[v]).length
    
    console.log(`  Variables de Shopify: ${shopifyEnvConfigured}/${shopifyEnvVars.length}`)
    console.log(`  Variables generales: ${envVarsConfigured}/${requiredEnvVars.length}`)
    
    if (shopifyEnvConfigured === shopifyEnvVars.length && envVarsConfigured === requiredEnvVars.length) {
      console.log('\n✅ Sistema configurado correctamente')
      console.log('  💡 Ejecuta: npm run setup-webhooks')
    } else {
      console.log('\n⚠️ Sistema requiere configuración adicional')
      console.log('  💡 Configura las variables de entorno faltantes')
      
      if (!process.env.NEXTAUTH_URL) {
        console.log('  📝 Verifica NEXTAUTH_URL en tu archivo .env')
      }
      if (!process.env.REVALIDATION_SECRET) {
        console.log('  📝 Verifica REVALIDATION_SECRET en tu archivo .env')
      }
    }

  } catch (error) {
    console.error('❌ Error verificando sistema:', error)
    process.exit(1)
  }
}

checkSystem() 