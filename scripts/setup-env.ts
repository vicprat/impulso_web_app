#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

const ENV_TEMPLATE = `# Variables de entorno para Impulso Galería

# URL de la aplicación
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Shopify Store
NEXT_PUBLIC_SHOPIFY_STORE=tu-tienda.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=tu_admin_token_aqui
NEXT_PUBLIC_SHOPIFY_API_VERSION=2024-01

# Secret para webhooks de Shopify
SHOPIFY_WEBHOOK_SECRET=tu_secret_aqui

# Token para revalidación manual
REVALIDATION_TOKEN=tu_token_aqui

# Otras variables existentes...
`

function setupEnv() {
  console.log('🔧 Configurando variables de entorno...\n')

  const envPath = path.join(process.cwd(), '.env.local')
  
  // Verificar si ya existe .env.local
  if (fs.existsSync(envPath)) {
    console.log('⚠️  El archivo .env.local ya existe')
    console.log('   Revisa que contenga las siguientes variables:\n')
  } else {
    console.log('📝 Creando archivo .env.local...')
    fs.writeFileSync(envPath, ENV_TEMPLATE)
    console.log('✅ Archivo .env.local creado\n')
  }

  console.log('📋 Variables requeridas:')
  console.log('')
  console.log('🔗 NEXT_PUBLIC_APP_URL')
  console.log('   URL de tu aplicación (ej: https://impulsogaleria.com)')
  console.log('')
  console.log('🏪 NEXT_PUBLIC_SHOPIFY_STORE')
  console.log('   Dominio de tu tienda Shopify (ej: impulso-galeria.myshopify.com)')
  console.log('')
  console.log('🔑 SHOPIFY_ADMIN_ACCESS_TOKEN')
  console.log('   Token de acceso de la API de administración de Shopify')
  console.log('   Obténlo en: Shopify Admin > Apps > Desarrollar apps > API credentials')
  console.log('')
  console.log('🔐 SHOPIFY_WEBHOOK_SECRET')
  console.log('   Secret para verificar webhooks de Shopify')
  console.log('   Puedes generar uno con: openssl rand -base64 32')
  console.log('')
  console.log('🎫 REVALIDATION_TOKEN')
  console.log('   Token para revalidación manual del cache')
  console.log('   Puedes generar uno con: openssl rand -base64 32')
  console.log('')
  console.log('📚 NEXT_PUBLIC_SHOPIFY_API_VERSION')
  console.log('   Versión de la API de Shopify (ej: 2024-01)')
  console.log('')

  console.log('💡 Pasos siguientes:')
  console.log('1. Edita el archivo .env.local con tus valores')
  console.log('2. Ejecuta: npm run check-system')
  console.log('3. Ejecuta: npm run setup-webhooks')
  console.log('')
}

setupEnv() 