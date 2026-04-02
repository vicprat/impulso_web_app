import { createClient } from '@supabase/supabase-js'

import { processImage } from './imageProcessing'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ImageProcessingOptions } from './imageProcessing'

let supabase: SupabaseClient

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    supabase = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabase
}

export interface SupabaseUploadOptions extends ImageProcessingOptions {
  bucket?: string
  folder?: string
  public?: boolean
}

export interface SupabaseUploadResult {
  url: string
  path: string
  size: number
  filename: string
}
export async function uploadImageToSupabase(
  fileBuffer: ArrayBuffer,
  originalFilename: string,
  options: SupabaseUploadOptions = {}
): Promise<SupabaseUploadResult> {
  const {
    bucket = 'images',
    folder = 'general',
    format = 'webp',
    maxHeight = 2048,
    maxWidth = 2048,
    public: isPublic = true,
    quality = 80,
  } = options

  try {
    const client = getSupabaseClient()

    const processedImage = await processImage(fileBuffer, originalFilename, {
      format,
      maxHeight,
      maxWidth,
      quality,
    })

    const uniqueFilename = `${folder}/${processedImage.filename}`
    const filePath = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${uniqueFilename}`

    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, processedImage.buffer, {
        contentType: processedImage.mimeType,
        upsert: false,
      })

    if (error) {
      throw new Error(`Error al subir a Supabase: ${error.message}`)
    }

    const { data: urlData } = client.storage.from(bucket).getPublicUrl(filePath)

    return {
      filename: processedImage.filename,
      path: filePath,
      size: processedImage.size,
      url: urlData.publicUrl,
    }
  } catch (error) {
    throw new Error(
      `Error en uploadImageToSupabase: ${error instanceof Error ? error.message : 'Error desconocido'}`
    )
  }
}

export async function uploadProfileImage(
  fileBuffer: ArrayBuffer,
  originalFilename: string
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(fileBuffer, originalFilename, {
    bucket: 'images',
    folder: 'profile',
    format: 'webp',
    maxHeight: 512,
    maxWidth: 512,
    quality: 90,
  })
}

export async function uploadBackgroundImage(
  fileBuffer: ArrayBuffer,
  originalFilename: string
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(fileBuffer, originalFilename, {
    bucket: 'images',
    folder: 'backgrounds',
    format: 'webp',
    maxHeight: 1080,
    maxWidth: 1920,
    quality: 85,
  })
}

export async function uploadBlogImage(
  fileBuffer: ArrayBuffer,
  originalFilename: string
): Promise<SupabaseUploadResult> {
  return uploadImageToSupabase(fileBuffer, originalFilename, {
    bucket: 'images',
    folder: 'blog',
    format: 'webp',
    maxHeight: 800,
    maxWidth: 1200,
    quality: 85,
  })
}

export async function deleteImageFromSupabase(
  filePath: string,
  bucket = 'images'
): Promise<boolean> {
  try {
    const client = getSupabaseClient()
    const { error } = await client.storage.from(bucket).remove([filePath])

    if (error) {
      throw new Error(`Error al eliminar de Supabase: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Error eliminando imagen:', error)
    return false
  }
}

export async function listImagesInFolder(folder: string, bucket = 'images'): Promise<string[]> {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.storage.from(bucket).list(folder)

    if (error) {
      throw new Error(`Error al listar archivos: ${error.message}`)
    }

    return data?.map((file) => file.name) || []
  } catch (error) {
    console.error('Error listando imágenes:', error)
    return []
  }
}
