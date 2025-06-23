import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/modules/auth/server/server';
import { makeAdminApiRequest } from '@/lib/shopifyAdmin';
import sharp from 'sharp';

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
`;

interface StagedUploadParameter {
    name: string;
    value: string;
}

interface StagedTarget {
    url: string;
    resourceUrl: string;
    parameters: StagedUploadParameter[];
}

interface StagedUploadsCreateResponse {
    stagedUploadsCreate: {
        stagedTargets: StagedTarget[];
        userErrors: {
            field: string;
            message: string;
        }[];
    };
}

export async function POST(request: NextRequest) {
    try {
        await requirePermission('manage_own_products');

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No se ha proporcionado ningún archivo.' }, { status: 400 });
        }

        const fileBuffer = await file.arrayBuffer();

        const webpBuffer = await sharp(Buffer.from(fileBuffer))
            .webp({ quality: 80 }) 
            .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();

        const filename = file.name.replace(/\.[^/.]+$/, ".webp");

        const stagedUploadsInput = {
            resource: 'PRODUCT_IMAGE',
            filename: filename,
            mimeType: 'image/webp',
            httpMethod: 'POST',
        };

        const stagedUploadsResponse = await makeAdminApiRequest(STAGED_UPLOADS_CREATE_MUTATION, {
            input: [stagedUploadsInput]
        }) as StagedUploadsCreateResponse;

        const userErrors = stagedUploadsResponse.stagedUploadsCreate?.userErrors;
        if (userErrors && userErrors.length > 0) {
            return NextResponse.json({ 
                error: 'Error de Shopify al preparar la subida.',
                details: userErrors 
            }, { status: 500 });
        }

        if (!stagedUploadsResponse.stagedUploadsCreate?.stagedTargets?.length) {
            return NextResponse.json({ error: 'No se obtuvieron URLs de subida de Shopify.' }, { status: 500 });
        }
        
        const stagedTarget = stagedUploadsResponse.stagedUploadsCreate.stagedTargets[0];

        const keyParameter = stagedTarget.parameters.find(param => param.name === 'key');
        if (!keyParameter) {
            return NextResponse.json({ error: 'Parámetro key faltante en staged upload.' }, { status: 500 });
        }

        const uploadFormData = new FormData();
        
        stagedTarget.parameters.forEach(({ name, value }: StagedUploadParameter) => {
            uploadFormData.append(name, value);
        });
        
        const uint8Array = new Uint8Array(webpBuffer);
        const blob = new Blob([uint8Array], { type: 'image/webp' });
        uploadFormData.append('file', blob, filename);

        const uploadResponse = await fetch(stagedTarget.url, {
            method: 'POST',
            body: uploadFormData,
        });

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            return NextResponse.json({ 
                error: 'No se pudo subir el archivo a Google Cloud.',
                details: { status: uploadResponse.status, error: errorText }
            }, { status: 500 });
        }

        const fullResourceUrl = `${stagedTarget.url.replace(/\/$/, '')}/${keyParameter.value}`;

        if (!fullResourceUrl || !fullResourceUrl.startsWith('http')) {
            return NextResponse.json({ 
                error: 'URL de recurso inválida construida.',
                details: { resourceUrl: fullResourceUrl }
            }, { status: 500 });
        }

        return NextResponse.json({ 
            resourceUrl: fullResourceUrl,
            filename: filename,
            size: webpBuffer.length
        }, { status: 201 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
        
        console.error('Error crítico en la subida:', {
            message: errorMessage,
            error: error
        });
        
        return NextResponse.json({ 
            error: 'Error interno del servidor.',
            details: errorMessage 
        }, { status: 500 });
    }
}