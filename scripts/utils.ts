import { readFileSync } from 'fs'
import { join } from 'path'

export function loadEnvFile() {
  try {
    // Intentar cargar .env.local primero
    const envLocalPath = join(process.cwd(), '.env.local')
    const envLocalContent = readFileSync(envLocalPath, 'utf8')
    
    // Parsear variables de entorno
    const envVars = envLocalContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=')
        return { key: key.trim(), value: value.trim() }
      })
    
    // Cargar en process.env
    envVars.forEach(({ key, value }) => {
      if (key && value) {
        process.env[key] = value
      }
    })
    
    console.log('✅ Variables de entorno cargadas desde .env.local')
  } catch (error) {
    try {
      // Intentar cargar .env
      const envPath = join(process.cwd(), '.env')
      const envContent = readFileSync(envPath, 'utf8')
      
      // Parsear variables de entorno
      const envVars = envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
          const [key, ...valueParts] = line.split('=')
          const value = valueParts.join('=')
          return { key: key.trim(), value: value.trim() }
        })
      
      // Cargar en process.env
      envVars.forEach(({ key, value }) => {
        if (key && value) {
          process.env[key] = value
        }
      })
      
      console.log('✅ Variables de entorno cargadas desde .env')
    } catch (envError) {
      console.log('⚠️ No se pudo cargar archivo .env o .env.local')
      console.log('  - Asegúrate de que el archivo existe y es legible')
    }
  }
} 