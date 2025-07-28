import { type NextRequest, NextResponse } from 'next/server'

import { processImageToWebP } from '@/lib/imageProcessing'
import { makeAdminApiRequest } from '@/lib/shopifyAdmin'
import { requirePermission } from '@/modules/auth/server/server'
import { PERMISSIONS } from '@/src/config/Permissions'

const STAGED_UPLOADS_CREATE_MUTATION = `
  mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets {
        url
        resourceUrl
        parameters {
          name
          value
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

interface StagedUploadParameter {
  name: string
  value: string
}

interface StagedTarget {
  url: string
  resourceUrl: string
  parameters: StagedUploadParameter[]
}

interface StagedUploadsCreateResponse {
  stagedUploadsCreate: {
    stagedTargets: StagedTarget[]
    userErrors: {
      field: string
      message: string
    }[]
  }
}

export async function POST(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.MANAGE_OWN_PRODUCTS)

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No se ha proporcionado ningún archivo.' }, { status: 400 })
    }

    const fileBuffer = await file.arrayBuffer()

    // Procesar imagen a WebP usando la utilidad abstraída
    const processedImage = await processImageToWebP(fileBuffer, file.name, {
      maxHeight: 2048,
      maxWidth: 2048,
      quality: 80,
    })

    const { buffer: webpBuffer, filename } = processedImage

    const stagedUploadsInput = {
      filename,
      httpMethod: 'POST',
      mimeType: 'image/webp',
      resource: 'PRODUCT_IMAGE',
    }

    const stagedUploadsResponse = (await makeAdminApiRequest(STAGED_UPLOADS_CREATE_MUTATION, {
      input: [stagedUploadsInput],
    })) as StagedUploadsCreateResponse

    const userErrors = stagedUploadsResponse.stagedUploadsCreate.userErrors
    if (userErrors.length > 0) {
      return NextResponse.json(
        {
          details: userErrors,
          error: 'Error de Shopify al preparar la subida.',
        },
        { status: 500 }
      )
    }

    if (!stagedUploadsResponse.stagedUploadsCreate.stagedTargets.length) {
      return NextResponse.json(
        { error: 'No se obtuvieron URLs de subida de Shopify.' },
        { status: 500 }
      )
    }

    const stagedTarget = stagedUploadsResponse.stagedUploadsCreate.stagedTargets[0]

    const keyParameter = stagedTarget.parameters.find((param) => param.name === 'key')
    if (!keyParameter) {
      return NextResponse.json(
        { error: 'Parámetro key faltante en staged upload.' },
        { status: 500 }
      )
    }

    const uploadFormData = new FormData()

    stagedTarget.parameters.forEach(({ name, value }: StagedUploadParameter) => {
      uploadFormData.append(name, value)
    })

    const uint8Array = new Uint8Array(webpBuffer)
    const blob = new Blob([uint8Array], { type: 'image/webp' })
    uploadFormData.append('file', blob, filename)

    const uploadResponse = await fetch(stagedTarget.url, {
      body: uploadFormData,
      method: 'POST',
    })

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text()
      return NextResponse.json(
        {
          details: { error: errorText, status: uploadResponse.status },
          error: 'No se pudo subir el archivo a Google Cloud.',
        },
        { status: 500 }
      )
    }

    const fullResourceUrl = `${stagedTarget.url.replace(/\/$/, '')}/${keyParameter.value}`

    if (!fullResourceUrl.startsWith('http')) {
      return NextResponse.json(
        {
          details: { resourceUrl: fullResourceUrl },
          error: 'URL de recurso inválida construida.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        filename,
        resourceUrl: fullResourceUrl,
        size: webpBuffer.length,
      },
      { status: 201 }
    )
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'

    console.error('Error crítico en la subida:', {
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
