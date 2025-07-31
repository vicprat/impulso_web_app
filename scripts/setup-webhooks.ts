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

async function main() {
  // Cargar variables de entorno
  loadEnvFile()
  
  try {
    const { ShopifyWebhookService } = await import('@/lib/shopifyWebhooks')
    
    console.log('🚀 Iniciando configuración de webhooks de Shopify...')
    
    // Limpiar webhooks antiguos
    console.log('🧹 Limpiando webhooks antiguos...')
    await ShopifyWebhookService.cleanupOldWebhooks()
    
    // Configurar nuevos webhooks
    console.log('⚙️ Configurando nuevos webhooks...')
    await ShopifyWebhookService.setupWebhooks()
    
    // Listar webhooks configurados
    console.log('📋 Listando webhooks configurados...')
    const webhooks = await ShopifyWebhookService.listWebhooks()
    
    console.log('\n✅ Configuración completada exitosamente!')
    console.log('\n📊 Webhooks activos:')
    webhooks.forEach((webhook) => {
      console.log(`  - ${webhook.topic}: ${webhook.endpoint?.callbackUrl}`)
    })
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error)
    process.exit(1)
  }
}

main() 