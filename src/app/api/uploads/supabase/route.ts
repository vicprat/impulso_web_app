import { type NextRequest, NextResponse } from 'next/server'

import { uploadBackgroundImage, uploadBlogImage, uploadImageToSupabase, uploadProfileImage } from '@/lib/supabaseStorage'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

export async function POST(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_OWN_PRODUCTS)

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'general' // 'profile', 'background', 'blog', 'general'

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo.' }, { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()

    let result

    // Usar función específica según el tipo de imagen
    switch (type) {
      case 'profile':
        result = await uploadProfileImage(fileBuffer, file.name)
        break
      case 'background':
        result = await uploadBackgroundImage(fileBuffer, file.name)
        break
      case 'blog':
        result = await uploadBlogImage(fileBuffer, file.name)
        break
      default:
        // Upload general con opciones personalizadas
        result = await uploadImageToSupabase(fileBuffer, file.name, {
          bucket: 'images',
          folder: 'general',
          quality: 85,
          maxWidth: 2048,
          maxHeight: 2048,
          format: 'webp',
        })
    }

    return NextResponse.json(
      {
        filename: result.filename,
        resourceUrl: result.url,
        size: result.size,
        path: result.path,
        type,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    console.error('Error crítico en la subida a Supabase:', {
      error,
      message: errorMessage,
    })

    return NextResponse.json(
      {
        details: errorMessage,
        error: 'Error interno del servidor.',
      },
      { status: 500 }
    )
  }
} 