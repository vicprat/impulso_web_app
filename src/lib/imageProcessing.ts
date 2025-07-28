import sharp from 'sharp'

export interface ImageProcessingOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  withoutEnlargement?: boolean
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ProcessedImage {
  buffer: Buffer
  filename: string
  mimeType: string
  size: number
  width?: number
  height?: number
}

/**
 * Procesa una imagen convirtiéndola a WebP y optimizándola
 * @param fileBuffer - Buffer del archivo original
 * @param originalFilename - Nombre original del archivo
 * @param options - Opciones de procesamiento
 * @returns Objeto con la imagen procesada
 */
export async function processImageToWebP(
  fileBuffer: ArrayBuffer,
  originalFilename: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    fit = 'inside',
    maxHeight = 2048,
    maxWidth = 2048,
    quality = 80,
    withoutEnlargement = true,
  } = options

  // Obtener información de la imagen original
  const originalImage = sharp(Buffer.from(fileBuffer))
  const metadata = await originalImage.metadata()

  // Procesar la imagen
  const processedBuffer = await originalImage
    .webp({ quality })
    .resize(maxWidth, maxHeight, { fit, withoutEnlargement })
    .toBuffer()

  // Generar nuevo nombre de archivo con extensión .webp
  const filename = originalFilename.replace(/\.[^/.]+$/, '.webp')

  return {
    buffer: processedBuffer,
    filename,
    height: metadata.height,
    mimeType: 'image/webp',
    size: processedBuffer.length,
    width: metadata.width,
  }
}

/**
 * Procesa una imagen con formato específico
 * @param fileBuffer - Buffer del archivo original
 * @param originalFilename - Nombre original del archivo
 * @param options - Opciones de procesamiento
 * @returns Objeto con la imagen procesada
 */
export async function processImage(
  fileBuffer: ArrayBuffer,
  originalFilename: string,
  options: ImageProcessingOptions = {}
): Promise<ProcessedImage> {
  const {
    fit = 'inside',
    format = 'webp',
    maxHeight = 2048,
    maxWidth = 2048,
    quality = 80,
    withoutEnlargement = true,
  } = options

  // Obtener información de la imagen original
  const originalImage = sharp(Buffer.from(fileBuffer))
  const metadata = await originalImage.metadata()

  let processedBuffer: Buffer
  let mimeType: string
  let filename: string

  // Procesar según el formato especificado
  switch (format) {
    case 'webp':
      processedBuffer = await originalImage
        .webp({ quality })
        .resize(maxWidth, maxHeight, { fit, withoutEnlargement })
        .toBuffer()
      mimeType = 'image/webp'
      filename = originalFilename.replace(/\.[^/.]+$/, '.webp')
      break

    case 'jpeg':
      processedBuffer = await originalImage
        .jpeg({ quality })
        .resize(maxWidth, maxHeight, { fit, withoutEnlargement })
        .toBuffer()
      mimeType = 'image/jpeg'
      filename = originalFilename.replace(/\.[^/.]+$/, '.jpg')
      break

    case 'png':
      processedBuffer = await originalImage
        .png({ quality })
        .resize(maxWidth, maxHeight, { fit, withoutEnlargement })
        .toBuffer()
      mimeType = 'image/png'
      filename = originalFilename.replace(/\.[^/.]+$/, '.png')
      break

    default:
      throw new Error(`Formato no soportado: ${format}`)
  }

  return {
    buffer: processedBuffer,
    filename,
    height: metadata.height,
    mimeType,
    size: processedBuffer.length,
    width: metadata.width,
  }
}

/**
 * Valida si un archivo es una imagen válida
 * @param file - Archivo a validar
 * @param maxSize - Tamaño máximo en bytes
 * @returns true si es válido, false en caso contrario
 */
export function validateImageFile(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  // Verificar tipo de archivo
  if (!file.type.startsWith('image/')) {
    return false
  }

  // Verificar tamaño
  if (file.size > maxSize) {
    return false
  }

  return true
}

/**
 * Genera un nombre único para el archivo
 * @param originalFilename - Nombre original del archivo
 * @param folder - Carpeta opcional
 * @returns Nombre único del archivo
 */
export function generateUniqueFilename(originalFilename: string, folder?: string): string {
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const extension = originalFilename.split('.').pop()
  
  const baseName = originalFilename.replace(/\.[^/.]+$/, '')
  const uniqueName = `${baseName}_${timestamp}_${randomId}.${extension}`
  
  return folder ? `${folder}/${uniqueName}` : uniqueName
}

/**
 * Configuraciones predefinidas para diferentes tipos de imágenes
 */
export const imageProcessingPresets = {
  avatar: {
    fit: 'inside' as const,
    format: 'webp' as const,
    maxHeight: 512,
    maxWidth: 512,
    quality: 90,
  },
  
  background: {
    fit: 'inside' as const,
    format: 'webp' as const,
    maxHeight: 1080,
    maxWidth: 1920,
    quality: 85,
  },
  
  blog: {
    fit: 'inside' as const,
    format: 'webp' as const,
    maxHeight: 800,
    maxWidth: 1200,
    quality: 85,
  },
  
  product: {
    fit: 'inside' as const,
    format: 'webp' as const,
    maxHeight: 2048,
    maxWidth: 2048,
    quality: 80,
  },
  
  thumbnail: {
    fit: 'inside' as const,
    format: 'webp' as const,
    maxHeight: 400,
    maxWidth: 400,
    quality: 90,
  },
} 