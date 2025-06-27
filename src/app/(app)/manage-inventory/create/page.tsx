'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Form } from '@/components/Forms'
import { Button } from '@/components/ui/button'
import { useCreateProduct } from '@/services/product/hook'
import { type CreateProductPayload } from '@/services/product/types'

export default function CreateProductPage() {
  const router = useRouter()
  const createMutation = useCreateProduct()

  const handleSave = async (payload: CreateProductPayload) => {
    try {
      const newProduct = await createMutation.mutateAsync(payload)

      toast.success('Producto creado exitosamente')

      const productId = newProduct.id.split('/').pop()
      router.push(`/manage-inventory/${productId}`)
    } catch (error) {
      toast.error(
        `Error al crear producto: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
    }
  }

  const handleCancel = () => {
    router.push('/manage-inventory')
  }

  return (
    <div className='container mx-auto space-y-6 py-6'>
      <div>
        <div className='mb-2 flex items-center space-x-2 text-sm text-muted-foreground'>
          <Link href='/manage-inventory' className='hover:text-foreground'>
            Gestión de Inventario
          </Link>
          <span>/</span>
          <span>Crear Producto</span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button variant='outline' size='sm' onClick={() => router.push('/manage-inventory')}>
              <ArrowLeft className='mr-2 size-4' />
              Volver
            </Button>
            <h1 className='text-2xl font-bold'>Crear Nueva Obra</h1>
          </div>
        </div>
      </div>

      <Form.Product
        mode='create'
        onSave={handleSave}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
